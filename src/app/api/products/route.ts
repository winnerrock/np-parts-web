import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q        = searchParams.get('q') || ''
  const brand    = searchParams.get('brand') || ''
  const page     = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 20

  const conditions: string[] = ["category = 'น้ำมันเครื่อง'", "price2 > 0"]
  const params: (string | number)[] = []
  let idx = 1

  if (q) {
    conditions.push(`(bcode ILIKE $${idx} OR descr ILIKE $${idx} OR brand ILIKE $${idx} OR pcode ILIKE $${idx} OR model ILIKE $${idx})`)
    params.push(`%${q}%`)
    idx++
  }
  if (brand) {
    conditions.push(`brand ILIKE $${idx}`)
    params.push(`%${brand}%`)
    idx++
  }

  const where = conditions.join(' AND ')
  const offset = (page - 1) * pageSize

  try {
    const [dataRes, countRes, brandsRes] = await Promise.all([
      pool.query(
        `SELECT bcode,pcode,descr,model,brand,price1,price2,price5,qtyoh2,image_url
         FROM products WHERE ${where}
         ORDER BY brand, descr
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, pageSize, offset]
      ),
      pool.query(
        `SELECT COUNT(*) FROM products WHERE ${where}`,
        params
      ),
      pool.query(
        `SELECT DISTINCT brand FROM products WHERE category = 'น้ำมันเครื่อง' AND price2 > 0 AND brand IS NOT NULL AND brand != '' ORDER BY brand`
      ),
    ])

    return NextResponse.json({
      products: dataRes.rows,
      total:    parseInt(countRes.rows[0].count, 10),
      page,
      pageSize,
      brands:   brandsRes.rows.map((r: { brand: string }) => r.brand),
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
}
