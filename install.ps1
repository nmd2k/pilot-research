# pilot-research installer for Windows (PowerShell)
# irm https://raw.githubusercontent.com/OWNER/pilot-research/main/install.ps1 | iex

param(
    [switch]$DryRun,
    [switch]$Force,
    [switch]$Minimal,
    [switch]$All,
    [switch]$List,
    [string[]]$Only
)

$ErrorActionPreference = "Stop"
$Repo = "OWNER/pilot-research"
$RawBase = "https://raw.githubusercontent.com/$Repo/main"

$Providers = @(
    @{ Id = "claude"; Label = "Claude Code"; Detect = "command:claude" },
    @{ Id = "opencode"; Label = "OpenCode"; Detect = "command:opencode" },
    @{ Id = "cursor"; Label = "Cursor"; Detect = "dir:cursor" },
    @{ Id = "windsurf"; Label = "Windsurf"; Detect = "dir:windsurf" },
    @{ Id = "cline"; Label = "Cline"; Detect = "dir:cline" },
    @{ Id = "copilot"; Label = "GitHub Copilot"; Detect = "command:gh" },
    @{ Id = "codex"; Label = "Codex CLI"; Detect = "command:codex" }
)

function Test-Detect {
    param([string]$Spec)
    $clauses = $Spec -split '\|\|'
    foreach ($clause in $clauses) {
        $clause = $clause.Trim()
        if ($clause.StartsWith("command:")) {
            $cmd = $clause.Substring(8)
            if (Get-Command $cmd -ErrorAction SilentlyContinue) { return $true }
        }
        elseif ($clause.StartsWith("dir:")) {
            $dir = $clause.Substring(4)
            if (Test-Path $dir) { return $true }
        }
    }
    return $false
}

if ($List) {
    Write-Host "pilot-research supported agents" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "  ID              Agent                Detection"
    Write-Host "  ---              -----                ----------"
    foreach ($p in $Providers) {
        Write-Host "  $($p.Id.PadRight(16)) $($p.Label.PadRight(20)) $($p.Detect)"
    }
    Write-Host ""
    exit 0
}

if ($All -and $Minimal) {
    Write-Host "error: --all and --minimal are mutually exclusive" -ForegroundColor Red
    exit 2
}

$Installed = @()
$Skipped = @()
$Failed = @()

function Install-ClaudeCode {
    Write-Host "-> Claude Code detected" -ForegroundColor Yellow
    $targetDir = Join-Path $env:USERPROFILE ".claude-plugin\pilot-research"
    if ((Test-Path $targetDir) -and -not $Force) {
        Write-Host "  pilot-research already installed for Claude Code (use -Force to reinstall)" -ForegroundColor DarkGray
        $script:Skipped += "claude:already-installed"
        return
    }
    if ($DryRun) { Write-Host "  would create: $targetDir" -ForegroundColor DarkGray; return }
    New-Item -ItemType Directory -Force -Path "$targetDir\hooks" | Out-Null
    $pluginJson = @{
        name = "pilot-research"
        description = "Research workflow skills for coding agents"
        version = "0.1.0"
    } | ConvertTo-Json
    Set-Content -Path "$targetDir\plugin.json" -Value $pluginJson
    Write-Host "  pilot-research installed for Claude Code" -ForegroundColor Green
    $script:Installed += "claude"
}

function Install-OpenCode {
    Write-Host "-> OpenCode detected" -ForegroundColor Yellow
    $targetDir = Join-Path $env:USERPROFILE ".opencode\plugins"
    if ((Test-Path "$targetDir\pilot-research.js") -and -not $Force) {
        Write-Host "  pilot-research already installed for OpenCode (use -Force to reinstall)" -ForegroundColor DarkGray
        $script:Skipped += "opencode:already-installed"
        return
    }
    if ($DryRun) { Write-Host "  would create: $targetDir\pilot-research.js" -ForegroundColor DarkGray; return }
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null
    Invoke-WebRequest -Uri "$RawBase/.opencode/plugins/pilot-research.js" -OutFile "$targetDir\pilot-research.js" -ErrorAction SilentlyContinue
    Write-Host "  pilot-research installed for OpenCode" -ForegroundColor Green
    $script:Installed += "opencode"
}

