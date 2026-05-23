# sync-oil.ps1 — ดึงน้ำมันเครื่องจาก KACC9 → Railway PostgreSQL
# ใช้: pwsh sync-oil.ps1

param(
    [string]$RailwayUrl = $env:DATABASE_URL
)

if (-not $RailwayUrl) {
    Write-Error "กรุณาตั้งค่า DATABASE_URL หรือส่ง -RailwayUrl 'postgresql://...'"
    exit 1
}

# ---- ดึงข้อมูลจาก KACC9 ----
Write-Host "กำลังดึงข้อมูลน้ำมันเครื่องจาก KACC9..." -ForegroundColor Cyan

$kacc9Conn = New-Object System.Data.SqlClient.SqlConnection(
    'Server=192.168.1.99;Database=PARTS9;User Id=sa;Password=kanesoftware;Connect Timeout=10'
)
$kacc9Conn.Open()
$cmd = $kacc9Conn.CreateCommand()
$cmd.CommandText = @"
SELECT
    BCODE, PCODE, DESCR, MODEL, BRAND, VENDOR,
    ISNULL(PRICE1,0)   AS PRICE1,
    ISNULL(PRICE2,0)   AS PRICE2,
    ISNULL(PRICE5,0)   AS PRICE5,
    ISNULL(COSTLAST,0) AS COSTLAST,
    ISNULL(QTYOH2,0)   AS QTYOH2,
    ISNULL(LOCATION1,'') AS LOCATION1
FROM ICMAS
WHERE DESCR LIKE N'%น้ำมันเครื่อง%'
  AND CANCELED = 'N'
  AND PRICE1 > 0
ORDER BY BRAND, DESCR
"@

$da = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
$dt = New-Object System.Data.DataTable
$da.Fill($dt) | Out-Null
$kacc9Conn.Close()

Write-Host "ดึงได้ $($dt.Rows.Count) รายการ" -ForegroundColor Green

# ---- push ไป Railway PostgreSQL ----
Write-Host "กำลัง upsert ไป Railway PostgreSQL..." -ForegroundColor Cyan

# parse DATABASE_URL → Npgsql connection string
# format: postgresql://user:pass@host:port/db
$uri = [Uri]$RailwayUrl
$pgHost = $uri.Host
$pgPort = if ($uri.Port -gt 0) { $uri.Port } else { 5432 }
$pgDb   = $uri.AbsolutePath.TrimStart('/')
$pgUser = $uri.UserInfo.Split(':')[0]
$pgPass = $uri.UserInfo.Split(':')[1]

# ใช้ psql ถ้ามี หรือ node script
$psql = Get-Command psql -ErrorAction SilentlyContinue

if ($psql) {
    $env:PGPASSWORD = $pgPass
    $upsertSql = @()

    foreach ($row in $dt.Rows) {
        $bcode   = $row['BCODE'].ToString().Replace("'","''")
        $pcode   = $row['PCODE'].ToString().Replace("'","''")
        $descr   = $row['DESCR'].ToString().Replace("'","''")
        $model   = $row['MODEL'].ToString().Replace("'","''")
        $brand   = $row['BRAND'].ToString().Replace("'","''")
        $vendor  = $row['VENDOR'].ToString().Replace("'","''")
        $price1  = $row['PRICE1']
        $price2  = $row['PRICE2']
        $price5  = $row['PRICE5']
        $cost    = $row['COSTLAST']
        $qty     = $row['QTYOH2']
        $loc     = $row['LOCATION1'].ToString().Replace("'","''")

        $upsertSql += @"
INSERT INTO products (bcode,pcode,descr,model,brand,vendor,price1,price2,price5,costlast,qtyoh2,location1,category,synced_at,updated_at)
VALUES ('$bcode','$pcode','$descr','$model','$brand','$vendor',$price1,$price2,$price5,$cost,$qty,'$loc','น้ำมันเครื่อง',NOW(),NOW())
ON CONFLICT (bcode) DO UPDATE SET
  pcode=EXCLUDED.pcode, descr=EXCLUDED.descr, model=EXCLUDED.model,
  brand=EXCLUDED.brand, vendor=EXCLUDED.vendor, price1=EXCLUDED.price1,
  price2=EXCLUDED.price2, price5=EXCLUDED.price5, costlast=EXCLUDED.costlast,
  qtyoh2=EXCLUDED.qtyoh2, location1=EXCLUDED.location1, updated_at=NOW();
"@
    }

    $tmpFile = [System.IO.Path]::GetTempFileName() + ".sql"
    [System.IO.File]::WriteAllLines($tmpFile, $upsertSql, [System.Text.Encoding]::UTF8)

    & psql -h $pgHost -p $pgPort -U $pgUser -d $pgDb -f $tmpFile
    Remove-Item $tmpFile
    Write-Host "Sync สำเร็จ!" -ForegroundColor Green
} else {
    Write-Warning "ไม่พบ psql — ให้ติดตั้ง PostgreSQL client หรือใช้ node script แทน"
    Write-Host "Export เป็น JSON ไว้ที่ sync-output.json แทน"
    $out = @()
    foreach ($row in $dt.Rows) {
        $out += [ordered]@{
            bcode    = $row['BCODE'].ToString().Trim()
            pcode    = $row['PCODE'].ToString().Trim()
            descr    = $row['DESCR'].ToString().Trim()
            model    = $row['MODEL'].ToString().Trim()
            brand    = $row['BRAND'].ToString().Trim()
            vendor   = $row['VENDOR'].ToString().Trim()
            price1   = [double]$row['PRICE1']
            price2   = [double]$row['PRICE2']
            price5   = [double]$row['PRICE5']
            costlast = [double]$row['COSTLAST']
            qtyoh2   = [double]$row['QTYOH2']
            location1= $row['LOCATION1'].ToString().Trim()
            category = 'น้ำมันเครื่อง'
        }
    }
    $json = $out | ConvertTo-Json -Depth 3
    [System.IO.File]::WriteAllText('sync-output.json', $json, [System.Text.Encoding]::UTF8)
    Write-Host "บันทึก sync-output.json แล้ว ($($out.Count) รายการ)" -ForegroundColor Yellow
}
