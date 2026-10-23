# Builds only the ca74c3f spawn experiment, using the player's own installed BSP.
[CmdletBinding()]
param(
    [string]$MapsDirectory = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps',
    [switch]$Remove
)
$ErrorActionPreference = 'Stop'
$sourceHash = '3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e'
$outputHash = '12b52fb58d8ad99f511a7202eed2702066e898faea0a00ed68c61962138a67ec'
$maps = (Resolve-Path -LiteralPath $MapsDirectory).ProviderPath
if (-not (Test-Path -LiteralPath $maps -PathType Container)) { throw 'MapsDirectory must be a directory.' }
$destination = Join-Path $maps 'c_start2_cooptest.bsp'
if ($Remove) {
    if (-not (Test-Path -LiteralPath $destination)) { Write-Output 'Test map already absent.'; return }
    if ((Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant() -ne $outputHash) {
        throw 'Refusing removal: test map differs from the known experiment. Preserve and inspect it manually.'
    }
    Remove-Item -LiteralPath $destination
    Write-Output "Removed only $destination"
    return
}
if (Test-Path -LiteralPath $destination) { throw 'Test map already exists; refusing overwrite. Verify it or use -Remove first.' }
$source = Join-Path $maps 'c_start2.bsp'
$bytes = [IO.File]::ReadAllBytes($source)
$sha = [Security.Cryptography.SHA256]::Create()
try {
    $actualSource = ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    if ($actualSource -ne $sourceHash) { throw 'Original c_start2 SHA256 mismatch. Stop; this patch requires the inspected Steam map version.' }
    # Source hash fixes the BSP layout. Retain the original Latin-1 entity text.
    $oldOffset = [BitConverter]::ToInt32($bytes, 4)
    $oldLength = [BitConverter]::ToInt32($bytes, 8)
    $textLength = 0
    while ($textLength -lt $oldLength -and $bytes[$oldOffset + $textLength] -ne 0) { $textLength++ }
    if ($textLength -eq $oldLength) { throw 'Missing entity terminator.' }
    $encoding = [Text.Encoding]::GetEncoding(28591)
    $text = $encoding.GetString($bytes, $oldOffset, $textLength) + "`n"
    $origins = @('2428 -883 -728', '2428 -819 -728', '2492 -819 -728', '2556 -819 -728')
    for ($slot = 1; $slot -le 4; $slot++) {
        $text += '{' + "`n" + '"origin" "' + $origins[$slot - 1] + '"' + "`n" +
            '"angles" "0 90 0"' + "`n" + '"classname" "cof_coop_spawn' + $slot + '"' + "`n" + '}' + "`n"
    }
    $entityBytes = $encoding.GetBytes($text + [char]0)
    $newOffset = [int]([Math]::Ceiling($bytes.Length / 4.0) * 4)
    $output = New-Object byte[] ($newOffset + $entityBytes.Length)
    [Array]::Copy($bytes, 0, $output, 0, $bytes.Length)
    [Array]::Copy($entityBytes, 0, $output, $newOffset, $entityBytes.Length)
    [Array]::Copy([BitConverter]::GetBytes($newOffset), 0, $output, 4, 4)
    [Array]::Copy([BitConverter]::GetBytes([int]$entityBytes.Length), 0, $output, 8, 4)
    $actualOutput = ([BitConverter]::ToString($sha.ComputeHash($output))).Replace('-', '').ToLowerInvariant()
    if ($actualOutput -ne $outputHash) { throw 'Generated BSP hash mismatch; nothing installed.' }
} finally { $sha.Dispose() }
# CreateNew also prevents an overwrite if another process creates the file now.
$stream = [IO.File]::Open($destination, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try { $stream.Write($output, 0, $output.Length) } finally { $stream.Dispose() }
if ((Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant() -ne $outputHash) {
    throw 'Installed file hash mismatch. Do not launch it; retain the file for diagnosis.'
}
Write-Output "Installed $destination ($($output.Length) bytes)"
Write-Output "SHA256 $outputHash"
Write-Output 'Original c_start2.bsp was read only. Gameplay is NOT TESTED.'
