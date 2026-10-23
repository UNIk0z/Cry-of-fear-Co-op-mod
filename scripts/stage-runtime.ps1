[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$GameDirectory,
      [Parameter(Mandatory=$true)][string]$OutputDirectory)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSScriptRoot
$workRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '..\..\work'))
$destination = [IO.Path]::GetFullPath($OutputDirectory)
if (-not $destination.StartsWith($workRoot.TrimEnd('\') + '\', [StringComparison]::OrdinalIgnoreCase)) { throw 'Runtime destination must be under workspace work/.' }
if (Test-Path -LiteralPath $destination) { throw 'Runtime destination already exists; snapshots are never merged.' }
$parent = Get-Item -LiteralPath (Split-Path -Parent $destination)
for ($ancestor = $parent; $null -ne $ancestor; $ancestor = $ancestor.Parent) {
    if ($ancestor.Attributes -band [IO.FileAttributes]::ReparsePoint) { throw 'Destination ancestry contains a reparse point.' }
}
$source = Get-Item -LiteralPath $GameDirectory
if (-not $source.PSIsContainer) { throw 'GameDirectory must be a directory.' }
$critical = @('cof.exe', 'CoFLaunchApp.exe', 'hlds.exe', 'Core.dll', 'hw.dll', 'swds.dll', 'steam_api.dll',
    'cryoffear\cl_dlls\hl.dll', 'cryoffear\cl_dlls\client.dll', 'cryoffear\liblist.gam', 'cryoffear\maps\c_cof_bridge.bsp', 'cryoffear\maps\c_start2.bsp')
$configuration = @(Get-ChildItem -LiteralPath $source.FullName -Filter '*.cfg' -File | ForEach-Object Name)
$configuration += @(Get-ChildItem -LiteralPath (Join-Path $source.FullName 'cryoffear') -Filter '*.cfg' -File | ForEach-Object { 'cryoffear\' + $_.Name })
$records = @()
foreach ($relative in ($critical + $configuration | Select-Object -Unique)) {
    $original = Join-Path $source.FullName $relative
    $records += [ordered]@{ relative = $relative; sha256 = (Get-FileHash -LiteralPath $original -Algorithm SHA256).Hash.ToLowerInvariant() }
}
New-Item -ItemType Directory -Path $destination | Out-Null
# Full asset snapshot; no junctions or hardlinks to originals. Exclude saves,
# demos and logs. /R:0 /W:0 bounds retries; no /MIR, /MOVE or deletion switches.
& robocopy.exe $source.FullName $destination /E /COPY:DAT /DCOPY:DAT /R:0 /W:0 /XJ /NFL /NDL /NJH /NJS /NP /XD (Join-Path $source.FullName 'SAVE') (Join-Path $source.FullName 'cryoffear\SAVE') /XF '*.sav' '*.dem' '*.log'
$copyCode = $LASTEXITCODE
if ($copyCode -ge 8) { throw "Runtime copy failed: robocopy code $copyCode; keep partial snapshot for diagnosis." }
foreach ($record in $records) {
    $copied = (Get-FileHash -LiteralPath (Join-Path $destination $record.relative) -Algorithm SHA256).Hash.ToLowerInvariant()
    $after = (Get-FileHash -LiteralPath (Join-Path $source.FullName $record.relative) -Algorithm SHA256).Hash.ToLowerInvariant()
    if ($copied -ne $record.sha256 -or $after -ne $record.sha256) { throw "Runtime critical-file hash mismatch: $($record.relative)" }
}
$manifest = [ordered]@{ schemaVersion = 1; source = $source.FullName; destination = $destination; robocopyExitCode = $copyCode;
    criticalAndConfigHashes = $records; originalFilesWritten = $false; sharedWritableAssets = $false;
    launchStatus = 'NOT TESTED'; note = 'Critical files and configs verified; remaining resources were copied by robocopy, not individually hash-verified. Saves/demos/logs excluded. A copy is not proof of independent launchability.' }
[IO.File]::WriteAllText((Join-Path $destination 'runtime-manifest.json'), ($manifest | ConvertTo-Json -Depth 8) + "`n", [Text.UTF8Encoding]::new($false))
Write-Output "Runtime snapshot ready (launch unverified): $destination"
exit 0
