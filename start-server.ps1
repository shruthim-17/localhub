$ErrorActionPreference = 'Stop'
$port = 3000
$processIds = @(Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique)

foreach ($processId in $processIds) {
  if ($processId -ne $PID) {
    Stop-Process -Id $processId -Force
  }
}

node server.js
