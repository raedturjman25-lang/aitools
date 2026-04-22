$ErrorActionPreference = 'Stop'
Set-Location "c:\Users\raed\Desktop\my-ai-site\aitools"

$articles = @(
  @{
    Slug = 'free-ai-tools-2026'
    Title = 'Free AI Tools 2026: A Practical Comparison | AIToolsHubPro'
    Description = 'Compare the most useful free AI tools in 2026 by limits, quality, and workflow fit.'
    Url = 'https://aitoolshubpro.me/blog/free-ai-tools-2026/'
    Image = 'https://aitoolshubpro.me/images/blog/free-ai-tools-2026.png'
  },
  @{
    Slug = 'best-ai-apps-android-productivity'
    Title = 'Best AI Apps for Android Productivity | AIToolsHubPro'
    Description = 'A practical list of Android AI apps for notes, planning, summaries, and communication.'
    Url = 'https://aitoolshubpro.me/blog/best-ai-apps-android-productivity/'
    Image = 'https://aitoolshubpro.me/images/blog/android-productivity.png'
  },
  @{
    Slug = 'ai-first-content-workflow'
    Title = 'How to Build an AI-First Content Workflow | AIToolsHubPro'
    Description = 'Build an AI-first content pipeline from research to drafting, editing, and publishing.'
    Url = 'https://aitoolshubpro.me/blog/ai-first-content-workflow/'
    Image = 'https://aitoolshubpro.me/images/blog/content-workflow.png'
  },
  @{
    Slug = 'ai-video-apps-fast-marketing-campaigns'
    Title = 'AI Video Apps for Fast Marketing Campaigns | AIToolsHubPro'
    Description = 'Tools and process for producing social videos and campaign creatives quickly with AI.'
    Url = 'https://aitoolshubpro.me/blog/ai-video-apps-fast-marketing-campaigns/'
    Image = 'https://aitoolshubpro.me/images/blog/video-marketing.png'
  },
  @{
    Slug = 'ai-tool-pricing-checklist'
    Title = 'What to Look for in AI Tool Pricing | AIToolsHubPro'
    Description = 'A pricing checklist to evaluate AI plans, usage caps, team limits, and hidden costs.'
    Url = 'https://aitoolshubpro.me/blog/ai-tool-pricing-checklist/'
    Image = 'https://aitoolshubpro.me/images/blog/pricing-checklist.png'
  }
)

$roots = @('blog', 'dist/blog')

foreach ($root in $roots) {
  foreach ($article in $articles) {
    $filePath = Join-Path $root ($article.Slug + '/index.html')
    if (-not (Test-Path -LiteralPath $filePath)) {
      continue
    }

    $content = Get-Content -LiteralPath $filePath -Raw

    $content = [regex]::Replace($content, '(?m)^\s*<meta property="og:[^"]+"[^\r\n]*\r?\n', '')
    $content = [regex]::Replace($content, '(?m)^\s*<meta name="twitter:[^"]+"[^\r\n]*\r?\n', '')

    $socialMeta = @"
  <meta property="og:type" content="article">
  <meta property="og:title" content="$($article.Title)">
  <meta property="og:description" content="$($article.Description)">
  <meta property="og:url" content="$($article.Url)">
  <meta property="og:image" content="$($article.Image)">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="$($article.Title)">
  <meta name="twitter:description" content="$($article.Description)">
  <meta name="twitter:image" content="$($article.Image)">
"@

    $content = $content -replace '(?m)(\s*<meta name="keywords" content="[^"]*">\r?\n)', ("$1" + $socialMeta)

    Set-Content -LiteralPath $filePath -Value $content -NoNewline
    Write-Output "Updated $filePath"
  }
}

Write-Output 'DONE'