function Write-RuleFile {
    param([string]$Path, [string]$Content)
    if ((Test-Path $Path) -and -not $Force) {
        Write-Host "  $Path already exists (use -Force to overwrite)" -ForegroundColor DarkGray
        $script:Skipped += "$Path:already-exists"
        return
    }
    if ($DryRun) { Write-Host "  would write: $Path" -ForegroundColor DarkGray; return }
    $dir = Split-Path $Path -Parent
    if ($dir) { New-Item -ItemType Directory -Force -Path $dir | Out-Null }
    Set-Content -Path $Path -Value $Content
    Write-Host "  wrote $Path" -ForegroundColor Green
    $script:Installed += (Split-Path $Path -Leaf)
}

$CursorRule = @"
---
description: Pilot Research - Research workflow skills for AI coding agents
globs:
alwaysApply: true
---

You have pilot-research skills installed. Follow the research workflow skills in your ``.research/`` wiki directory. All research artifacts go into ``.research/`` using wikilink conventions.
"@

$GenericRule = "# Pilot Research`n`nYou have pilot-research skills installed. Follow the research workflow skills in your ``.research/`` wiki directory. All research artifacts go into ``.research/`` using wikilink conventions."

foreach ($p in $Providers) {
    $want = ($Only.Count -eq 0) -or ($Only -contains $p.Id)
    if ($want -and (Test-Detect $p.Detect)) {
        switch ($p.Id) {
            "claude"   { Install-ClaudeCode }
            "opencode" { Install-OpenCode }
            "cursor"   { Write-RuleFile ".cursor\rules\pilot-research.mdc" $CursorRule }
            "windsurf" { Write-RuleFile ".windsurf\rules\pilot-research.md" $GenericRule }
            "cline"    { Write-RuleFile ".clinerules\pilot-research.md" $GenericRule }
            "copilot"  { Write-RuleFile ".github\copilot-instructions.md" $GenericRule }
            "codex"    { Write-RuleFile ".codex\instructions.md" $GenericRule }
        }
    }
}

if ($All) {
    Write-Host "-> Writing per-repo rule files (-All)" -ForegroundColor Yellow
    Write-RuleFile ".cursor\rules\pilot-research.mdc" $CursorRule
    Write-RuleFile ".windsurf\rules\pilot-research.md" $GenericRule
    Write-RuleFile ".clinerules\pilot-research.md" $GenericRule
    Write-RuleFile ".github\copilot-instructions.md" $GenericRule
}

if (-not $Minimal) {
    Write-Host "-> Installing pilot CLI" -ForegroundColor Yellow
    Write-Host "  CLI binary not yet available for Windows. Install via: npm install -g pilot-research" -ForegroundColor DarkGray
    $script:Skipped += "cli:not-yet-available"
}

Write-Host ""
Write-Host "pilot-research installer done" -ForegroundColor Cyan

if ($Installed.Count -gt 0) {
    Write-Host "  installed:" -ForegroundColor Green
    foreach ($a in $Installed) { Write-Host "    * $a" }
}
if ($Skipped.Count -gt 0) {
    Write-Host "  skipped:"
    foreach ($a in $Skipped) { Write-Host "    * $a" }
}
if ($Failed.Count -gt 0) {
    Write-Host "  failed:" -ForegroundColor Red
    foreach ($a in $Failed) { Write-Host "    * $a" }
}

Write-Host ""
Write-Host "  Start a session and your agent will discover pilot-research skills automatically." -ForegroundColor DarkGray
Write-Host "  Use 'pilot init' to initialize a research wiki in your project." -ForegroundColor DarkGray