[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$MapsDirectory,
      [Parameter(Mandatory = $true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
# This is a user-run fallback for a normal PowerShell session if Codex cannot read D:.
# It reads the installation and copies eight maps into work/, without touching originals.
$projectRoot = Split-Path -Parent $PSScriptRoot
$workRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '..\..\work'))
$destination = [IO.Path]::GetFullPath($OutputDirectory)
if (-not $destination.StartsWith($workRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Sample destination must be a new directory below this workspace work/ directory.'
}
if (Test-Path -LiteralPath $destination) { throw 'Sample destination already exists.' }
$parent = Split-Path -Parent $destination
if (-not (Test-Path -LiteralPath $parent -PathType Container)) { throw 'Create the destination parent directory first.' }
# Reject reparse points in the destination ancestry (including junctions).
$ancestor = Get-Item -LiteralPath $parent
while ($null -ne $ancestor) {
    if ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Destination ancestry contains a reparse point.' }
    $ancestor = $ancestor.Parent
}
$maps = Get-Item -LiteralPath $MapsDirectory
if (-not $maps.PSIsContainer) { throw 'MapsDirectory must be a directory.' }
$names = @('c_start', 'c_start2', 'c_village2', 'c_cof_village2', 'c_city', 'c_cof_city', 'c_bridge', 'c_cof_bridge')
# Preflight all paths before creating the destination.
$files = @($names | ForEach-Object { Get-Item -LiteralPath (Join-Path $maps.FullName ($_ + '.bsp')) -ErrorAction Stop })
New-Item -ItemType Directory -Path $destination | Out-Null
$records = @()
foreach ($file in $files) {
    $before = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    $copy = Join-Path $destination $file.Name
    Copy-Item -LiteralPath $file.FullName -Destination $copy -ErrorAction Stop
    $copied = (Get-FileHash -LiteralPath $copy -Algorithm SHA256).Hash
    $after = (Get-FileHash -LiteralPath $file.FullName -Algorithm SHA256).Hash
    if ($before -ne $copied -or $before -ne $after) { throw "Hash mismatch during staging: $($file.Name); preserve partial directory for diagnosis." }
    $records += [ordered]@{ name = $file.Name; source = $file.FullName; sha256 = $before.ToLowerInvariant(); bytes = $file.Length }
}
$manifest = [ordered]@{ schemaVersion = 1; originalFilesWritten = $false; files = $records } | ConvertTo-Json -Depth 5
[IO.File]::WriteAllText((Join-Path $destination 'staging-manifest.json'), $manifest + "`n", [Text.UTF8Encoding]::new($false))
Write-Output "Staged and hash-verified $($files.Count) maps: $destination"
