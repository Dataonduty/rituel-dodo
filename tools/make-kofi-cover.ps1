# Genere la banniere Ko-fi 1200x400 (nuit etoilee + lune + titre), sans dependance.
# Usage : powershell -ExecutionPolicy Bypass -File tools\make-kofi-cover.ps1

Add-Type -AssemblyName System.Drawing

$outDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'kofi'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$w = 1200; $h = 400
$bmp = New-Object System.Drawing.Bitmap($w, $h)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# Fond degrade bleu nuit
$rect = New-Object System.Drawing.Rectangle(0, 0, $w, $h)
$bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(28, 38, 88),
    [System.Drawing.Color]::FromArgb(7, 11, 28),
    90.0)
$g.FillRectangle($bg, $rect)

# Etoiles
$rand = New-Object System.Random(7)
$star = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(215, 255, 255, 255))
for ($i = 0; $i -lt 60; $i++) {
    $x = $rand.Next(15, $w - 15)
    $y = $rand.Next(15, $h - 15)
    $dx = $x - 960; $dy = $y - 200
    if ([Math]::Sqrt($dx * $dx + $dy * $dy) -lt 175) { continue }
    $r = $rand.Next(2, 5)
    $g.FillEllipse($star, $x, $y, $r, $r)
}

# Halo + pleine lune a droite
$halo1 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(22, 246, 207, 114))
$g.FillEllipse($halo1, 790, 30, 340, 340)
$halo2 = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(38, 246, 207, 114))
$g.FillEllipse($halo2, 820, 60, 280, 280)
$moonRect = New-Object System.Drawing.Rectangle(850, 90, 220, 220)
$moon = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $moonRect,
    [System.Drawing.Color]::FromArgb(255, 248, 221),
    [System.Drawing.Color]::FromArgb(238, 199, 96),
    45.0)
$g.FillEllipse($moon, $moonRect)
$crater = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(55, 170, 130, 60))
$g.FillEllipse($crater, 895, 135, 36, 36)
$g.FillEllipse($crater, 985, 195, 28, 28)
$g.FillEllipse($crater, 925, 240, 22, 22)

# Textes
$title = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(246, 231, 176))
$sub = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(170, 179, 221))
$dim = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(125, 134, 178))
$fTitle = New-Object System.Drawing.Font('Segoe UI', 52, [System.Drawing.FontStyle]::Bold)
$fSub = New-Object System.Drawing.Font('Segoe UI', 21, [System.Drawing.FontStyle]::Regular)
$fUrl = New-Object System.Drawing.Font('Segoe UI', 16, [System.Drawing.FontStyle]::Regular)
$g.DrawString('Bedtime Routine', $fTitle, $title, 62, 105)
$g.DrawString('A calm hourglass for peaceful toddler bedtimes', $fSub, $sub, 70, 210)
$g.DrawString('Free  -  no ads  -  27 languages  -  works offline', $fSub, $sub, 70, 252)
$g.DrawString('dataonduty.github.io/rituel-dodo', $fUrl, $dim, 71, 320)

$g.Dispose()
$bmp.Save((Join-Path $outDir 'cover.png'), [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()

# Avatar = icone de l'app
Copy-Item (Join-Path (Split-Path $PSScriptRoot -Parent) 'icons\icon-512.png') (Join-Path $outDir 'avatar.png') -Force

Write-Host 'kofi/cover.png et kofi/avatar.png generes.'
