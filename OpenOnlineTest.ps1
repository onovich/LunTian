param(
  [string]$Url = "https://onovich.github.io/LunTian/",
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

if ($DryRun) {
  Write-Host "URL: $Url"
  exit 0
}

Start-Process $Url
