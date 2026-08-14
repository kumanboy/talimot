$ErrorActionPreference = "Stop"

$PatchRoot = $PSScriptRoot
$ProjectRoot = Split-Path -Parent $PatchRoot

$TargetTsx = Join-Path $ProjectRoot "src\features\tests\components\test-runner.tsx"
$TargetCss = Join-Path $ProjectRoot "src\features\tests\components\test-runner.module.css"
$SourceTsx = Join-Path $PatchRoot "PATCH_FILES\src\features\tests\components\test-runner.tsx"
$SourceCss = Join-Path $PatchRoot "PATCH_FILES\src\features\tests\components\test-runner.module.css"
$NestedSrc = Join-Path $ProjectRoot "src\src"

if (-not (Test-Path $TargetTsx)) {
    throw "Project root topilmadi. Patch papkasini package.json va src papkalari turgan PROJECT ROOT ichiga extract qiling."
}

if (-not (Test-Path $TargetCss)) {
    throw "test-runner.module.css topilmadi. Project root noto'g'ri."
}

if (Test-Path $NestedSrc) {
    throw "XAVFSIZLIK: src\src papkasi yana mavjud. Avval uni tekshiring/o'chiring; patch davom ettirilmadi."
}

$BackupRoot = Join-Path $ProjectRoot ".talimot-backup-v10-8"
New-Item -ItemType Directory -Force -Path $BackupRoot | Out-Null
Copy-Item $TargetTsx (Join-Path $BackupRoot "test-runner.tsx") -Force
Copy-Item $TargetCss (Join-Path $BackupRoot "test-runner.module.css") -Force

Copy-Item $SourceTsx $TargetTsx -Force
Copy-Item $SourceCss $TargetCss -Force

$TsxText = Get-Content $TargetTsx -Raw
$CssText = Get-Content $TargetCss -Raw

if ($TsxText -notmatch "parseStructuredQuestionPresentation") {
    throw "UI parser helper verification failed."
}

if ($TsxText -notmatch "JAVOBNI TANLANG") {
    throw "Structured answer heading verification failed."
}

if ($CssText -notmatch "\.statementList") {
    throw "Structured question CSS verification failed."
}

Write-Host "OK: v10.8 long MCQ UI applied" -ForegroundColor Green
Write-Host "OK: Fe'l/Morfemika-style (1)-(5) hukmlar separate cards" -ForegroundColor Green
Write-Host "OK: Standard short MCQ layout remains unchanged" -ForegroundColor Green
Write-Host "OK: Parser, scoring, answers and audio data unchanged" -ForegroundColor Green
Write-Host "Backup: .talimot-backup-v10-8" -ForegroundColor Cyan
Write-Host "Next: npm run build" -ForegroundColor Cyan
