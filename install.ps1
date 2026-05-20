# pilot-research installer for Windows (PowerShell)
# irm https://raw.githubusercontent.com/nmd2k/pilot-research/main/install.ps1 | iex

param(
    [switch]$DryRun,
    [switch]$Force,
    [switch]$Minimal,
    [switch]$All,
    [switch]$List,
    [string[]]$Only
)

$ErrorActionPreference = "Stop"
$Repo = if ($env:PILOT_REPO) { $env:PILOT_REPO } else { "nmd2k/pilot-research" }
$RawBase = "https://raw.githubusercontent.com/$Repo/main"

$PilotSkillNames = @(
    "using-pilot-research",
    "pilot-brainstorm",
    "pilot-literature",
    "pilot-execute",
    "pilot-write-paper",
    "pilot-peer-review"
)

function Get-ConfigHome {
    if ($env:XDG_CONFIG_HOME -and $env:XDG_CONFIG_HOME.Trim()) {
        return $env:XDG_CONFIG_HOME
    }
    Join-Path $env:USERPROFILE ".config"
}

function Get-Providers {
    $home = $env:USERPROFILE
    @(
        @{ Id = "claude"; Label = "Claude Code"; Detect = "command:claude" },
        @{ Id = "opencode"; Label = "OpenCode"; Detect = "command:opencode" },
        @{ Id = "cursor"; Label = "Cursor"; Detect = "dir:$home\.cursor||command:cursor" },
        @{ Id = "copilot"; Label = "GitHub Copilot"; Detect = "command:gh" },
        @{ Id = "codex"; Label = "Codex CLI"; Detect = "command:codex||dir:$home\.agents" },
        @{ Id = "antigravity"; Label = "Antigravity CLI"; Detect = "command:antigravity||dir:$home\.gemini" },
        @{ Id = "gemini"; Label = "Gemini CLI (deprecated)"; Detect = "command:gemini" }
    )
}

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
    foreach ($p in Get-Providers) {
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

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$LocalRepo = $null
if ((Test-Path (Join-Path $ScriptDir "install.ps1")) -and (Test-Path (Join-Path $ScriptDir "skills"))) {
    $LocalRepo = $ScriptDir
}

$script:SkillsSrc = ""
$script:RemoteSkillsTmp = ""

function Remove-RemoteSkillsTmp {
    if ($script:RemoteSkillsTmp -and (Test-Path $script:RemoteSkillsTmp)) {
        Remove-Item -Recurse -Force $script:RemoteSkillsTmp -ErrorAction SilentlyContinue
        $script:RemoteSkillsTmp = ""
    }
}

function Prepare-SkillsSource {
    $script:SkillsSrc = ""
    if ($LocalRepo) {
        $script:SkillsSrc = Join-Path $LocalRepo "skills"
        return $true
    }
    if ($DryRun) {
        Write-Host "  dry-run: skipping skills tarball download" -ForegroundColor DarkGray
        return $false
    }
    try {
        $tmp = Join-Path ([System.IO.Path]::GetTempPath()) ("pilot-skills-" + [Guid]::NewGuid().ToString())
        New-Item -ItemType Directory -Force -Path $tmp | Out-Null
        $tarball = Join-Path $tmp "repo.tgz"
        $tarUrl = "https://codeload.github.com/$Repo/tar.gz/main"
        Invoke-WebRequest -Uri $tarUrl -OutFile $tarball
        tar -xzf $tarball -C $tmp
        $extracted = Get-ChildItem $tmp -Directory | Where-Object { $_.Name -notmatch '^\.' } | Select-Object -First 1
        if (-not $extracted -or -not (Test-Path (Join-Path $extracted.FullName "skills"))) {
            throw "unexpected archive layout"
        }
        $script:SkillsSrc = Join-Path $extracted.FullName "skills"
        $script:RemoteSkillsTmp = $tmp
        return $true
    }
    catch {
        Write-Host "  failed to prepare skills from GitHub: $_" -ForegroundColor Red
        Remove-RemoteSkillsTmp
        return $false
    }
}

function Sync-PilotSkillsTo {
    param([string]$DestBase)
    if (-not $script:SkillsSrc -or -not (Test-Path $script:SkillsSrc)) {
        Write-Host "  skill sync skipped (no skills source)" -ForegroundColor Yellow
        return
    }
    if ($DryRun) {
        Write-Host "  would sync pilot skills -> $DestBase" -ForegroundColor DarkGray
        return
    }
    Write-Host "  syncing pilot skills -> $DestBase" -ForegroundColor DarkGray
    New-Item -ItemType Directory -Force -Path $DestBase | Out-Null
    foreach ($name in $PilotSkillNames) {
        $src = Join-Path $script:SkillsSrc $name
        if (-not (Test-Path $src)) {
            Write-Host "  missing skill in source: $name" -ForegroundColor Yellow
            continue
        }
        $dest = Join-Path $DestBase $name
        if (Test-Path $dest) { Remove-Item -Recurse -Force $dest | Out-Null }
        Copy-Item -Recurse -Force $src $dest | Out-Null
    }
}

function Remove-LegacyNestedOpenCodeSkills {
    $legacy = Join-Path $env:USERPROFILE ".opencode\skills\skills"
    if (Test-Path $legacy) {
        Write-Host "  removing legacy nested OpenCode skills: $legacy" -ForegroundColor DarkGray
        if (-not $DryRun) { Remove-Item -Recurse -Force $legacy }
    }
}

function Install-ClaudeCode {
    Write-Host "-> Claude Code detected" -ForegroundColor Yellow
    $targetDir = Join-Path $env:USERPROFILE ".claude-plugin\pilot-research"
    $hooksDir = Join-Path $targetDir "hooks"
    if ($DryRun) {
        Write-Host "  would configure Claude plugin under $targetDir" -ForegroundColor DarkGray
        Sync-PilotSkillsTo (Join-Path $targetDir "skills")
        Sync-PilotSkillsTo (Join-Path $env:USERPROFILE ".claude\skills")
        $script:Installed += "claude"
        return
    }
    New-Item -ItemType Directory -Force -Path $hooksDir | Out-Null

    $writeMeta = $Force -or -not (Test-Path (Join-Path $targetDir "plugin.json"))
    if ($writeMeta) {
        $gh = "https://github.com/$Repo"
        $pluginObj = [ordered]@{
            name = "pilot-research"
            description = "Research workflow skills for coding agents"
            version = "0.1.0"
            author = @{ name = "Pilot Research Contributors" }
            homepage = $gh
            repository = $gh
            license = "MIT"
            keywords = @("research", "pilot-literature", "pilot-brainstorm", "pilot-peer-review", "skills")
        }
        $pluginObj | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $targetDir "plugin.json")

        $hooksJson = @'
{
  "hooks": {
    "SessionStart": [
      {
        "type": "command",
        "command": "bash pilot-research/hooks/session-start"
      }
    ]
  }
}
'@
        Set-Content -Path (Join-Path $hooksDir "hooks.json") -Value $hooksJson
    }
    else {
        Write-Host "  Claude plugin.json already exists (use -Force to refresh)" -ForegroundColor DarkGray
        $script:Skipped += "claude:plugin-present"
    }

    $hookFile = Join-Path $hooksDir "session-start"
    if ($Force -or -not (Test-Path $hookFile)) {
        if ($LocalRepo) {
            Copy-Item (Join-Path $LocalRepo "hooks\session-start") $hookFile -Force
        }
        else {
            Invoke-WebRequest -Uri "$RawBase/hooks/session-start" -OutFile $hookFile
        }
    }

    Sync-PilotSkillsTo (Join-Path $targetDir "skills")
    Sync-PilotSkillsTo (Join-Path $env:USERPROFILE ".claude\skills")

    Write-Host "  pilot-research installed for Claude Code" -ForegroundColor Green
    $script:Installed += "claude"
}

