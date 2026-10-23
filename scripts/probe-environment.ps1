[CmdletBinding()]
param([Parameter(Mandatory = $true)][string]$ReportPath)
$ErrorActionPreference = 'Stop'

function Read-ObservedFile([string]$FilePath) {
    try {
        $content = Get-Content -LiteralPath $FilePath -Raw -ErrorAction Stop
        return [ordered]@{ path = $FilePath; status = 'READ'; content = $content }
    } catch {
        # Access denial can be accompanied by a misleading "not found" error.
        $status = if ($_.CategoryInfo.Category -eq 'PermissionDenied' -or
            $_.Exception -is [System.UnauthorizedAccessException]) { 'BLOCKED' }
            elseif ($_.CategoryInfo.Category -eq 'ObjectNotFound') { 'MISSING' }
            else { 'FAILED' }
        return [ordered]@{ path = $FilePath; status = $status; error = $_.Exception.Message }
    }
}

$projectRoot = Split-Path -Parent $PSScriptRoot
$workspaceRoot = [IO.Path]::GetFullPath((Join-Path $projectRoot '..\..'))
$reportFullPath = [IO.Path]::GetFullPath($ReportPath)
$workspacePrefix = $workspaceRoot.TrimEnd('\') + '\'
if (-not $reportFullPath.StartsWith($workspacePrefix, [StringComparison]::OrdinalIgnoreCase)) {
    throw 'Report must be saved inside this workspace.'
}
if (Test-Path -LiteralPath $reportFullPath) { throw 'Report already exists; choose a fresh filename.' }
$reportParent = Split-Path -Parent $reportFullPath
if (-not (Test-Path -LiteralPath $reportParent -PathType Container)) { throw 'Create the report parent directory first.' }

$steamRoot = Join-Path ${env:ProgramFiles(x86)} 'Steam'
$libraryFile = Read-ObservedFile (Join-Path $steamRoot 'steamapps\libraryfolders.vdf')
$libraries = @()
if ($libraryFile.status -eq 'READ') {
    $pathMatches = [regex]::Matches($libraryFile.content, '"path"\s+"([^"]+)"')
    for ($index = 0; $index -lt $pathMatches.Count; $index++) {
        $begin = $pathMatches[$index].Index
        $end = if ($index + 1 -lt $pathMatches.Count) { $pathMatches[$index + 1].Index } else { $libraryFile.content.Length }
        $section = $libraryFile.content.Substring($begin, $end - $begin)
        # Only inspect libraries indexed for app 223710. Other drives may be offline.
        if ($section -match '"223710"\s+"') {
            $libraries += $pathMatches[$index].Groups[1].Value.Replace('\\', '\')
        }
    }
}
if ($libraries.Count -eq 0) { $libraries = @($steamRoot) }
$observedLibraries = @()
foreach ($libraryRoot in ($libraries | Select-Object -Unique)) {
    Write-Verbose "Inspecting Cry of Fear manifest in $libraryRoot"
    $manifest = Read-ObservedFile (Join-Path $libraryRoot 'steamapps\appmanifest_223710.acf')
    $entry = [ordered]@{ root = $libraryRoot; manifest = $manifest }
    if ($manifest.status -eq 'READ') {
        $match = [regex]::Match($manifest.content, '"installdir"\s+"([^"]+)"')
        if ($match.Success) {
            $install = Join-Path (Join-Path $libraryRoot 'steamapps\common') $match.Groups[1].Value
            $entry.installDirectory = $install
            try {
                $entry.topLevelFiles = @(Get-ChildItem -LiteralPath $install -File -ErrorAction Stop |
                    Select-Object Name, Length)
                $entry.topLevelDirectories = @(Get-ChildItem -LiteralPath $install -Directory -ErrorAction Stop |
                    Select-Object -ExpandProperty Name)
            } catch { $entry.layoutError = $_.Exception.Message }
        }
    }
    $observedLibraries += $entry
}

$vsRoot = Join-Path $env:ProgramFiles 'Microsoft Visual Studio\2022\Community'
$nodePath = Join-Path $vsRoot 'MSBuild\Microsoft\VisualStudio\NodeJs\node.exe'
$gitPath = Join-Path $vsRoot 'Common7\IDE\CommonExtensions\Microsoft\TeamFoundation\Team Explorer\Git\cmd\git.exe'
$toolResults = @()
foreach ($candidate in @(@{ name = 'node'; path = $nodePath }, @{ name = 'git'; path = $gitPath })) {
    if (Test-Path -LiteralPath $candidate.path -PathType Leaf) {
        try {
            $version = & $candidate.path --version 2>&1
            $toolResults += [ordered]@{ name = $candidate.name; path = $candidate.path; status = if ($LASTEXITCODE -eq 0) { 'VERIFIED' } else { 'FAILED' }; version = "$version" }
        } catch { $toolResults += [ordered]@{ name = $candidate.name; path = $candidate.path; status = 'FAILED'; error = $_.Exception.Message } }
    } else { $toolResults += [ordered]@{ name = $candidate.name; path = $candidate.path; status = 'NOT_FOUND_AT_CANDIDATE' } }
}
foreach ($name in @('python', 'py', 'bspguy', 'hammer', 'jack', 'ghidraRun')) {
    # Application-only lookup avoids implicit module discovery on absent tools.
    $command = Get-Command $name -CommandType Application -ErrorAction SilentlyContinue
    $toolResults += [ordered]@{ name = $name; path = if ($command) { $command.Source } else { $null }; status = if ($command -and $command.Source -like '*\WindowsApps\*') { 'STORE_ALIAS_NOT_VERIFIED' } elseif ($command) { 'LOCATED_NOT_EXECUTED' } else { 'NOT_ON_PATH' } }
}
$report = [ordered]@{ schemaVersion = 1; capturedUtc = [DateTime]::UtcNow.ToString('o'); libraryIndex = $libraryFile;
    libraries = $observedLibraries; tools = $toolResults; gameLaunch = 'NOT TESTED'; multiplayer = 'NOT TESTED' }
$json = $report | ConvertTo-Json -Depth 15
$stream = [IO.File]::Open($reportFullPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write)
try {
    $bytes = [Text.UTF8Encoding]::new($false).GetBytes($json + "`n")
    $stream.Write($bytes, 0, $bytes.Length)
} finally { $stream.Dispose() }
Write-Output "Environment report saved: $reportFullPath"
