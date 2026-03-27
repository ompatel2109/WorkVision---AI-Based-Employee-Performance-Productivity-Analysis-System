Write-Host "=== Network Diagnostics ==="
$ips = Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4" -and $_.InterfaceAlias -notlike "*Loopback*"}
foreach ($ip in $ips) {
    Write-Host "Interface: $($ip.InterfaceAlias) | IP: $($ip.IPAddress)"
}

Write-Host "`n=== Firewall Rules ==="
$feRule = Get-NetFirewallRule -DisplayName "Allow ProductivAI Frontend" -ErrorAction SilentlyContinue
if (-not $feRule) {
    Write-Host "Created Frontend Rule (8080)"
    New-NetFirewallRule -DisplayName "Allow ProductivAI Frontend" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
} else {
    Write-Host "Frontend Rule (8080) Exists"
}

$beRule = Get-NetFirewallRule -DisplayName "Allow ProductivAI Backend" -ErrorAction SilentlyContinue
if (-not $beRule) {
    Write-Host "Created Backend Rule (5000)"
    New-NetFirewallRule -DisplayName "Allow ProductivAI Backend" -Direction Inbound -LocalPort 5000 -Protocol TCP -Action Allow
} else {
    Write-Host "Backend Rule (5000) Exists"
}
