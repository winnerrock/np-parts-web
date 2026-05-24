// import-json.js — create schema + import sync-output.json → Railway PostgreSQL
// ใช้: DATABASE_URL=postgresql://... node scripts/import-json.js

const { Pool } = require('pg')
const fs = require('fs')
const path = require('path')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  bcode       VARCHAR(20)   UNIQUE NOT NULL,
  pcode       VARCHAR(100),
  descr       TEXT          NOT NULL,
  model       TEXT,
  brand       VARCHAR(100),
  vendor      VARCHAR(100),
  price1      NUMERIC(10,2) DEFAULT 0,
  price2      NUMERIC(10,2) DEFAULT 0,
  price5      NUMERIC(10,2) DEFAULT 0,
  costlast    NUMERIC(10,2) DEFAULT 0,
  qtyoh2      NUMERIC(10,2) DEFAULT 0,
  location1   VARCHAR(50),
  image_url   TEXT,
  category    VARCHAR(50)   DEFAULT 'ทั่วไป',
  synced_at   TIMESTAMP     DEFAULT NOW(),
  updated_at  TIMESTAMP     DEFAULT NOW()
);
ALTER TABLE products ADD COLUMN IF NOT EXISTS price2 NUMERIC(10,2) DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand     ON products(brand);
`

async function main() {
  const jsonPath = path.join(__dirname, 'sync-output.json')
  if (!fs.existsSync(jsonPath)) {
    console.error('ไม่พบ sync-output.json — รัน sync-oil.ps1 ก่อน')
    process.exit(1)
  }

  // strip BOM ที่ PowerShell ใส่มา
  let raw = fs.readFileSync(jsonPath, 'utf8')
  if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1)
  const products = JSON.parse(raw)

  const client = await pool.connect()
  try {
    console.log('สร้าง/อัปเดต schema...')
    await client.query(SCHEMA)

    console.log(`กำลัง import ${products.length} รายการ...`)
    await client.query('BEGIN')
    let count = 0
    for (const p of products) {
      await client.query(
        `INSERT INTO products (bcode,pcode,descr,model,brand,vendor,price1,price2,price5,costlast,qtyoh2,location1,category,synced_at,updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,NOW(),NOW())
         ON CONFLICT (bcode) DO UPDATE SET
           pcode=EXCLUDED.pcode, descr=EXCLUDED.descr, model=EXCLUDED.model,
           brand=EXCLUDED.brand, vendor=EXCLUDED.vendor, price1=EXCLUDED.price1,
           price2=EXCLUDED.price2, price5=EXCLUDED.price5, costlast=EXCLUDED.costlast,
           qtyoh2=EXCLUDED.qtyoh2, location1=EXCLUDED.location1, updated_at=NOW()`,
        [p.bcode, p.pcode, p.descr, p.model, (p.brand || '').replace(/[-\s]+$/, ''), p.vendor,
         p.price1, p.price2 ?? 0, p.price5, p.costlast, p.qtyoh2, p.location1, p.category]
      )
      count++
      if (count % 100 === 0) process.stdout.write(`\r${count}/${products.length}`)
    }
    await client.query('COMMIT')
    console.log(`\nImport สำเร็จ ${count} รายการ`)
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('Error:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

main()
