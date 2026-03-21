$path = 'components\gallery-section.tsx'
$content = Get-Content -Path $path
for ($i = 0; $i -lt $content.Length; $i++) {
    if ($content[$i] -match 'className="flex h-12 w-12.*border-white/10') {
        $content[$i] = '            className="flex h-12 w-12 items-center justify-center rounded-full border border-border-subtle bg-bg-secondary backdrop-blur-md text-text-muted transition-all hover:bg-surface-card-hover hover:border-border-default hover:text-text-primary"'
        break
    }
}
$content | Set-Content -Path $path
