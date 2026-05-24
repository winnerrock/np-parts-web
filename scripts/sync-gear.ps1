# sync-gear.ps1 — ดึงน้ำมันเกียร์จาก KACC9 → Railway PostgreSQL
# ใช้: pwsh sync-gear.ps1

param(
    [string]$RailwayUrl = $env:DATABASE_URL
)

if (-not $RailwayUrl) {
    Write-Error "กรุณาตั้งค่า DATABASE_URL หรือส่ง -RailwayUrl 'postgresql://...'"
    exit 1
}

Write-Host "กำลังดึงข้อมูลน้ำมันเกียร์จาก KACC9..." -ForegroundColor Cyan

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
WHERE DESCR LIKE N'%น้ำมันเกียร์%'
  AND CANCELED = 'N'
  AND PRICE1 > 0
ORDER BY BRAND, DESCR
"@

$da = New-Object System.Data.SqlClient.SqlDataAdapter($cmd)
$dt = New-Object System.Data.DataTable
$da.Fill($dt) | Out-Null
$kacc9Conn.Close()

Write-Host "ดึงได้ $($dt.Rows.Count) รายการ" -ForegroundColor Green

Write-Host "Export เป็น JSON..."
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
        category = 'น้ำมันเกียร์'
    }
}
$json = $out | ConvertTo-Json -Depth 3
[System.IO.File]::WriteAllText('sync-output.json', $json, [System.Text.Encoding]::UTF8)
Write-Host "บันทึก sync-output.json แล้ว ($($out.Count) รายการ)" -ForegroundColor Yellow