function Install-OpenCode {
    Write-Host "-> OpenCode detected" -ForegroundColor Yellow
    Remove-LegacyNestedOpenCodeSkills
    $targetDir = Join-Path $env:USERPROFILE ".opencode\plugins"
    if ($DryRun) {
        Write-Host "  would install plugin + skills (OpenCode)" -ForegroundColor DarkGray
        $skillsRoot = Join-Path (Get-ConfigHome) "opencode\skills"
        Sync-PilotSkillsTo $skillsRoot
        $script:Installed += "opencode"
        return
    }
    New-Item -ItemType Directory -Force -Path $targetDir | Out-Null

    if ($Force -or -not (Test-Path (Join-Path $targetDir "pilot-research.js"))) {
        if ($LocalRepo) {
            Copy-Item (Join-Path $LocalRepo ".opencode\plugins\pilot-research.js") (Join-Path $targetDir "pilot-research.js") -Force
        }
        else {
            Invoke-WebRequest -Uri "$RawBase/.opencode/plugins/pilot-research.js" -OutFile (Join-Path $targetDir "pilot-research.js")
        }
    }
    else {
        Write-Host "  OpenCode pilot-research.js already present (use -Force to reinstall)" -ForegroundColor DarkGray
        $script:Skipped += "opencode:plugin-present"
    }

    $skillsRoot = Join-Path (Get-ConfigHome) "opencode\skills"
    Sync-PilotSkillsTo $skillsRoot

    Write-Host "  pilot-research installed for OpenCode (skills: $skillsRoot)" -ForegroundColor Green
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
    Set-Content -Path $Path -Value $Content -NoNewline:$false
    Write-Host "  wrote $Path" -ForegroundColor Green
}

