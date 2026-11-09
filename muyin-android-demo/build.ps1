param(
    [string]$SdkRoot = $env:ANDROID_HOME,
    [string]$JdkHome = $env:JAVA_HOME,
    [string]$OutputPath = (Join-Path $PSScriptRoot 'muyin-demo-0.1.0.apk')
)
$ErrorActionPreference = 'Stop'
if (-not $SdkRoot -or -not $JdkHome) { throw 'Pass -SdkRoot and -JdkHome, or set ANDROID_HOME and JAVA_HOME.' }
$SdkRoot = (Resolve-Path -LiteralPath $SdkRoot).Path
$JdkHome = (Resolve-Path -LiteralPath $JdkHome).Path
$env:JAVA_HOME = $JdkHome
$env:PATH = (Join-Path $JdkHome 'bin') + ';' + $env:PATH
$tools = Join-Path $SdkRoot 'build-tools/35.0.0'
$platform = Join-Path $SdkRoot 'platforms/android-35/android.jar'
$build = Join-Path $PSScriptRoot ('.local/build-' + (Get-Date -Format 'yyyyMMdd-HHmmss-fff'))
$signing = Join-Path $PSScriptRoot '.local/demo-signing.jks'
New-Item -ItemType Directory -Force -Path $build,(Join-Path $build 'classes'),(Join-Path $build 'dex') | Out-Null
function Check-Result([string]$Step) { if ($LASTEXITCODE -ne 0) { throw "$Step failed with exit code $LASTEXITCODE" } }
& (Join-Path $tools 'aapt.exe') package -f -M (Join-Path $PSScriptRoot 'AndroidManifest.xml') -S (Join-Path $PSScriptRoot 'res') -A (Join-Path $PSScriptRoot 'assets') -I $platform -F (Join-Path $build 'resources.apk')
Check-Result 'Resource packaging'
$sourceFiles = @(Get-ChildItem -LiteralPath (Join-Path $PSScriptRoot 'src') -Recurse -Filter '*.java' | ForEach-Object FullName)
& (Join-Path $JdkHome 'bin/javac.exe') -encoding UTF-8 -source 8 -target 8 -classpath $platform -d (Join-Path $build 'classes') @sourceFiles
Check-Result 'Java compilation'
$classFiles = @(Get-ChildItem -LiteralPath (Join-Path $build 'classes') -Recurse -Filter '*.class' | ForEach-Object FullName)
# Invoke SDK jars directly so paths containing spaces remain correctly quoted.
& (Join-Path $JdkHome 'bin/java.exe') -cp (Join-Path $tools 'lib/d8.jar') com.android.tools.r8.D8 --lib $platform --min-api 26 --output (Join-Path $build 'dex') @classFiles
Check-Result 'DEX compilation'
Copy-Item -LiteralPath (Join-Path $build 'resources.apk') -Destination (Join-Path $build 'unsigned.apk')
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::Open((Join-Path $build 'unsigned.apk'),[System.IO.Compression.ZipArchiveMode]::Update)
try { [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip,(Join-Path $build 'dex/classes.dex'),'classes.dex') | Out-Null } finally { $zip.Dispose() }
& (Join-Path $tools 'zipalign.exe') -f -p 4 (Join-Path $build 'unsigned.apk') (Join-Path $build 'aligned.apk')
Check-Result 'APK alignment'
if (-not (Test-Path -LiteralPath $signing)) {
    & (Join-Path $JdkHome 'bin/keytool.exe') -genkeypair -keystore $signing -storepass android -keypass android -alias muyin-demo -keyalg RSA -keysize 2048 -validity 3650 -dname 'CN=Muyin Demo, O=Student Demo, C=CN'
    Check-Result 'Demo signing key creation'
}
& (Join-Path $JdkHome 'bin/java.exe') -jar (Join-Path $tools 'lib/apksigner.jar') sign --ks $signing --ks-key-alias muyin-demo --ks-pass pass:android --key-pass pass:android --out $OutputPath (Join-Path $build 'aligned.apk')
Check-Result 'APK signing'
& (Join-Path $JdkHome 'bin/java.exe') -jar (Join-Path $tools 'lib/apksigner.jar') verify --verbose $OutputPath
Check-Result 'APK verification'
Write-Output "Built: $OutputPath"
