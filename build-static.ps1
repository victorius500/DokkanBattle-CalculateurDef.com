# =====================================================================
# Génère la version statique du site dans dist\, prête pour Cloudflare.
#
# Le site n'utilise aucun code PHP réel : les 4 pages sont du HTML et
# tous les calculs se font en JavaScript côté navigateur. Ce script se
# contente donc de retirer l'enveloppe PHP et de réécrire les liens.
#
# Usage :  powershell -ExecutionPolicy Bypass -File build-static.ps1
# =====================================================================

$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
$dist = Join-Path $root 'dist'

Write-Host "Construction de la version statique..." -ForegroundColor Cyan

# --- 1. Repartir d'un dossier dist propre -----------------------------
if (Test-Path $dist) { Remove-Item $dist -Recurse -Force }
New-Item -ItemType Directory -Path $dist | Out-Null

# --- 2. Copier les ressources ----------------------------------------
Copy-Item (Join-Path $root 'assets') -Destination $dist -Recurse
Write-Host "  assets/ copie" -ForegroundColor Green

# --- 3. Convertir les pages PHP en HTML ------------------------------
$pages = @('index', 'Boss', 'calculatriceDokkan', 'calculatricePopup')
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($page in $pages) {
    $source = Join-Path $root "$page.php"
    if (-not (Test-Path $source)) { throw "Fichier introuvable : $source" }

    $html = Get-Content $source -Raw -Encoding UTF8

    # Retirer le bloc PHP d'ouverture (require_once config.php)
    $html = [regex]::Replace($html, '^\s*<\?php.*?\?>\s*', '', 'Singleline')

    # Reecrire les liens internes vers les nouvelles pages .html
    foreach ($target in $pages) {
        $html = $html -replace "(?<=[""'/])$target\.php", "$target.html"
    }

    $out = Join-Path $dist "$page.html"
    [System.IO.File]::WriteAllText($out, $html, $utf8NoBom)
    Write-Host "  $page.php -> $page.html" -ForegroundColor Green
}

# --- 4. Reecrire les liens .php contenus dans le JavaScript -----------
foreach ($js in Get-ChildItem (Join-Path $dist 'assets\js') -Filter *.js) {
    $code = Get-Content $js.FullName -Raw -Encoding UTF8
    $original = $code
    foreach ($target in $pages) {
        $code = $code -replace "(?<=[""'/])$target\.php", "$target.html"
    }
    if ($code -ne $original) {
        [System.IO.File]::WriteAllText($js.FullName, $code, $utf8NoBom)
        Write-Host "  liens corriges dans assets/js/$($js.Name)" -ForegroundColor Green
    }
}

# --- 5. En-tetes de securite (equivalent Cloudflare du .htaccess) -----
$headers = @'
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.plot.ly; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
'@
[System.IO.File]::WriteAllText((Join-Path $dist '_headers'), $headers, $utf8NoBom)
Write-Host "  _headers genere" -ForegroundColor Green

# --- 6. Verification : plus aucune trace de PHP ----------------------
$restes = Select-String -Path (Join-Path $dist '*.html') -Pattern '<\?php|\.php' -ErrorAction SilentlyContinue
if ($restes) {
    Write-Host "`nATTENTION - references PHP restantes :" -ForegroundColor Red
    $restes | ForEach-Object { "  $($_.Filename):$($_.LineNumber)" }
} else {
    Write-Host "`nAucune trace de PHP dans le resultat." -ForegroundColor Green
}

$taille = [math]::Round(((Get-ChildItem $dist -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 2)
Write-Host "Termine : dist\ ($taille Mo)" -ForegroundColor Cyan
