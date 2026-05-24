// upload-images.js — fast parallel upload: SMB → Cloudinary → Railway DB
// ใช้: node scripts/upload-images.js

const { Pool } = require('pg')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const path = require('path')

const PICTURE_DIR = '/tmp/kss_mount/PARTS9/Picture'
const CONCURRENCY = 5  // upload พร้อมกัน 5 ตัว

const DB_URL = process.env.DATABASE_URL
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

if (!DB_URL || !CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('ขาด env variables')
  process.exit(1)
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET })
const pool = new Pool({ connectionString: DB_URL, ssl: { rejectUnauthorized: false } })

async function main() {
  if (!fs.existsSync(PICTURE_DIR)) {
    console.error('ไม่พบ SMB mount — รัน: mount -t smbfs //Administrator:admin1957@192.168.1.99/KAcc9 /tmp/kss_mount')
    process.exit(1)
  }

  // Step 1: อ่านชื่อไฟล์ทั้งหมดจาก SMB ครั้งเดียว → เก็บเป็น Map
  process.stdout.write('กำลังอ่านรายชื่อไฟล์รูปจาก SMB (ครั้งเดียว)...')
  const allFiles = fs.readdirSync(PICTURE_DIR)
  const imageMap = new Map() // bcode → full path
  for (const f of allFiles) {
    const m = f.match(/^(\d+)\.(jpg|jpeg|png)$/i)
    if (m) imageMap.set(m[1], path.join(PICTURE_DIR, f))
  }
  console.log(` พบรูป ${imageMap.size} ไฟล์`)

  // Step 2: ดึง BCODE ที่ยังไม่มีรูป
  const client = await pool.connect()
  const { rows } = await client.query(
    `SELECT bcode FROM products WHERE (image_url IS NULL OR image_url = '') ORDER BY bcode`
  )
  client.release()
  console.log(`สินค้าที่ยังไม่มีรูป: ${rows.length} รายการ`)

  // Step 3: กรองเฉพาะที่มีรูปจริง
  const toUpload = rows.filter(r => imageMap.has(r.bcode))
  const noImage = rows.length - toUpload.length
  console.log(`มีรูปพร้อม upload: ${toUpload.length} | ไม่มีรูป: ${noImage}\n`)

  if (toUpload.length === 0) {
    console.log('ไม่มีรูปให้ upload')
    await pool.end(); return
  }

  // Step 4: parallel upload
  let uploaded = 0, errors = 0
  const total = toUpload.length

  async function uploadOne({ bcode }) {
    const imgPath = imageMap.get(bcode)
    try {
      const result = await cloudinary.uploader.upload(imgPath, {
        folder: 'np-parts/oil',
        public_id: bcode,
        overwrite: false,
        resource_type: 'image',
        transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
      })
      const c = await pool.connect()
      await c.query('UPDATE products SET image_url=$1, updated_at=NOW() WHERE bcode=$2', [result.secure_url, bcode])
      c.release()
      uploaded++
    } catch (err) {
      errors++
      console.error(`\nError ${bcode}: ${err.message}`)
    }
    process.stdout.write(`\r✓ ${uploaded}/${total} uploaded | ${errors} errors | ${noImage} no-image`)
  }

  // run CONCURRENCY tasks at a time
  const queue = [...toUpload]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) {
      await uploadOne(queue.shift())
    }
  })
  await Promise.all(workers)

  console.log(`\n\nเสร็จสิ้น — uploaded: ${uploaded} | ไม่มีรูป: ${noImage} | error: ${errors}`)
  await pool.end()
}

main()
