[CmdletBinding()]
param(
    [string]$MapsDirectory = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps',
    [switch]$Remove
)
$ErrorActionPreference = 'Stop'
$sourceHash = '3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e'
$outputHash = 'fd4979bbb018c1b3f9a4f0d1ce06fd0cc05ce1ff8b9ffb84e291c07943b3049c'
$maps = (Resolve-Path -LiteralPath $MapsDirectory).ProviderPath
if (-not (Test-Path -LiteralPath $maps -PathType Container)) { throw 'MapsDirectory must be a directory.' }
$destination = Join-Path $maps 'c_start2_doornative.bsp'
$exists = Test-Path -LiteralPath $destination
if ($exists -and (Get-FileHash -LiteralPath $destination).Hash.ToLowerInvariant() -ne $outputHash) {
    throw "Unknown/changed file retained: $destination. Nothing installed or removed."
}
if ($Remove) {
    if ($exists) { Remove-Item -LiteralPath $destination; Write-Output "Removed $destination" }
    return
}
$source = Join-Path $maps 'c_start2.bsp'
$bytes = [IO.File]::ReadAllBytes($source)
$sha = [Security.Cryptography.SHA256]::Create()
try {
    $actualSource = ([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-', '').ToLowerInvariant()
    if ($actualSource -ne $sourceHash) { throw 'Original c_start2 SHA256 mismatch. Nothing installed.' }
    $oldOffset = [BitConverter]::ToInt32($bytes, 4)
    $oldLength = [BitConverter]::ToInt32($bytes, 8)
    $textLength = 0
    while ($textLength -lt $oldLength -and $bytes[$oldOffset + $textLength] -ne 0) { $textLength++ }
    if ($textLength -eq $oldLength) { throw 'Missing entity terminator.' }
    $encoding = [Text.Encoding]::GetEncoding(28591)
    $text = $encoding.GetString($bytes, $oldOffset, $textLength)
    # Exact offset in the hash-verified original: insert before worldspawn's closing brace.
    if ($text[718] -cne '}') { throw 'Unexpected worldspawn text. Nothing installed.' }
    $insertion = '"player1" "police1"' + "`n" + '"player2" "police2"' + "`n" + '"player3" "police3"' + "`n" + '"player4" "police4"' + "`n"
    $text = $text.Insert(718, $insertion)
    $entityBytes = $encoding.GetBytes($text + [char]0)
    $newOffset = [int]([Math]::Ceiling($bytes.Length / 4.0) * 4)
    $output = New-Object byte[] ($newOffset + $entityBytes.Length)
    [Array]::Copy($bytes, 0, $output, 0, $bytes.Length)
    [Array]::Copy($entityBytes, 0, $output, $newOffset, $entityBytes.Length)
    [Array]::Copy([BitConverter]::GetBytes($newOffset), 0, $output, 4, 4)
    [Array]::Copy([BitConverter]::GetBytes([int]$entityBytes.Length), 0, $output, 8, 4)
    $actualOutput = ([BitConverter]::ToString($sha.ComputeHash($output))).Replace('-', '').ToLowerInvariant()
    if ($actualOutput -ne $outputHash) { throw 'Generated BSP hash mismatch. Nothing installed.' }
} finally { $sha.Dispose() }
for ($slot = 1; $slot -le 4; $slot++) {
    $model = Join-Path (Split-Path -Parent $maps) "models\player\police$slot\police$slot.mdl"
    if (-not (Test-Path -LiteralPath $model -PathType Leaf)) { throw "Required native player model missing: $model. Nothing installed." }
}
if ($exists) { Write-Output "Already installed and verified: $destination"; return }
$stream = [IO.File]::Open($destination, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
try { $stream.Write($output, 0, $output.Length) } finally { $stream.Dispose() }
if ((Get-FileHash -LiteralPath $destination).Hash.ToLowerInvariant() -ne $outputHash) { throw "Installed hash mismatch; do not load $destination." }
Write-Output "Installed $destination ($($output.Length) bytes), SHA256 $outputHash"
Write-Output 'Original map and v2 aliases retained. Restart BOTH clients before testing. This initialization hypothesis has NOT been gameplay tested.'
