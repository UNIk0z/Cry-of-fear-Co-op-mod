[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)][string]$PackageDirectory,
    [Parameter(Mandatory=$true)][string]$OriginalMapsDirectory,
    [Parameter(Mandatory=$true)][string]$RC2BuildDirectory,
    [Parameter(Mandatory=$true)][string]$RC3BuildDirectory,
    [Parameter(Mandatory=$true)][string]$NativeDllPath,
    [Parameter(Mandatory=$true)][string]$FixtureDirectory,
    [string]$PreviousBuildDirectory,
    [string]$PreviousAdapterPath
)
$ErrorActionPreference='Stop'
function Hash([string]$Path) {
    $digest=[Security.Cryptography.SHA256]::Create()
    try { return ([BitConverter]::ToString($digest.ComputeHash([IO.File]::ReadAllBytes($Path)))).Replace('-','').ToLowerInvariant() }
    finally { $digest.Dispose() }
}
$package=(Resolve-Path -LiteralPath $PackageDirectory).ProviderPath
$sources=(Resolve-Path -LiteralPath $OriginalMapsDirectory).ProviderPath
$rc2=(Resolve-Path -LiteralPath $RC2BuildDirectory).ProviderPath
$rc3=(Resolve-Path -LiteralPath $RC3BuildDirectory).ProviderPath
$native=(Resolve-Path -LiteralPath $NativeDllPath).ProviderPath
$fixture=[IO.Path]::GetFullPath($FixtureDirectory)
if (Test-Path -LiteralPath $fixture) { throw 'Use a fresh fixture directory; no deletion or reuse.' }
foreach ($inputPath in @($package,$sources,$rc2,$rc3,(Split-Path $native))) {
    if ($fixture.Equals($inputPath,[StringComparison]::OrdinalIgnoreCase) -or $fixture.StartsWith($inputPath.TrimEnd('\')+'\',[StringComparison]::OrdinalIgnoreCase)) { throw 'Fixture must be outside all input directories.' }
}
$catalog=[IO.File]::ReadAllText((Join-Path $package 'release.json')) | ConvertFrom-Json
$expectedMaps=5; if ($catalog.maintenance) { $expectedMaps=8 }; if ($catalog.coopFixes.id -cin @('coop-fixes-004','coop-fixes-005','coop-fixes-006','coop-fixes-007','coop-fixes-008','coop-fixes-009','coop-fixes-010','coop-fixes-011','coop-fixes-012','coop-fixes-013','coop-fixes-014')) { $expectedMaps=194 }
if ($catalog.release -cne 'story-state-rc4' -or $catalog.maps.Count -ne $expectedMaps -or $catalog.runtimeAdapter.file -cne 'storycoop_rc4.dll') { throw 'Expected complete RC4 package.' }
if ((Hash $native) -cne $catalog.nativeDllSha256 -or $catalog.nativeDllSha256 -cne '0036b91c01e92ed205513f52563053a55a66a32d257efb5f476b8f1f3dde0e63') { throw 'Expected pinned native snapshot.' }
$inputs=@{}
foreach ($entry in $catalog.maps) {
    $file=Join-Path $sources ($entry.sourceMap+'.bsp')
    if ((Hash $file) -cne $entry.sourceSha256) { throw 'Changed original fixture source.' }
    $inputs[$entry.sourceMap+'.bsp']=@{source=$file;hash=$entry.sourceSha256}
}
foreach ($entry in $catalog.dependencies) {
    $file=Join-Path $rc2 ($entry.map+'.bsp')
    if ((Hash $file) -cne $entry.outputSha256) { throw 'Changed RC2 fixture dependency.' }
    $inputs[$entry.map+'.bsp']=@{source=$file;hash=$entry.outputSha256}
}
foreach ($entry in $catalog.protectedParents) {
    $parent=$rc2; if ($entry.release -ceq 'rc3') { $parent=$rc3 }
    $file=Join-Path $parent ($entry.map+'.bsp')
    if ((Hash $file) -cne $entry.sha256) { throw 'Changed protected fixture parent.' }
    $inputs[$entry.map+'.bsp']=@{source=$file;hash=$entry.sha256}
}
$maps=Join-Path $fixture 'cryoffear\maps'; $dll=Join-Path $fixture 'cryoffear\cl_dlls\hl.dll'; $patch=Join-Path $fixture 'package'
[void][IO.Directory]::CreateDirectory($maps); [void][IO.Directory]::CreateDirectory((Split-Path $dll)); [void][IO.Directory]::CreateDirectory($patch)
foreach ($item in Get-ChildItem -LiteralPath $package) { Copy-Item -LiteralPath $item.FullName -Destination $patch -Recurse }
foreach ($name in $inputs.Keys) { Copy-Item -LiteralPath $inputs[$name].source -Destination (Join-Path $maps $name) }
Copy-Item -LiteralPath $native -Destination $dll
# coop-fixes-005 extras: the game's own Simon model must exist to be copied.
$extras=@($catalog.extras | Where-Object { $null -ne $_ }); $gameRoot=Join-Path $fixture 'cryoffear'
# coop-fixes-008 builds Simon from police1.mdl + cutscene\simon_clothes.mdl instead.
$modelSources=@('models\player.mdl'); if (@($extras | Where-Object { $_.build }).Count) { $modelSources=@('models\player\police1\police1.mdl','models\cutscene\simon_clothes.mdl') }
$playerModel=Join-Path $gameRoot $modelSources[0]
if ($extras.Count) { foreach ($m in $modelSources) { $t=Join-Path $gameRoot $m; [void][IO.Directory]::CreateDirectory((Split-Path $t)); Copy-Item -LiteralPath (Join-Path 'D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear' $m) -Destination $t }; $playerModelHash=Hash $playerModel }
# coop-fixes-010: the CO-OP title replaces the game's own gfx\vgui\menu_logo.tga.
$logoExtra=@($extras | Where-Object { $_.target -ceq 'gfx/vgui/menu_logo.tga' })
# coop-fixes-013: the Simon's Story main menu replaces cl_dlls\client.dll the same way.
$clientExtra=@($extras | Where-Object { $_.target -ceq 'cl_dlls/client.dll' })
if ($clientExtra.Count) { $client=Join-Path $gameRoot 'cl_dlls\client.dll'; $clientKeep=$client+'.storycoop-original'; $gameClient='D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\cl_dlls\client.dll'; if ([IO.File]::Exists($gameClient+'.storycoop-original')) { $gameClient+='.storycoop-original' }; Copy-Item -LiteralPath $gameClient -Destination $client; if ((Hash $client) -cne $clientExtra[0].replaces.sha256) { throw 'fixture needs the game''s own client.dll' }; $clientOriginal=[IO.File]::ReadAllBytes($client) }
if ($logoExtra.Count) { $logo=Join-Path $gameRoot 'gfx\vgui\menu_logo.tga'; $logoKeep=$logo+'.storycoop-original'; [void][IO.Directory]::CreateDirectory((Split-Path $logo)); $gameTitle='D:\SteamLibrary\steamapps\common\Cry of Fear\cryoffear\gfx\vgui\menu_logo.tga'; if ([IO.File]::Exists($gameTitle+'.storycoop-original')) { $gameTitle+='.storycoop-original' }; Copy-Item -LiteralPath $gameTitle -Destination $logo; if ((Hash $logo) -cne $logoExtra[0].replaces.sha256) { throw 'fixture needs the game''s own title' }; $logoOriginal=[IO.File]::ReadAllBytes($logo) }
# A replaced file counts as installed only when it holds the new version.
function Count-Extras { return @($extras | Where-Object { $p=Join-Path $gameRoot ($_.target.Replace('/','\')); [IO.File]::Exists($p) -and ($null -eq $_.replaces -or (Hash $p) -ceq $_.sha256) }).Count }
$adapter=Join-Path (Split-Path $dll) 'storycoop_rc4.dll'; $artifact=Join-Path $patch 'native\storycoop_rc4.dll'
$sentinel=Join-Path $maps 'c_start2_coop_note.bsp'; [IO.File]::WriteAllText($sentinel,'Unrelated baseline alias sentinel'); $sentinelHash=Hash $sentinel
$saveSentinel=Join-Path (Split-Path $maps) 'storycoop_saves\slot3.cofsave'; [void][IO.Directory]::CreateDirectory((Split-Path $saveSentinel)); [IO.File]::WriteAllText($saveSentinel,'Checkpoint files belong to host; installer must retain'); $saveSentinelHash=Hash $saveSentinel
$checks=New-Object 'System.Collections.Generic.List[string]'
function Check([bool]$Passed,[string]$Label) { if (-not $Passed) { throw "FAIL: $Label" }; $checks.Add($Label) }
function Invoke-Installer([string]$Label,[bool]$Success,[string[]]$Extra=@()) {
    $old=$ErrorActionPreference; $ErrorActionPreference='Continue'
    & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $patch 'install-story-package.ps1') -MapsDirectory $maps @Extra > (Join-Path $fixture ($Label+'.log')) 2>&1
    $result=$LASTEXITCODE; $ErrorActionPreference=$old
    Check (($result -eq 0) -eq $Success) $Label
}
function Count-Aliases { return @($catalog.maps | Where-Object { [IO.File]::Exists((Join-Path $maps ($_.map+'.bsp'))) }).Count }
function Check-Empty([string]$Label) { Check ((Count-Aliases) -eq 0 -and -not [IO.File]::Exists($adapter) -and (Count-Extras) -eq 0) $Label }
Invoke-Installer 'verify-no-writes' $true @('-VerifyOnly'); Check-Empty 'verify wrote neither aliases nor adapter'
if (@($catalog.dependencies).Count) {
$dependency=Join-Path $maps ($catalog.dependencies[0].map+'.bsp'); $dependencyBytes=[IO.File]::ReadAllBytes($dependency)
[IO.File]::Delete($dependency); Invoke-Installer 'missing-dependency-refused' $false; Check-Empty 'missing dependency before writes'
[IO.File]::WriteAllText($dependency,'changed RC2 dependency'); Invoke-Installer 'changed-dependency-refused' $false; Check-Empty 'changed dependency before writes'; [IO.File]::WriteAllBytes($dependency,$dependencyBytes)
} else { Check (-not $catalog.requiresFullRC2) "self-contained campaign has no RC2 route dependencies" }
$last=$catalog.maps[-1]; $original=Join-Path $maps ($last.sourceMap+'.bsp'); $originalBytes=[IO.File]::ReadAllBytes($original)
[IO.File]::WriteAllText($original,'bad source'); Invoke-Installer 'wrong-source-refused' $false; Check-Empty 'late source failure before writes'; [IO.File]::WriteAllBytes($original,$originalBytes)
$plan=Join-Path $patch ('plans\'+$last.map+'.json'); $planBytes=[IO.File]::ReadAllBytes($plan)
[IO.File]::AppendAllText($plan,"`n"); Invoke-Installer 'wrong-plan-refused' $false; Check-Empty 'late plan failure before writes'; [IO.File]::WriteAllBytes($plan,$planBytes)
$nativeBytes=[IO.File]::ReadAllBytes($dll)
[IO.File]::WriteAllText($dll,'bad native DLL'); Invoke-Installer 'wrong-backend-refused' $false; Check-Empty 'backend failure before writes'; [IO.File]::WriteAllBytes($dll,$nativeBytes)
$artifactBytes=[IO.File]::ReadAllBytes($artifact)
[IO.File]::AppendAllText($artifact,'changed adapter artifact'); Invoke-Installer 'wrong-artifact-refused' $false; Check-Empty 'artifact failure before writes'; [IO.File]::WriteAllBytes($artifact,$artifactBytes)
[IO.File]::WriteAllText($adapter,'unknown adapter'); Invoke-Installer 'unknown-adapter-refused' $false
Check ((Count-Aliases) -eq 0 -and [IO.File]::ReadAllText($adapter) -ceq 'unknown adapter') 'unknown adapter retained before map writes'; [IO.File]::Delete($adapter)
$alias=Join-Path $maps ($last.map+'.bsp'); [IO.File]::WriteAllText($alias,'unknown map')
Invoke-Installer 'unknown-map-refused' $false; Check ((Count-Aliases) -eq 1 -and -not [IO.File]::Exists($adapter)) 'unknown map prevents other installs'; Check ([IO.File]::ReadAllText($alias) -ceq 'unknown map') 'unknown map retained'; [IO.File]::Delete($alias)
Invoke-Installer 'install' $true
foreach ($entry in $catalog.maps) { Check ((Hash (Join-Path $maps ($entry.map+'.bsp'))) -ceq $entry.outputSha256) ('PowerShell equals Node '+$entry.map) }
Check ((Hash $adapter) -ceq $catalog.runtimeAdapter.sha256 -and ([IO.FileInfo]$adapter).Length -eq $catalog.runtimeAdapter.fileBytes) 'adapter artifact exact hash and length'
foreach ($extra in $extras) { Check ((Hash (Join-Path $gameRoot ($extra.target.Replace('/','\')))) -ceq $extra.sha256) ('extra installed exactly '+$extra.target) }
if ($extras.Count) {
    $custom=Join-Path $gameRoot 'maps\storycoop_new.custom'; $customBytes=[IO.File]::ReadAllBytes($custom)
    [IO.File]::AppendAllText($custom,'user change'); Invoke-Installer 'changed-extra-rollback-refused' $false @('-Remove')
    Check ((Count-Aliases) -eq $expectedMaps -and (Count-Extras) -eq $extras.Count -and [IO.File]::Exists($adapter)) 'changed extra blocks every removal'; [IO.File]::WriteAllBytes($custom,$customBytes)
}
Invoke-Installer 'repeat-install' $true
foreach ($entry in $catalog.maps) { Check ((Hash (Join-Path $maps ($entry.map+'.bsp'))) -ceq $entry.outputSha256) ('repeat retains '+$entry.map) }
Check ((Hash $adapter) -ceq $catalog.runtimeAdapter.sha256) 'repeat retains exact adapter'
[IO.File]::AppendAllText($adapter,'changed installed adapter'); Invoke-Installer 'changed-adapter-rollback-refused' $false @('-Remove')
Check ((Count-Aliases) -eq $expectedMaps -and [IO.File]::Exists($adapter)) 'adapter rollback guard before any deletions'; [IO.File]::WriteAllBytes($adapter,$artifactBytes)
$aliasBytes=[IO.File]::ReadAllBytes($alias); [IO.File]::AppendAllText($alias,'changed map'); Invoke-Installer 'changed-map-rollback-refused' $false @('-Remove')
Check ((Count-Aliases) -eq $expectedMaps -and (Hash $adapter) -ceq $catalog.runtimeAdapter.sha256) 'map rollback guard retains all maps and adapter'; [IO.File]::WriteAllBytes($alias,$aliasBytes)
Invoke-Installer 'remove' $true @('-Remove'); Check-Empty 'all known aliases and adapter removed'
if ($extras.Count) {
    Check (-not [IO.Directory]::Exists((Join-Path $gameRoot 'models\player\simon')) -and (Hash $playerModel) -ceq $playerModelHash) 'Simon folder removed; original player.mdl retained'
    # A different player.mdl only skips the optional model copy.
    $modelBytes=[IO.File]::ReadAllBytes($playerModel); [IO.File]::AppendAllText($playerModel,'other version')
    Invoke-Installer 'install-without-simon-model' $true; Check (-not [IO.File]::Exists((Join-Path $gameRoot 'models\player\simon\simon.mdl')) -and (Count-Extras) -eq ($extras.Count-1)) 'optional Simon model skipped for another player.mdl'
    Invoke-Installer 'remove-without-simon-model' $true @('-Remove'); Check-Empty 'partial extras removed'; [IO.File]::WriteAllBytes($playerModel,$modelBytes)
}
if ($logoExtra.Count) {
    # coop-fixes-010: remove put the game's own title back and dropped the kept copy.
    Check ((Hash $logo) -ceq $logoExtra[0].replaces.sha256 -and -not [IO.File]::Exists($logoKeep)) 'original menu title restored on remove'
    Invoke-Installer 'install-logo' $true; Check ((Hash $logo) -ceq $logoExtra[0].sha256 -and (Hash $logoKeep) -ceq $logoExtra[0].replaces.sha256) 'CO-OP title installed; original kept beside it'
    Invoke-Installer 'repeat-install-logo' $true; Check ((Hash $logo) -ceq $logoExtra[0].sha256 -and (Hash $logoKeep) -ceq $logoExtra[0].replaces.sha256) 'repeat install keeps the title and the kept original'
    # A changed kept original or a changed title blocks every removal.
    $keptBytes=[IO.File]::ReadAllBytes($logoKeep); [IO.File]::AppendAllText($logoKeep,'x'); Invoke-Installer 'changed-kept-title-refused' $false @('-Remove')
    Check ((Count-Aliases) -eq $expectedMaps -and (Hash $logo) -ceq $logoExtra[0].sha256) 'changed kept original blocks removal'; [IO.File]::WriteAllBytes($logoKeep,$keptBytes)
    $newBytes=[IO.File]::ReadAllBytes($logo); [IO.File]::AppendAllText($logo,'x'); Invoke-Installer 'changed-title-refused' $false @('-Remove')
    Check ((Count-Aliases) -eq $expectedMaps -and [IO.File]::Exists($logoKeep)) 'changed title blocks removal'; [IO.File]::WriteAllBytes($logo,$newBytes)
    # The installed title without its kept original is refused (it could never be undone).
    [IO.File]::Move($logoKeep,$logoKeep+'.aside'); Invoke-Installer 'title-without-original-refused' $false @('-Remove')
    Check ((Count-Aliases) -eq $expectedMaps) 'title without its original blocks removal'; [IO.File]::Move($logoKeep+'.aside',$logoKeep)
    Invoke-Installer 'remove-logo' $true @('-Remove'); Check-Empty 'remove after the title tests'
    Check ([IO.File]::ReadAllBytes($logo).Length -eq $logoOriginal.Length -and (Hash $logo) -ceq $logoExtra[0].replaces.sha256 -and -not [IO.File]::Exists($logoKeep)) 'original title restored again'
    # Another version of the game's title: the optional CO-OP title is skipped, the file untouched.
    [IO.File]::AppendAllText($logo,'other version'); $otherHash=Hash $logo
    Invoke-Installer 'install-without-logo' $true; Check ((Hash $logo) -ceq $otherHash -and -not [IO.File]::Exists($logoKeep) -and (Count-Extras) -eq ($extras.Count-1)) 'optional title skipped for another menu_logo.tga'
    Invoke-Installer 'remove-without-logo' $true @('-Remove'); Check (-not [IO.File]::Exists($adapter) -and (Hash $logo) -ceq $otherHash) 'remove leaves another menu_logo.tga alone'; [IO.File]::WriteAllBytes($logo,$logoOriginal)
}
if ($clientExtra.Count) {
    # coop-fixes-013: client.dll is patched from this PC's own file, the original kept and put back.
    Check ((Hash $client) -ceq $clientExtra[0].replaces.sha256 -and -not [IO.File]::Exists($clientKeep)) 'original client.dll restored on remove'
    Invoke-Installer 'install-client' $true; Check ((Hash $client) -ceq $clientExtra[0].sha256 -and (Hash $clientKeep) -ceq $clientExtra[0].replaces.sha256) 'Simon''s Story client.dll installed; original kept beside it'
    $patchedBytes=[IO.File]::ReadAllBytes($client); [IO.File]::AppendAllText($client,'x'); Invoke-Installer 'changed-client-refused' $false @('-Remove')
    Check ((Count-Aliases) -eq $expectedMaps -and [IO.File]::Exists($clientKeep)) 'changed client.dll blocks removal'; [IO.File]::WriteAllBytes($client,$patchedBytes)
    Invoke-Installer 'remove-client' $true @('-Remove'); Check ((Hash $client) -ceq $clientExtra[0].replaces.sha256 -and -not [IO.File]::Exists($clientKeep)) 'original client.dll restored again'
    [IO.File]::AppendAllText($client,'other version'); $otherClient=Hash $client
    Invoke-Installer 'install-without-client' $true; Check ((Hash $client) -ceq $otherClient -and -not [IO.File]::Exists($clientKeep) -and (Count-Extras) -eq ($extras.Count-1) -and ([IO.File]::ReadAllText((Join-Path $fixture 'install-without-client.log'))).Contains('main menu skipped')) 'optional client.dll menu skipped for another client.dll, and said so'
    Invoke-Installer 'remove-without-client' $true @('-Remove'); Check (-not [IO.File]::Exists($adapter) -and (Hash $client) -ceq $otherClient) 'remove leaves another client.dll alone'; [IO.File]::WriteAllBytes($client,$clientOriginal)
}
Invoke-Installer 'repeat-remove' $true @('-Remove'); Check-Empty 'repeat remove is harmless'
Check ((Hash $sentinel) -ceq $sentinelHash) 'unrelated baseline alias retained'
Check ((Hash $saveSentinel) -ceq $saveSentinelHash) 'host checkpoint files retained on removal'
foreach ($name in $inputs.Keys) { Check ((Hash (Join-Path $maps $name)) -ceq $inputs[$name].hash) ('protected source/RC2/RC3 retained '+$name) }
Check ((Hash $dll) -ceq $catalog.nativeDllSha256) 'native backend unchanged'
Check ((Hash $native) -ceq $catalog.nativeDllSha256) 'input native snapshot unchanged'
foreach ($source in $catalog.nativeSource) {
    $copiedSource=Join-Path $patch ('source\native-rc4\'+$source.file)
    Check ((Hash $copiedSource) -ceq $source.sha256 -and (Hash (Join-Path $package ('source\native-rc4\'+$source.file))) -ceq $source.sha256) ('own source exact copy '+$source.file)
}
$buildReport=[IO.File]::ReadAllText((Join-Path $patch 'native\build-report.json')) | ConvertFrom-Json
Check ($buildReport.sha256 -ceq $catalog.runtimeAdapter.sha256 -and $buildReport.exactNamesAndOrdinals -and $buildReport.jumpStubs -eq 843 -and -not $buildReport.nativeBackendLoaded) 'compiled artifact build QA retained'
foreach ($source in $buildReport.sources.PSObject.Properties) { Check ((Hash (Join-Path $patch ('source\native-rc4\'+$source.Name))) -ceq $source.Value) ('compiled source pin '+$source.Name) }
$launcher=Join-Path $patch 'host-story-coop.ps1'; $fakeSteam=Join-Path $fixture 'steam.exe'; [IO.File]::WriteAllText($fakeSteam,'ShowCommand-only fixture; never launched')
$shown=& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $launcher -SteamExe $fakeSteam -ShowCommand -Map cof_campaign_story4 -NativeRC4
Check ($LASTEXITCODE -eq 0 -and ($shown -join '') -ceq ('"'+$fakeSteam+'" -applaunch 223710 -console -dev -condebug -dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000 +maxplayers 2 +mp_footsteps 1 +sv_maxupdaterate 100 +map cof_campaign_story4')) 'RC4 launcher exact ShowCommand; no launch'
Check ([IO.File]::ReadAllText((Join-Path $patch 'Host RC4.cmd')).Contains(' -Map cof_campaign_story4 -NativeRC4')) 'RC4 cmd selects explicit native adapter'
if ($extras.Count) {
    $menuShown=& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $launcher -SteamExe $fakeSteam -ShowCommand -MenuOnly
    # coop-fixes-013 adds -insecure and, when Steam knows one, +name "<Steam display name>".
    $menuExpected=if ($clientExtra.Count) { '^'+[regex]::Escape('"'+$fakeSteam+'" -applaunch 223710 -condebug -insecure')+'( \+name "[^";\\%]+")?'+[regex]::Escape(' -dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000')+'$' } else { '^'+[regex]::Escape('"'+$fakeSteam+'" -applaunch 223710 -condebug -dll cl_dlls/storycoop_rc4.dll -num_edicts 4096 -heapsize 1024000')+'$' }
    Check ($LASTEXITCODE -eq 0 -and ($menuShown -join '') -cmatch $menuExpected) 'menu launcher exact ShowCommand; no map'
    Check ([IO.File]::ReadAllText((Join-Path $patch 'Start co-op menu.cmd')).Contains('host-story-coop.ps1" -MenuOnly')) 'Start co-op menu.cmd opens the main menu'
}
$old=$ErrorActionPreference; $ErrorActionPreference='Continue'
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $launcher -SteamExe $fakeSteam -ShowCommand -Map cof_campaign_story4 > (Join-Path $fixture 'launcher-missing-native.log') 2>&1
$missingNative=$LASTEXITCODE
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $launcher -SteamExe $fakeSteam -ShowCommand -Map cof_campaign_story3 -NativeRC4 > (Join-Path $fixture 'launcher-protected-rc3.log') 2>&1
$protectedRC3=$LASTEXITCODE; $ErrorActionPreference=$old
Check ($missingNative -ne 0) 'launcher requires native adapter for RC4'
Check ($protectedRC3 -ne 0) 'launcher refuses native adapter for protected RC3'
if ($catalog.hotfix) {
    if (-not $PreviousBuildDirectory -or -not $PreviousAdapterPath) { throw 'Hotfix fixture needs the retained previous map build and adapter.' }
    $previousCatalog=[IO.File]::ReadAllText((Join-Path $patch 'previous-rc4-rollback\release.json')) | ConvertFrom-Json
    Check ((Hash (Join-Path $patch 'previous-rc4-rollback\release.json')) -ceq $catalog.hotfix.previousCatalogSha256) 'previous RC4 catalog exact pin'
    foreach ($entry in $previousCatalog.maps) {
        $file=Join-Path $PreviousBuildDirectory ($entry.map+'.bsp')
        if ((Hash $file) -cne $entry.outputSha256) { throw 'Previous map input mismatch.' }
        Copy-Item -LiteralPath $file -Destination (Join-Path $maps ($entry.map+'.bsp'))
    }
    if ((Hash $PreviousAdapterPath) -cne $previousCatalog.runtimeAdapter.sha256) { throw 'Previous adapter input mismatch.' }
    Copy-Item -LiteralPath $PreviousAdapterPath -Destination $adapter
    if ($previousCatalog.runtimeAdapter.sha256 -ceq $catalog.runtimeAdapter.sha256) {
        # coop-fixes-010 keeps 009's maps and adapter: installing over 009 only adds what is new.
        Invoke-Installer 'hotfix-over-identical-previous' $true
        Check ((Count-Aliases) -eq $catalog.maps.Count -and (Hash $adapter) -ceq $catalog.runtimeAdapter.sha256 -and (Count-Extras) -eq $extras.Count) 'install over the identical previous build adds only the new files'
        Invoke-Installer 'hotfix-over-identical-previous-removed' $true @('-Remove'); Check-Empty 'removal after installing over the previous build'
        if ($logoExtra.Count) { Check ((Hash $logo) -ceq $logoExtra[0].replaces.sha256 -and -not [IO.File]::Exists($logoKeep)) 'original title back after that removal' }
        [IO.File]::WriteAllText((Join-Path $fixture 'verification.json'),(@{passed=$checks.Count;checks=@($checks);gameWrites=$false;runtimeVerified=$false;adapterSha256=$catalog.runtimeAdapter.sha256} | ConvertTo-Json -Depth 5))
        Write-Output "PASS $($checks.Count) RC4 fixture assertions; no game writes or launches."
        return
    }
    Invoke-Installer 'hotfix-refuses-installed-previous' $false
    Check ((Count-Aliases) -eq $previousCatalog.maps.Count -and (Hash $adapter) -ceq $previousCatalog.runtimeAdapter.sha256) 'previous installation retained on hotfix install refusal'
    function Invoke-PreviousRemover([string]$Label,[bool]$Success) {
        $oldPreference=$ErrorActionPreference; $ErrorActionPreference='Continue'
        & powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $patch 'previous-rc4-rollback\install-story-package.ps1') -Remove -MapsDirectory $maps > (Join-Path $fixture ($Label+'.log')) 2>&1
        $result=$LASTEXITCODE; $ErrorActionPreference=$oldPreference
        Check (($result -eq 0) -eq $Success) $Label
    }
    [IO.File]::AppendAllText($adapter,'unknown changed prior adapter')
    Invoke-PreviousRemover 'previous-remover-unknown-adapter-refused' $false
    Check ((Count-Aliases) -eq $previousCatalog.maps.Count -and [IO.File]::Exists($adapter)) 'previous remover guard before any deletion'
    Copy-Item -LiteralPath $PreviousAdapterPath -Destination $adapter
    Invoke-PreviousRemover 'previous-removal-for-upgrade' $true
    Check-Empty 'previous maps and adapter safely removed'
    Invoke-Installer 'install-hotfix-after-previous-removal' $true
    Invoke-PreviousRemover 'previous-remover-refuses-hotfix' $false
    foreach ($entry in $catalog.maps) { Check ((Hash (Join-Path $maps ($entry.map+'.bsp'))) -ceq $entry.outputSha256) ('old remover retains hotfix '+$entry.map) }
    Check ((Hash $adapter) -ceq $catalog.runtimeAdapter.sha256) 'old remover retains hotfix adapter'
    Invoke-Installer 'hotfix-rollback-after-upgrade' $true @('-Remove'); Check-Empty 'hotfix upgrade rollback complete'
    foreach ($name in $inputs.Keys) { Check ((Hash (Join-Path $maps $name)) -ceq $inputs[$name].hash) ('upgrade retains protected '+$name) }
    Check ((Hash $dll) -ceq $catalog.nativeDllSha256 -and (Hash $sentinel) -ceq $sentinelHash) 'upgrade retains original DLL and unrelated alias'
    Check ((Hash $saveSentinel) -ceq $saveSentinelHash) 'upgrade and rollback retain host checkpoint files'
}
[IO.File]::WriteAllText((Join-Path $fixture 'verification.json'),(@{passed=$checks.Count;checks=@($checks);gameWrites=$false;runtimeVerified=$false;adapterSha256=$catalog.runtimeAdapter.sha256} | ConvertTo-Json -Depth 5))
Write-Output "PASS $($checks.Count) RC4 fixture assertions; no game writes or launches."
