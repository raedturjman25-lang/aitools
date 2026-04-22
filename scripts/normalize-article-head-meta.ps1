$ErrorActionPreference = 'Stop'
Set-Location "c:\Users\raed\Desktop\my-ai-site\aitools"

$articles = @(
  @{
    Slug='free-ai-tools-2026'
    Title='Free AI Tools 2026: A Practical Comparison | AIToolsHubPro'
    Description='Compare the most useful free AI tools in 2026 by limits, quality, and workflow fit.'
    Keywords='free AI tools 2026, best free AI tools, AI productivity tools, AI tools comparison'
    Url='https://aitoolshubpro.me/blog/free-ai-tools-2026/'
    Image='https://aitoolshubpro.me/images/blog/free-ai-tools-2026.png'
  },
  @{
    Slug='best-ai-apps-android-productivity'
    Title='Best AI Apps for Android Productivity | AIToolsHubPro'
    Description='A practical list of Android AI apps for notes, planning, summaries, and communication.'
    Keywords='best AI apps for Android, Android productivity apps, AI note taking app, AI task management'
    Url='https://aitoolshubpro.me/blog/best-ai-apps-android-productivity/'
    Image='https://aitoolshubpro.me/images/blog/android-productivity.png'
  },
  @{
    Slug='ai-first-content-workflow'
    Title='How to Build an AI-First Content Workflow | AIToolsHubPro'
    Description='Build an AI-first content pipeline from research to drafting, editing, and publishing.'
    Keywords='AI-first content workflow, AI content pipeline, content automation, SEO content workflow'
    Url='https://aitoolshubpro.me/blog/ai-first-content-workflow/'
    Image='https://aitoolshubpro.me/images/blog/content-workflow.png'
  },
  @{
    Slug='ai-video-apps-fast-marketing-campaigns'
    Title='AI Video Apps for Fast Marketing Campaigns | AIToolsHubPro'
    Description='Tools and process for producing social videos and campaign creatives quickly with AI.'
    Keywords='AI video apps, AI marketing campaigns, short-form video tools, AI video editing'
    Url='https://aitoolshubpro.me/blog/ai-video-apps-fast-marketing-campaigns/'
    Image='https://aitoolshubpro.me/images/blog/video-marketing.png'
  },
  @{
    Slug='ai-tool-pricing-checklist'
    Title='What to Look for in AI Tool Pricing | AIToolsHubPro'
    Description='A pricing checklist to evaluate AI plans, usage caps, team limits, and hidden costs.'
    Keywords='AI tool pricing, AI pricing checklist, SaaS AI pricing, AI subscription value'
    Url='https://aitoolshubpro.me/blog/ai-tool-pricing-checklist/'
    Image='https://aitoolshubpro.me/images/blog/pricing-checklist.png'
  }
)

$roots = @('blog','dist/blog')

foreach($root in $roots){
  foreach($a in $articles){
    $file = Join-Path $root ($a.Slug + '/index.html')
    if(-not (Test-Path -LiteralPath $file)){ continue }

    $content = Get-Content -LiteralPath $file -Raw

    $headBlock = @"
  <title>$($a.Title)</title>
  <meta name="description" content="$($a.Description)">
  <meta name="keywords" content="$($a.Keywords)">
  <meta property="og:type" content="article">
  <meta property="og:title" content="$($a.Title)">
  <meta property="og:description" content="$($a.Description)">
  <meta property="og:url" content="$($a.Url)">
  <meta property="og:image" content="$($a.Image)">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="$($a.Title)">
  <meta name="twitter:description" content="$($a.Description)">
  <meta name="twitter:image" content="$($a.Image)">
  <meta name="robots" content="index,follow">
"@

    $pattern = '(?s)\s*<title>.*?</title>\s*<meta name="description".*?<meta name="robots" content="index,follow">\s*'
    $content = [regex]::Replace($content, $pattern, "`r`n$headBlock`r`n", 1)

    Set-Content -LiteralPath $file -Value $content -NoNewline
    Write-Output "Normalized $file"
  }
}

Write-Output 'DONE'
