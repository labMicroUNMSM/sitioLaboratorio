param([string]$Accion)
$ErrorActionPreference = 'Stop'
$raiz = (Get-Item -LiteralPath (Join-Path $PSScriptRoot '..')).FullName
$archivo = Join-Path $raiz 'sitioLaboratorio.cmd'
function Control([string]$op) {
    if (-not (Get-Command wsl.exe -ErrorAction SilentlyContinue)) {
        throw 'Instala WSL 2 con wsl --install, reinicia Windows e inicia Ubuntu una vez.'
    }
    $puerto = if ($env:SITIO_PUERTO) { $env:SITIO_PUERTO } else { '3107' }
    & wsl.exe --cd $raiz --exec python3 scripts/launcher.py $op $puerto
    if ($LASTEXITCODE -ne 0) { throw 'Revisa el mensaje anterior. Comprueba wsl -l -v y que tu distribución predeterminada tenga Python 3.' }
}
function Ejecutar([string]$op) {
    switch ($op) {
        'preparar' {
            Control preparar
            $direccion = (Control direccion).Trim()
            $puerto = ([uri]$direccion).Port
            $destino = Join-Path ([Environment]::GetFolderPath('DesktopDirectory')) "sitioLaboratorio demo $puerto.lnk"
            $s = (New-Object -ComObject WScript.Shell).CreateShortcut($destino)
            if ((Test-Path -LiteralPath $destino) -and $s.TargetPath -ne $archivo) {
                throw "Ya existe un acceso directo para el puerto $puerto en otra carpeta. Puedes abrir $archivo directamente."
            }
            $s.TargetPath = $archivo
            $s.WorkingDirectory = $raiz
            $s.Save()
            Write-Host "Acceso directo guardado en $destino"
        }
        { $_ -in 'iniciar','panel' } {
            Control iniciar
            $url = (Control direccion).Trim()
            if ($op -eq 'panel') { $url += '/admin' }
            Start-Process $url
        }
        { $_ -in 'estado','detener','primer-admin' } { Control $op }
        default { throw 'Elige preparar, iniciar, panel, estado o detener.' }
    }
}
if ($Accion) {
    try { Ejecutar $Accion; exit 0 } catch { Write-Host $_.Exception.Message; exit 1 }
}
while ($true) {
    Write-Host "`nsitioLaboratorio`n1. Iniciar y abrir portada`n2. Abrir panel`n3. Ver estado`n4. Detener`n5. Salir`n6. Preparar instalación"
    $op = Read-Host 'Elige una opción'
    if ($op -eq '5') { exit 0 }
    $acciones = @{'1'='iniciar';'2'='panel';'3'='estado';'4'='detener';'6'='preparar'}
    if ($acciones.ContainsKey($op)) { try { Ejecutar $acciones[$op] } catch { Write-Host $_.Exception.Message } }
}
