# NP อะไหล่ยนต์ — Deploy Guide

## ขั้นตอน Deploy ไป Railway

### 1. ตั้งค่า Railway PostgreSQL

1. เข้า [railway.app](https://railway.app) → New Project
2. เพิ่ม **PostgreSQL** plugin
3. Copy connection string (DATABASE_URL) จาก Variables tab

### 2. สร้าง Tables ใน Railway PostgreSQL

```bash
psql "$DATABASE_URL" -f scripts/schema.sql
```

หรือใช้ Railway dashboard → PostgreSQL → Query tab วาง SQL จาก `scripts/schema.sql`

### 3. Sync ข้อมูลน้ำมันเครื่องจาก KACC9

```powershell
# ต้องอยู่ใน LAN เดียวกับ server KACC9
$env:DATABASE_URL = "postgresql://user:pass@host:port/railway"
pwsh scripts/sync-oil.ps1
```

ถ้าไม่มี `psql` จะ export เป็น `sync-output.json` แทน สามารถ import ด้วย:
```bash
node scripts/import-json.js
```

### 4. ตั้งค่า Environment Variables ใน Railway

| Variable | ค่า |
|----------|-----|
| `DATABASE_URL` | Auto-inject โดย Railway PostgreSQL |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | จาก Cloudinary dashboard |
| `CLOUDINARY_API_KEY` | จาก Cloudinary dashboard |
| `CLOUDINARY_API_SECRET` | จาก Cloudinary dashboard |

### 5. Deploy

```bash
# ผูก repo กับ Railway
railway login
railway link
railway up
```

หรือ push ไป GitHub แล้วเชื่อม Railway กับ repo

---

## Logo

ใส่ไฟล์ logo ที่ `public/images/logo.png`

---

## เพิ่มรูปสินค้า (ทีหลัง)

1. Copy รูปจาก server KACC9 มาที่ local
2. Upload ไป Cloudinary ผ่าน script `scripts/upload-images.ps1` (จะสร้างทีหลัง)
3. Update `image_url` ใน Railway PostgreSQL

---

## URL Structure

| Path | คำอธิบาย |
|------|----------|
| `/` | หน้าแรก |
| `/products` | รายการสินค้าน้ำมันเครื่อง |
| `/products?q=CASTROL` | ค้นหา |
| `/products?brand=CASTROL` | กรองยี่ห้อ |
| `/products/99020614` | หน้า detail สินค้า |
| `/api/products` | REST API |
