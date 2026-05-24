import { NextRequest, NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q        = searchParams.get('q') || ''
  const brand    = searchParams.get('brand') || ''
  const category = searchParams.get('category') || ''
  const page     = parseInt(searchParams.get('page') || '1', 10)
  const pageSize = 20

  const conditions: string[] = ["price2 > 0"]
  const params: (string | number)[] = []
  let idx = 1

  if (category) {
    conditions.push(`category = $${idx}`)
    params.push(category)
    idx++
  }
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
         ORDER BY (image_url IS NOT NULL AND image_url != '') DESC, brand, descr
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...params, pageSize, offset]
      ),
      pool.query(
        `SELECT COUNT(*) FROM products WHERE ${where}`,
        params
      ),
      category
        ? pool.query(
            `SELECT DISTINCT brand FROM products WHERE price2 > 0 AND brand IS NOT NULL AND brand != '' AND category = $1 ORDER BY brand`,
            [category]
          )
        : pool.query(
            `SELECT DISTINCT brand FROM products WHERE price2 > 0 AND brand IS NOT NULL AND brand != '' ORDER BY brand`
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
