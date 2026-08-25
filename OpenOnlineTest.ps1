param(
  [string]$Url = "https://game.onovich.com/LunTian/",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if ($DryRun) {
  Write-Host "URL: $Url"
  exit 0
}

Start-Process $Url
