# Genere les icones PNG de l'app (fond nuit + pleine lune + etoiles), sans dependance.
# Usage : powershell -ExecutionPolicy Bypass -File tools\make-icons.ps1

Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'icons'
New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null

$size = 1024
$bmp = New-Object System.Drawing.Bitmap($size, $size)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

# Fond degrade bleu nuit
$rect = New-Object System.Drawing.Rectangle(0, 0, $size, $size)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(30, 40, 92),
    [System.Drawing.Color]::FromArgb(7, 11, 28),
    90.0)
$g.FillRectangle($bgBrush, $rect)

# Etoiles (en evitant la zone centrale de la lune)
$rand = New-Object System.Random(42)
$starBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(230, 255, 255, 255))
$placed = 0
while ($placed -lt 14) {
    $x = $rand.Next(50, $size - 50)
    $y = $rand.Next(50, $size - 50)
    $dx = $x - $size / 2.0
    $dy = $y - $size / 2.0
    if ([Math]::Sqrt($dx * $dx + $dy * $dy) -lt $size * 0.34) { continue }
    $r = $rand.Next(5, 12)
    $g.FillEllipse($starBrush, $x, $y, $r, $r)
    $placed++
}

# Halo de lune
$halo1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(26, 246, 207, 114))
$g.FillEllipse($halo1, [single]($size * 0.16), [single]($size * 0.16), [single]($size * 0.68), [single]($size * 0.68))
$halo2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(42, 246, 207, 114))
$g.FillEllipse($halo2, [single]($size * 0.205), [single]($size * 0.205), [single]($size * 0.59), [single]($size * 0.59))

# Pleine lune
$moonRect = New-Object System.Drawing.Rectangle([int]($size * 0.25), [int]($size * 0.25), [int]($size * 0.5), [int]($size * 0.5))
$moonBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $moonRect,
    [System.Drawing.Color]::FromArgb(255, 248, 221),
    [System.Drawing.Color]::FromArgb(238, 199, 96),
    45.0)
$g.FillEllipse($moonBrush, $moonRect)

# Crateres discrets
$crater = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 170, 130, 60))
$g.FillEllipse($crater, [single]($size * 0.34), [single]($size * 0.33), [single]($size * 0.09), [single]($size * 0.09))
$g.FillEllipse($crater, [single]($size * 0.55), [single]($size * 0.47), [single]($size * 0.07), [single]($size * 0.07))
$g.FillEllipse($crater, [single]($size * 0.42), [single]($size * 0.56), [single]($size * 0.055), [single]($size * 0.055))

$g.Dispose()

function Save-Resized([System.Drawing.Bitmap]$src, [int]$outSize, [string]$file) {
    $b = New-Object System.Drawing.Bitmap($outSize, $outSize)
    $gg = [System.Drawing.Graphics]::FromImage($b)
    $gg.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $gg.DrawImage($src, 0, 0, $outSize, $outSize)
    $gg.Dispose()
    $b.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
    $b.Dispose()
    Write-Host "OK  $file"
}

Save-Resized $bmp 512 (Join-Path $iconsDir 'icon-512.png')
Save-Resized $bmp 192 (Join-Path $iconsDir 'icon-192.png')
Save-Resized $bmp 180 (Join-Path $iconsDir 'apple-touch-icon.png')
$bmp.Dispose()

Write-Host 'Icones generees.'
