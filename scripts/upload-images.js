// upload-images.js — upload all images per product (bcode, bcode_2, bcode_3, ...)
// ใช้: node scripts/upload-images.js

const { Pool } = require('pg')
const cloudinary = require('cloudinary').v2
const fs = require('fs')
const path = require('path')

const PICTURE_DIR = '/tmp/kss_mount/PARTS9/Picture'
const CONCURRENCY = 5

const DB_URL = process.env.DATABASE_URL
const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const API_KEY = process.env.CLOUDINARY_API_KEY
const API_SECRET = process.env.CLOUDINARY_API_SECRET

if (!DB_URL || !CLOUD_NAME || !API_KEY || !API_SECRET) {
  console.error('ขาด env variables')
  process.exit(1)
}

cloudinary.config({ cloud_name: CLOUD_NAME, api_key: API_KEY, api_secret: API_SECRET })
const pool = new Pool({
  connectionString: DB_URL,
  ssl: { rejectUnauthorized: false },
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 10000,
  keepAlive: true,
})
pool.on('error', () => {})

async function main() {
  if (!fs.existsSync(PICTURE_DIR)) {
    console.error('ไม่พบ SMB mount — รัน: mount -t smbfs //Administrator:admin1957@192.168.1.99/KAcc9 /tmp/kss_mount')
    process.exit(1)
  }

  // Step 1: อ่านไฟล์ทั้งหมด → Map: bcode → [path_1, path_2, path_3, ...]
  process.stdout.write('กำลังอ่านรายชื่อไฟล์รูปจาก SMB...')
  const allFiles = fs.readdirSync(PICTURE_DIR)
  const imageMap = new Map() // bcode → { suffix: number, filePath: string }[]

  for (const f of allFiles) {
    // match: 12345678.jpg หรือ 12345678_2.jpg
    const m = f.match(/^(\d+)(?:_(\d+))?\.(jpg|jpeg|png)$/i)
    if (!m) continue
    const bcode = m[1]
    const suffix = m[2] ? parseInt(m[2]) : 1
    if (!imageMap.has(bcode)) imageMap.set(bcode, [])
    imageMap.get(bcode).push({ suffix, filePath: path.join(PICTURE_DIR, f) })
  }

  // เรียงลำดับรูปตาม suffix
  for (const [bcode, imgs] of imageMap) {
    imgs.sort((a, b) => a.suffix - b.suffix)
  }
  console.log(` พบ ${imageMap.size} รายการที่มีรูป`)

  // Step 2: ดึงสินค้าที่ยังไม่มี image_urls
  const client = await pool.connect()
  const { rows } = await client.query(
    `SELECT bcode, image_url FROM products WHERE image_urls IS NULL ORDER BY bcode`
  )
  client.release()
  console.log(`สินค้าที่ยังไม่ได้ process หลายรูป: ${rows.length} รายการ`)

  // Step 3: กรองเฉพาะที่มีรูปจริง
  const toUpload = rows.filter(r => imageMap.has(r.bcode))
  const noImage  = rows.length - toUpload.length
  console.log(`มีรูปพร้อม upload: ${toUpload.length} | ไม่มีรูปเลย: ${noImage}\n`)

  if (toUpload.length === 0) {
    console.log('ไม่มีรูปให้ upload')
    await pool.end(); return
  }

  // Step 4: parallel upload
  let uploaded = 0, errors = 0
  const total = toUpload.length

  async function uploadOne({ bcode, image_url: existingUrl }) {
    const imgs = imageMap.get(bcode) // [{ suffix, filePath }, ...]
    const urls = []

    for (const { suffix, filePath } of imgs) {
      // รูปแรก (suffix=1): ถ้า upload ไปแล้วให้ใช้ URL เดิม
      if (suffix === 1 && existingUrl) {
        urls.push(existingUrl)
        continue
      }

      const public_id = suffix === 1 ? bcode : `${bcode}_${suffix}`
      try {
        const result = await cloudinary.uploader.upload(filePath, {
          folder: 'np-parts/products',
          public_id,
          overwrite: false,
          resource_type: 'image',
          transformation: [{ width: 800, height: 800, crop: 'limit', quality: 'auto:good' }],
        })
        urls.push(result.secure_url)
      } catch (err) {
        // already exists → ใช้ URL ที่ Cloudinary ส่งคืน
        if (err.error?.http_code === 409 || err.http_code === 409) {
          urls.push(`https://res.cloudinary.com/${CLOUD_NAME}/image/upload/np-parts/products/${public_id}`)
        } else {
          errors++
          console.error(`\nError ${public_id}: ${err.message}`)
        }
      }
    }

    if (urls.length > 0) {
      const c = await pool.connect()
      await c.query(
        'UPDATE products SET image_url=$1, image_urls=$2, updated_at=NOW() WHERE bcode=$3',
        [urls[0], urls, bcode]
      )
      c.release()
    }
    uploaded++
    process.stdout.write(`\r✓ ${uploaded}/${total} | ${errors} errors | ${noImage} no-image`)
  }

  const queue = [...toUpload]
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length > 0) await uploadOne(queue.shift())
  })
  await Promise.all(workers)

  console.log(`\n\nเสร็จสิ้น — uploaded: ${uploaded} | ไม่มีรูป: ${noImage} | error: ${errors}`)
  await pool.end()
}

main()
