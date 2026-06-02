param(
    [string]$RemoteUrl = 'https://github.com/ramyasriee/Computer-vison-TRINAY.git',
    [string]$Branch = 'main'
)

Write-Host "Preparing repository for push to $RemoteUrl on branch $Branch"

if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git is not installed or not in PATH. Install Git and re-run this script."
    exit 1
}

# Initialize repo if needed
if (-not (Test-Path .git)) {
    git init
    Write-Host "Initialized new git repository"
}

# Ensure Git LFS is installed and attributes added
if (Get-Command git-lfs -ErrorAction SilentlyContinue) {
    git lfs install --local
    Write-Host "Git LFS initialized"
} else {
    Write-Host "Git LFS not found. If you have large model files, install Git LFS (https://git-lfs.github.com/)"
}

# Add .gitattributes and .gitignore early so LFS tracking works
git add .gitattributes .gitignore 2>$null

if (-not (git ls-files --error-unmatch .gitattributes 2>$null)) {
    git add .gitattributes
}
if (-not (git ls-files --error-unmatch .gitignore 2>$null)) {
    git add .gitignore
}

Write-Host "Staging all files (this will respect .gitignore)"
git add -A

if (-not (git diff --cached --quiet)) {
    git commit -m "Initial commit: TRINAY project"
} else {
    Write-Host "No changes to commit"
}

# Set remote
$existing = git remote get-url origin 2>$null
if ($existing) {
    Write-Host "Remote 'origin' already set to $existing"
    if ($existing -ne $RemoteUrl) {
        git remote remove origin
        git remote add origin $RemoteUrl
        Write-Host "Updated remote 'origin' to $RemoteUrl"
    }
} else {
    git remote add origin $RemoteUrl
    Write-Host "Added remote 'origin' -> $RemoteUrl"
}

git branch -M $Branch

Write-Host "Pushing to origin/$Branch (you may be prompted for credentials)"
git push -u origin $Branch

if ($LASTEXITCODE -ne 0) {
    Write-Error "Push failed. Ensure you have access to the remote and have authenticated (use 'gh auth login' or set up SSH keys)."
    exit $LASTEXITCODE
}

Write-Host "Push completed successfully."