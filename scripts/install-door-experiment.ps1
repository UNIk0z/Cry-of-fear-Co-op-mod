[CmdletBinding()]
param(
    [string]$MapsDirectory = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps',
    [switch]$Remove
)
$ErrorActionPreference = 'Stop'
$sourceHash = '3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e'
$bypassHash = '7d2f8c347f97e2135d9cbb49cc871c9d7cac2d16a0559b75a0841b59c79518f0'
$maps = (Resolve-Path -LiteralPath $MapsDirectory).ProviderPath
if (-not (Test-Path -LiteralPath $maps -PathType Container)) { throw 'MapsDirectory must be a directory.' }
$files = @(
    @{Name='c_start2_doorctrl.bsp'; Hash=$sourceHash},
    @{Name='c_start2_doorbypass.bsp'; Hash=$bypassHash}
)
# Preflight both paths before writing/removing either; existing unknown files win.
foreach ($file in $files) {
    $file.Path = Join-Path $maps $file.Name
    $file.Exists = Test-Path -LiteralPath $file.Path
    if ($file.Exists -and (Get-FileHash -LiteralPath $file.Path).Hash.ToLowerInvariant() -ne $file.Hash) {
        throw "Unknown/changed file retained: $($file.Path). Nothing installed or removed."
    }
}
if ($Remove) {
    foreach ($file in $files) {
        if ($file.Exists) { Remove-Item -LiteralPath $file.Path; Write-Output "Removed $($file.Path)" }
    }
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
    # Offsets are fixed to the hash-verified original entity text, in reverse order.
    $edits = @(
        @{Offset=8450; From='inter_door_exit'; To='info_teleport_destination'},
        @{Offset=8349; From='inter_door'; To='trigger_teleport'},
        @{Offset=7950; From='inter_door'; To='trigger_teleport'},
        @{Offset=7546; From='inter_door_exit'; To='info_teleport_destination'}
    )
    foreach ($edit in $edits) {
        if ($text.Substring($edit.Offset, $edit.From.Length) -cne $edit.From) { throw 'Unexpected entity text; nothing installed.' }
        $text = $text.Remove($edit.Offset, $edit.From.Length).Insert($edit.Offset, $edit.To)
    }
    $entityBytes = $encoding.GetBytes($text + [char]0)
    $newOffset = [int]([Math]::Ceiling($bytes.Length / 4.0) * 4)
    $output = New-Object byte[] ($newOffset + $entityBytes.Length)
    [Array]::Copy($bytes, 0, $output, 0, $bytes.Length)
    [Array]::Copy($entityBytes, 0, $output, $newOffset, $entityBytes.Length)
    [Array]::Copy([BitConverter]::GetBytes($newOffset), 0, $output, 4, 4)
    [Array]::Copy([BitConverter]::GetBytes([int]$entityBytes.Length), 0, $output, 8, 4)
    $actualOutput = ([BitConverter]::ToString($sha.ComputeHash($output))).Replace('-', '').ToLowerInvariant()
    if ($actualOutput -ne $bypassHash) { throw 'Generated BSP hash mismatch; nothing installed.' }
} finally { $sha.Dispose() }
foreach ($file in $files) {
    if ($file.Exists) { Write-Output "Already installed and verified: $($file.Path)"; continue }
    if ($file.Name -eq 'c_start2_doorctrl.bsp') { $content = $bytes } else { $content = $output }
    $stream = [IO.File]::Open($file.Path, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
    try { $stream.Write($content, 0, $content.Length) } finally { $stream.Dispose() }
    if ((Get-FileHash -LiteralPath $file.Path).Hash.ToLowerInvariant() -ne $file.Hash) { throw "Installed hash mismatch; do not load $($file.Path)." }
    Write-Output "Installed $($file.Path) ($($content.Length) bytes), SHA256 $($file.Hash)"
}
Write-Output 'Original map/configs untouched. Close/restart BOTH clients, including Sandboxie, before testing. Gameplay NOT TESTED.'