$CursorRule = @"
---
description: Pilot Research - Research workflow skills for AI coding agents
globs:
alwaysApply: true
---

You have pilot-research skills installed under ~/.cursor/skills/. Follow the research workflow skills in your ``.research/`` wiki directory. Use the skill registry for: pilot-brainstorm, pilot-literature, pilot-execute, pilot-write-paper, pilot-peer-review.
"@

$CodexRule = @"
# Pilot Research

You have pilot-research skills installed under ~/.agents/skills/. Follow the research workflow skills in your ``.research/`` wiki directory.
"@

$GeminiRule = @"
# Pilot Research

You have pilot-research skills installed under ~/.agents/skills/. Follow the research workflow skills in your ``.research/`` wiki directory.
"@

$AntigravityRule = @"
# Pilot Research

You have pilot-research skills installed under ~/.gemini/skills/. Follow the research workflow skills in your ``.research/`` wiki directory.
"@

$GenericRule = "# Pilot Research`n`nYou have pilot-research skills installed. Follow the research workflow skills in your ``.research/`` wiki directory. All research artifacts go into ``.research/`` using wikilink conventions."

function Install-PilotCli {
    Write-Host "-> Installing pilot CLI" -ForegroundColor Yellow
    $binDir = Join-Path $env:USERPROFILE ".local\bin"
    if ($DryRun) {
        Write-Host "  would ensure directory and install pilot -> $binDir" -ForegroundColor DarkGray
        $script:Installed += "cli"
        return
    }
    New-Item -ItemType Directory -Force -Path $binDir | Out-Null

    if ($LocalRepo) {
        $pilotMjs = Join-Path $LocalRepo "cli\pilot.mjs"
        if (Test-Path $pilotMjs) {
            $cmdPath = Join-Path $binDir "pilot.cmd"
            $content = "@echo off`r`nnode `"$pilotMjs`" %*`r`n"
            Set-Content -Path $cmdPath -Value $content -Encoding ascii
            Write-Host "  pilot CLI -> $cmdPath (uses repo checkout)" -ForegroundColor Green
            $script:Installed += "cli"
            Write-Host "  Add $binDir to your PATH if needed." -ForegroundColor DarkGray
            return
        }
    }

    if (Get-Command npm -ErrorAction SilentlyContinue) {
        Write-Host "  Installing via npm (global)..." -ForegroundColor DarkGray
        & npm install -g pilot-research
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  pilot CLI installed via npm (package pilot-research)" -ForegroundColor Green
            $script:Installed += "cli"
            return
        }
        & npm install -g "github:$Repo"
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  pilot CLI installed via npm (github:$Repo)" -ForegroundColor Green
            $script:Installed += "cli"
            return
        }
        Write-Host "  npm global install failed. Try: npm install -g github:$Repo" -ForegroundColor Yellow
    }
    else {
        Write-Host "  npm not found." -ForegroundColor Yellow
    }

    if (Get-Command npx -ErrorAction SilentlyContinue) {
        $launcher = Join-Path $binDir "pilot.cmd"
        $pkg = "github:$Repo"
        $bat = "@echo off`r`nnpx --yes --package=$pkg pilot %*`r`n"
        Set-Content -Path $launcher -Value $bat -Encoding ascii
        Write-Host "  pilot launcher -> $launcher (npx; first run may download)" -ForegroundColor Green
        $script:Installed += "cli"
        Write-Host "  Add $binDir to your PATH if needed." -ForegroundColor DarkGray
        return
    }

    Write-Host "  Could not install pilot CLI. Install manually: npm install -g github:$Repo" -ForegroundColor Yellow
    $script:Skipped += "cli:install-failed"
}

try {
    Prepare-SkillsSource | Out-Null

    foreach ($p in Get-Providers) {
        $want = ($Only.Count -eq 0) -or ($Only -contains $p.Id)
        if (-not $want) { continue }
        $forcedOnly = $Only.Count -gt 0
        if (-not $forcedOnly -and -not (Test-Detect $p.Detect)) { continue }

        switch ($p.Id) {
            "claude" { Install-ClaudeCode }
            "opencode" { Install-OpenCode }
            "cursor" {
                Write-Host "-> Cursor detected" -ForegroundColor Yellow
                $cursorRulePath = Join-Path $env:USERPROFILE ".cursor\rules\pilot-research.mdc"
                Write-RuleFile $cursorRulePath $CursorRule
                Sync-PilotSkillsTo (Join-Path $env:USERPROFILE ".cursor\skills")
                $script:Installed += "cursor"
            }
            "copilot" { Write-RuleFile ".github\copilot-instructions.md" $GenericRule; $script:Installed += "copilot" }
            "codex" {
                Write-Host "-> Codex CLI detected" -ForegroundColor Yellow
                Sync-PilotSkillsTo (Join-Path $env:USERPROFILE ".agents\skills")
                Write-RuleFile (Join-Path $env:USERPROFILE ".agents\instructions.md") $CodexRule
                $script:Installed += "codex"
            }
            "antigravity" {
                Write-Host "-> Antigravity CLI detected" -ForegroundColor Yellow
                Sync-PilotSkillsTo (Join-Path $env:USERPROFILE ".gemini\skills")
                Write-RuleFile (Join-Path $env:USERPROFILE ".gemini\instructions.md") $AntigravityRule
                $script:Installed += "antigravity"
            }
            "gemini" {
                Write-Host "-> Gemini CLI (deprecated) detected" -ForegroundColor Yellow
                Sync-PilotSkillsTo (Join-Path $env:USERPROFILE ".agents\skills")
                Write-RuleFile (Join-Path $env:USERPROFILE ".gemini\instructions.md") $GeminiRule
                $script:Installed += "gemini"
            }
        }
    }

    if ($All) {
        Write-Host "-> Writing per-repo rule files (-All)" -ForegroundColor Yellow
        Write-RuleFile ".cursor\rules\pilot-research.mdc" $CursorRule
        Write-RuleFile ".github\copilot-instructions.md" $GenericRule
    }

    if (-not $Minimal) {
        Install-PilotCli
    }
}
finally {
    Remove-RemoteSkillsTmp
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
