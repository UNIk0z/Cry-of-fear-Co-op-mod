# Read-only launcher helper. The adapter validates the entire payload before
# restoring game state; this helper only selects a bounded, checksummed map.
function Get-CoopCheckpointCrc32([byte[]]$Bytes) {
    [uint32]$crc=4294967295
    for ($i=20; $i -lt $Bytes.Length; $i++) {
        $crc=$crc -bxor [uint32]$Bytes[$i]
        for ($bit=0; $bit -lt 8; $bit++) {
            if ($crc -band 1) { $crc=($crc -shr 1) -bxor [uint32]3988292384 }
            else { $crc=$crc -shr 1 }
        }
    }
    return $crc -bxor [uint32]4294967295
}
# Continue request read once by the adapter at the first real map, then deleted.
# Independent of whether +sc_checkpoint_prepare ran before the game DLL loaded.
# Any served RC2/RC4 alias (s2_/s4_ except the passive nightmare), mirroring
# checkpoint_map in native/rc4/checkpoint.cpp. The adapter re-validates.
function Test-CoopCheckpointMap([string]$Map) { return ($Map -cmatch '^s[24]_[a-z0-9_]{1,28}$') -and ($Map -cne 's4_nightmare') }
function Test-CoopLegacyCheckpointMap([string]$Map) { return $Map -cin @('s4_start','s4_start_e0','s4_start_e2') }
function Get-CoopContinueRequestPath([string]$GameDirectory) { return (Join-Path ([IO.Path]::GetFullPath($GameDirectory)) 'storycoop_saves\continue.request') }
function Write-CoopContinueRequest([string]$GameDirectory,[int]$Slot,[string]$Map) {
    if ($Slot -lt 1 -or $Slot -gt 3 -or -not (Test-CoopCheckpointMap $Map)) { throw 'Invalid Continue request.' }
    $path=Get-CoopContinueRequestPath $GameDirectory
    [IO.File]::WriteAllText($path,('COFCONT1 '+$Slot+' '+$Map),[Text.Encoding]::ASCII)
    return $path
}
function Remove-CoopContinueRequest([string]$GameDirectory) {
    $path=Get-CoopContinueRequestPath $GameDirectory
    if ([IO.File]::Exists($path)) { [IO.File]::Delete($path) }
}
function Read-CoopCheckpointSlot([string]$GameDirectory,[int]$Slot) {
    if ($Slot -lt 1 -or $Slot -gt 3) { throw 'Checkpoint slot must be 1, 2 or 3.' }
    $directory=Join-Path ([IO.Path]::GetFullPath($GameDirectory)) 'storycoop_saves'
    if (-not [IO.Directory]::Exists($directory) -or ((Get-Item -LiteralPath $directory).Attributes -band [IO.FileAttributes]::ReparsePoint)) { throw 'Ordinary storycoop_saves directory not found.' }
    $primary=Join-Path $directory ('slot'+$Slot+'.cofsave')
    foreach ($file in @($primary,($primary+'.bak'))) {
        if (-not [IO.File]::Exists($file)) { continue }
        $info=Get-Item -LiteralPath $file
        if (($info.Attributes -band [IO.FileAttributes]::ReparsePoint) -or $info.Length -lt 56 -or $info.Length -gt 65536) { continue }
        $bytes=[IO.File]::ReadAllBytes($file)
        if ([Text.Encoding]::ASCII.GetString($bytes,0,8) -cne 'COFCKP01' -or [BitConverter]::ToUInt32($bytes,8) -notin @(1,2,3,4,5,6,7,8) -or [BitConverter]::ToUInt32($bytes,12) -ne $bytes.Length -or [BitConverter]::ToUInt32($bytes,16) -ne (Get-CoopCheckpointCrc32 $bytes)) { continue }
        $end=20
        while ($end -lt 52 -and $bytes[$end] -ne 0) { $end++ }
        if ($end -eq 52) { continue }
        $map=[Text.Encoding]::ASCII.GetString($bytes,20,$end-20)
        $recorder=[BitConverter]::ToInt32($bytes,52)
        if (-not (Test-CoopCheckpointMap $map)) { continue }
        if ((Test-CoopLegacyCheckpointMap $map) -and $recorder -notin @(419,421)) { continue }
        if ($recorder -lt 1 -or $recorder -gt 8191) { continue }
        return [pscustomobject]@{Map=$map;Slot=$Slot;Path=$file;Backup=($file -cne $primary)}
    }
    throw 'No supported, checksummed checkpoint or backup found. Nothing was launched or changed.'
}
