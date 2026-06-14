# Script para instalar Poppler en Windows
# Ejecutar como Administrador: PowerShell -ExecutionPolicy Bypass -File instalar_poppler.ps1

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Instalador de Poppler para OSINFOR Chatbot" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar si ya está instalado
Write-Host "[1/4] Verificando si Poppler ya está instalado..." -ForegroundColor Yellow
$popplerCheck = Get-Command pdftoppm -ErrorAction SilentlyContinue

if ($popplerCheck) {
    Write-Host "[OK] Poppler ya está instalado!" -ForegroundColor Green
    Write-Host "Versión: $(pdftoppm -v 2>&1 | Select-Object -First 1)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Presiona cualquier tecla para salir..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit 0
}

Write-Host "[INFO] Poppler no está instalado. Procediendo con la instalación..." -ForegroundColor Yellow
Write-Host ""

# Método 1: Chocolatey
Write-Host "[2/4] Intentando instalar con Chocolatey..." -ForegroundColor Yellow
$chocoInstalled = Get-Command choco -ErrorAction SilentlyContinue

if ($chocoInstalled) {
    Write-Host "[OK] Chocolatey detectado. Instalando Poppler..." -ForegroundColor Green
    try {
        choco install poppler -y
        Write-Host "[OK] Poppler instalado correctamente!" -ForegroundColor Green
        Write-Host ""
        Write-Host "[IMPORTANTE] Cierra y vuelve a abrir el terminal para aplicar cambios." -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Presiona cualquier tecla para salir..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 0
    }
    catch {
        Write-Host "[ERROR] Falló la instalación con Chocolatey." -ForegroundColor Red
    }
}
else {
    Write-Host "[INFO] Chocolatey no está instalado." -ForegroundColor Yellow
}

# Método 2: Descarga manual
Write-Host ""
Write-Host "[3/4] Descargando Poppler manualmente..." -ForegroundColor Yellow

$popplerUrl = "https://github.com/oschwartz10612/poppler-windows/releases/download/v24.08.0-0/Release-24.08.0-0.zip"
$downloadPath = "$env:TEMP\poppler.zip"
$extractPath = "C:\Program Files\poppler-24.08.0"

try {
    Write-Host "Descargando desde GitHub..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $popplerUrl -OutFile $downloadPath -UseBasicParsing
    Write-Host "[OK] Descarga completa!" -ForegroundColor Green
    
    Write-Host "Extrayendo archivos..." -ForegroundColor Yellow
    Expand-Archive -Path $downloadPath -DestinationPath $extractPath -Force
    Write-Host "[OK] Archivos extraídos!" -ForegroundColor Green
    
    # Añadir al PATH
    Write-Host ""
    Write-Host "[4/4] Configurando PATH del sistema..." -ForegroundColor Yellow
    $popplerBinPath = "$extractPath\poppler-24.08.0\Library\bin"
    
    $currentPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::Machine)
    
    if ($currentPath -notlike "*$popplerBinPath*") {
        $newPath = $currentPath + ";" + $popplerBinPath
        [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::Machine)
        Write-Host "[OK] PATH actualizado!" -ForegroundColor Green
    }
    
    # Limpiar archivo temporal
    Remove-Item $downloadPath -Force
    
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host "  INSTALACIÓN COMPLETA!" -ForegroundColor Green
    Write-Host "==================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Poppler instalado en: $extractPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[IMPORTANTE] DEBES HACER LO SIGUIENTE:" -ForegroundColor Yellow
    Write-Host "1. Cierra TODOS los terminales y PowerShells abiertos" -ForegroundColor White
    Write-Host "2. Abre un nuevo terminal" -ForegroundColor White
    Write-Host "3. Verifica con: pdftoppm -v" -ForegroundColor White
    Write-Host "4. Reinicia el servidor: python app.py" -ForegroundColor White
    Write-Host ""
}
catch {
    Write-Host ""
    Write-Host "[ERROR] Falló la instalación automática." -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "==================================================" -ForegroundColor Yellow
    Write-Host "  INSTALACIÓN MANUAL REQUERIDA" -ForegroundColor Yellow
    Write-Host "==================================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Por favor, instala manualmente:" -ForegroundColor White
    Write-Host "1. Ve a: https://github.com/oschwartz10612/poppler-windows/releases/" -ForegroundColor Cyan
    Write-Host "2. Descarga Release-24.08.0-0.zip" -ForegroundColor Cyan
    Write-Host "3. Extrae a C:\Program Files\poppler-24.08.0\" -ForegroundColor Cyan
    Write-Host "4. Añade al PATH: C:\Program Files\poppler-24.08.0\Library\bin" -ForegroundColor Cyan
    Write-Host ""
}

Write-Host "Presiona cualquier tecla para salir..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
