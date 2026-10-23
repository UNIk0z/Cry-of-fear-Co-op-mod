[CmdletBinding()]
param([Parameter(Mandatory=$true)][string]$CheckpointFile,[Parameter(Mandatory=$true)][string]$FixtureDirectory,[string]$Launcher)
$ErrorActionPreference='Stop'
if (-not $Launcher) { $Launcher=Join-Path $PSScriptRoot '..\scripts\host-story-coop.ps1' }
if (Test-Path -LiteralPath $FixtureDirectory) { throw 'Fresh fixture directory required.' }
$fixture=[IO.Path]::GetFullPath($FixtureDirectory); [void][IO.Directory]::CreateDirectory($fixture)
. (Join-Path (Split-Path $Launcher) 'read-coop-checkpoint.ps1')
$bytes=[IO.File]::ReadAllBytes($CheckpointFile)
$fakeSteam=Join-Path $fixture 'steam.exe'; [IO.File]::WriteAllText($fakeSteam,'ShowCommand fixture only; never launched')
$checks=New-Object 'System.Collections.Generic.List[string]'
function Check([bool]$Pass,[string]$Label) { if (-not $Pass) { throw ('FAIL '+$Label) }; $checks.Add($Label) }
function Write-Case([string]$Name,[byte[]]$Primary,[byte[]]$Backup) {
    $dir=Join-Path $fixture $Name; $saves=Join-Path $dir 'storycoop_saves'; [void][IO.Directory]::CreateDirectory($saves)
    [IO.File]::WriteAllBytes((Join-Path $saves 'slot1.cofsave'),$Primary)
    $maps=Join-Path $dir 'maps'; [void][IO.Directory]::CreateDirectory($maps); foreach ($m in @('s4_start_e0','s2_lake_e0')) { [IO.File]::WriteAllText((Join-Path $maps ($m+'.bsp')),'fixture map placeholder') }
    if ($Backup) { [IO.File]::WriteAllBytes((Join-Path $saves 'slot1.cofsave.bak'),$Backup) }
    return $dir
}
function Show([string]$Name,[string]$Directory,[bool]$Success,[string[]]$Extra=@()) {
    $old=$ErrorActionPreference; $ErrorActionPreference='Continue'
    $shown=& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $Launcher -SteamExe $fakeSteam -ShowCommand -GameDirectory $Directory -ContinueSlot 1 @Extra 2>&1
    $exit=$LASTEXITCODE; $ErrorActionPreference=$old
    [IO.File]::WriteAllText((Join-Path $fixture ($Name+'.log')),($shown -join "`r`n"))
    Check (($exit -eq 0) -eq $Success) $Name
    return ($shown -join "`n")
}
$valid=Write-Case 'valid' $bytes $null; $header=Read-CoopCheckpointSlot $valid 1
Check ($header.Map -ceq 's4_start_e0' -and -not $header.Backup) 'actual C++ file header/CRC read by PowerShell'
$shown=Show 'Continue uses Steam and ordered fresh load command' $valid $true
Check ($shown -ceq ('"'+$fakeSteam+'" -applaunch 223710 -console -dev -condebug -dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000 +maxplayers 2 +mp_footsteps 1 +sv_maxupdaterate 100 +sc_checkpoint_prepare 1 +map s4_start_e0')) 'Continue exact ShowCommand; no launch'
Check ([Convert]::ToBase64String([IO.File]::ReadAllBytes((Join-Path $valid 'storycoop_saves\slot1.cofsave'))) -ceq [Convert]::ToBase64String($bytes)) 'Continue leaves primary unchanged'
$request=Get-CoopContinueRequestPath $valid
Check (-not [IO.File]::Exists($request)) 'ShowCommand writes no Continue request'
$written=Write-CoopContinueRequest $valid 1 's4_start_e0'
Check ($written -ceq $request -and [IO.File]::ReadAllText($request) -ceq 'COFCONT1 1 s4_start_e0') 'Continue request exact adapter format'
Remove-CoopContinueRequest $valid; Check (-not [IO.File]::Exists($request)) 'stale Continue request removable'
$refused=$false; try { $null=Write-CoopContinueRequest $valid 1 's4_nightmare' } catch { $refused=$true }; Check ($refused -and -not [IO.File]::Exists($request)) 'unsupported Continue request map refused'
$bad=$bytes.Clone(); $bad[$bad.Length-1]=$bad[$bad.Length-1] -bxor 1
$backup=Write-Case 'backup' $bad $bytes; $header=Read-CoopCheckpointSlot $backup 1
Check ($header.Backup -and $header.Map -ceq 's4_start_e0') 'corrupt primary selects valid backup'
$null=Show 'Continue accepts valid backup without repairing files' $backup $true
$none=Write-Case 'corrupt' $bad $null; $null=Show 'corrupt file without backup refuses launch' $none $false
$unsupported=$bytes.Clone(); [Array]::Clear($unsupported,20,32); [Text.Encoding]::ASCII.GetBytes('s2_unknown').CopyTo($unsupported,20); [BitConverter]::GetBytes([uint32](Get-CoopCheckpointCrc32 $unsupported)).CopyTo($unsupported,16)
$wrong=Write-Case 'unsupported' $unsupported $null; $null=Show 'checksummed save for a map that is not installed refuses launch' $wrong $false
$later=$bytes.Clone(); [Array]::Clear($later,20,32); [Text.Encoding]::ASCII.GetBytes('s2_lake_e0').CopyTo($later,20); [BitConverter]::GetBytes([int]57).CopyTo($later,52); [BitConverter]::GetBytes([uint32](Get-CoopCheckpointCrc32 $later)).CopyTo($later,16)
$lake=Write-Case 'later' $later $null; $shown=Show 'later campaign save continues on its own map' $lake $true
 Check ($shown -ceq ('"'+$fakeSteam+'" -applaunch 223710 -console -dev -condebug -dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000 +maxplayers 2 +mp_footsteps 1 +sv_maxupdaterate 100 +sc_checkpoint_prepare 1 +map s2_lake_e0')) 'later campaign exact ShowCommand'
$legacyBad=$bytes.Clone(); [BitConverter]::GetBytes([int]57).CopyTo($legacyBad,52); [BitConverter]::GetBytes([uint32](Get-CoopCheckpointCrc32 $legacyBad)).CopyTo($legacyBad,16)
$anchor=Write-Case 'legacy-anchor' $legacyBad $null; $null=Show 'c_start save with an unknown recorder anchor refuses launch' $anchor $false
$null=Show 'explicit mismatched map refuses launch' $valid $false @('-Map','s4_start')
[IO.File]::WriteAllText((Join-Path $fixture 'verification.json'),(@{passed=$checks.Count;checks=@($checks);gameLaunched=$false;gameWrites=$false} | ConvertTo-Json -Depth 5))
Write-Output "PASS $($checks.Count) checkpoint launcher assertions; no game launch or writes."
