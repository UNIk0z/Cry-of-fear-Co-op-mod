[CmdletBinding()]
param(
    [string]$MapsDirectory = 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\maps',
    [switch]$Remove
)
$ErrorActionPreference='Stop'
$sourceHash='3933456e6c0e8a449ec17e7829c9d69a8880a1e414b54dd6c0cf2b361483157e'
$outputHash='ef1c8f26a0c359d17a5b082813751a171f3e52cb86516317a21e3ff200468b95'
$maps=(Resolve-Path -LiteralPath $MapsDirectory).ProviderPath
if (-not (Test-Path -LiteralPath $maps -PathType Container)) { throw 'MapsDirectory must be a directory' }
$destination=Join-Path $maps 'c_start2_coop_note.bsp'
$exists=Test-Path -LiteralPath $destination
if ($exists -and (Get-FileHash -LiteralPath $destination).Hash.ToLowerInvariant() -ne $outputHash) { throw "Unknown/changed file retained: $destination. Nothing installed or removed." }
if ($Remove) {
    if ($exists) { Remove-Item -LiteralPath $destination; Write-Output "Removed $destination" }
    return
}
$manifestPath=Join-Path $PSScriptRoot 'c_start2-coop-note.experimental.json'
if (-not (Test-Path -LiteralPath $manifestPath -PathType Leaf)) { $manifestPath=Join-Path $PSScriptRoot '..\patches\c_start2-coop-note.experimental.json' }
$plan=Get-Content -LiteralPath $manifestPath -Raw | ConvertFrom-Json
if ($plan.schemaVersion -ne 1 -or $plan.map -cne 'c_start2_coop_note' -or $plan.sourceSha256 -cne $sourceHash -or $plan.outputSha256 -cne $outputHash) { throw 'Unexpected patch manifest. Nothing installed.' }
$nativeDllHash='0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63'
$nativeDll=Join-Path $maps '..\cl_dlls\hl.dll'
if ($plan.nativeDllSha256 -cne $nativeDllHash -or -not (Test-Path -LiteralPath $nativeDll -PathType Leaf) -or (Get-FileHash -LiteralPath $nativeDll).Hash.ToLowerInvariant() -ne $nativeDllHash) { throw 'Steam game DLL version mismatch. Nothing installed. This experiment requires the verified CoF 1.6 DLL; do not bypass this guard.' }
$bytes=[IO.File]::ReadAllBytes((Join-Path $maps 'c_start2.bsp'))
$sha=[Security.Cryptography.SHA256]::Create()
try {
    $actualSource=([BitConverter]::ToString($sha.ComputeHash($bytes))).Replace('-','').ToLowerInvariant()
    if ($actualSource -ne $sourceHash) { throw 'Original c_start2 SHA256 mismatch. Nothing installed.' }
    $oldOffset=[BitConverter]::ToInt32($bytes,4); $oldLength=[BitConverter]::ToInt32($bytes,8)
    $textLength=0
    while ($textLength -lt $oldLength -and $bytes[$oldOffset+$textLength] -ne 0) { $textLength++ }
    if ($textLength -eq $oldLength) { throw 'Missing entity terminator.' }
    $encoding=[Text.Encoding]::GetEncoding(28591)
    $text=$encoding.GetString($bytes,$oldOffset,$textLength)
    foreach ($edit in @($plan.edits | Sort-Object -Property start -Descending)) {
        if ($edit.start -lt 0 -or $edit.end -le $edit.start -or $edit.end -gt $text.Length -or $text[$edit.start] -cne '{' -or $text[$edit.end-1] -cne '}') { throw 'Unexpected entity span. Nothing installed.' }
        $text=$text.Remove($edit.start,$edit.end-$edit.start).Insert($edit.start,$edit.to)
    }
    $entityBytes=$encoding.GetBytes($text+$plan.appendText+[char]0)
    $newOffset=[int]([Math]::Ceiling($bytes.Length/4.0)*4)
    $output=New-Object byte[] ($newOffset+$entityBytes.Length)
    [Array]::Copy($bytes,0,$output,0,$bytes.Length)
    [Array]::Copy($entityBytes,0,$output,$newOffset,$entityBytes.Length)
    [Array]::Copy([BitConverter]::GetBytes($newOffset),0,$output,4,4)
    [Array]::Copy([BitConverter]::GetBytes([int]$entityBytes.Length),0,$output,8,4)
    $actualOutput=([BitConverter]::ToString($sha.ComputeHash($output))).Replace('-','').ToLowerInvariant()
    if ($actualOutput -ne $outputHash) { throw 'Generated BSP hash mismatch. Nothing installed.' }
} finally { $sha.Dispose() }
if ($exists) { Write-Output "Already installed and verified: $destination"; return }
$stream=[IO.File]::Open($destination,[IO.FileMode]::CreateNew,[IO.FileAccess]::Write,[IO.FileShare]::None)
try { $stream.Write($output,0,$output.Length) } finally { $stream.Dispose() }
if ((Get-FileHash -LiteralPath $destination).Hash.ToLowerInvariant() -ne $outputHash) { throw "Installed hash mismatch; do not load $destination" }
Write-Output "Installed $destination ($($output.Length) bytes), SHA256 $outputHash"
Write-Output 'Original map and earlier aliases untouched. Single username note UNTESTED: follow SHARED_NOTE_TEST. Both clients must see the native notification AND read the same entry in their real journals. Cafe v10 chain unchanged.'
