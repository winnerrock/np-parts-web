-- NP อะไหล่ยนต์ - Railway PostgreSQL Schema

CREATE TABLE IF NOT EXISTS products (
  id          SERIAL PRIMARY KEY,
  bcode       VARCHAR(20)  UNIQUE NOT NULL,
  pcode       VARCHAR(100),
  descr       TEXT         NOT NULL,
  model       TEXT,
  brand       VARCHAR(100),
  vendor      VARCHAR(100),
  price1      NUMERIC(10,2) DEFAULT 0,
  price5      NUMERIC(10,2) DEFAULT 0,
  costlast    NUMERIC(10,2) DEFAULT 0,
  qtyoh2      NUMERIC(10,2) DEFAULT 0,
  location1   VARCHAR(50),
  image_url   TEXT,
  category    VARCHAR(50)  DEFAULT 'ทั่วไป',
  synced_at   TIMESTAMP    DEFAULT NOW(),
  updated_at  TIMESTAMP    DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_brand     ON products(brand);
CREATE INDEX IF NOT EXISTS idx_products_descr     ON products USING gin(to_tsvector('simple', descr));
