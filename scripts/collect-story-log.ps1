[CmdletBinding()]
param(
 [ValidateSet('P1','P2','P3','P4')][string]$Client='P1',
 [string]$GameDirectory='D:\SteamLibrary\steamapps\common\Cry of Fear',
 [string]$LogPath
)
$ErrorActionPreference='Stop'
if (-not $LogPath) {
 $available=@((Join-Path $GameDirectory 'qconsole.log'),(Join-Path $GameDirectory 'cryoffear\qconsole.log')) | Where-Object { [IO.File]::Exists($_) }
 if (@($available).Count -eq 0) { throw 'No qconsole.log found. Enable native condebug first; for Sandboxie pass the actual boxed log with -LogPath.' }
 $LogPath=$available | Sort-Object { [IO.File]::GetLastWriteTimeUtc($_) } -Descending | Select-Object -First 1
}
$source=(Resolve-Path -LiteralPath $LogPath).ProviderPath
$folder=Join-Path $PSScriptRoot 'logs'
[IO.Directory]::CreateDirectory($folder) | Out-Null
$destination=Join-Path $folder ($Client+'-'+[DateTime]::UtcNow.ToString('yyyyMMdd-HHmmss')+'-'+[Guid]::NewGuid().ToString('N')+'.log')
[IO.File]::Copy($source,$destination,$false)
Write-Output "Copied $Client log: $destination"
Write-Output 'Log may contain player identities and server addresses. Keep it in private project work; do not commit it.'
