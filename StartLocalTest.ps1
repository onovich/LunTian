param(
  [int[]]$Ports = @(5173, 5174, 5175, 5180, 3000, 3001, 4173, 4174, 8000, 8080, 8090),
  [string]$HostName = "127.0.0.1",
  [string]$BasePath = "/LunTian/",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path

function Test-PortFree {
  param([int]$Port)
  $listener = $null
  try {
    $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($HostName), $Port)
    $listener.Start()
    return $true
  } catch {
    return $false
  } finally {
    if ($listener) { $listener.Stop() }
  }
}

$Port = $Ports | Where-Object { Test-PortFree $_ } | Select-Object -First 1
if (-not $Port) {
  $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Parse($HostName), 0)
  $listener.Start()
  $Port = $listener.LocalEndpoint.Port
  $listener.Stop()
}

$Url = "http://$HostName`:$Port$BasePath"
$DevArgs = "run dev -- --host $HostName --port $Port --strictPort"

if ($DryRun) {
  Write-Host "Project root: $ProjectRoot"
  Write-Host "Command: npm $DevArgs"
  Write-Host "URL: $Url"
  exit 0
}

if (-not (Test-Path (Join-Path $ProjectRoot "node_modules"))) {
  Push-Location $ProjectRoot
  try {
    if (Test-Path (Join-Path $ProjectRoot "package-lock.json")) {
      npm ci
    } else {
      npm install
    }
  } finally {
    Pop-Location
  }
}

$escapedRoot = $ProjectRoot.Replace("'", "''")
$serverCommand = "Set-Location '$escapedRoot'; npm $DevArgs"
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-Command", $serverCommand

$deadline = (Get-Date).AddSeconds(25)
do {
  Start-Sleep -Milliseconds 500
  try {
    $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 2
    if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
      Start-Process $Url
      exit 0
    }
  } catch {
  }
} while ((Get-Date) -lt $deadline)

Write-Host "Started dev server command, but $Url did not answer within 25 seconds."
Write-Host "Check the server window for details."
exit 1
