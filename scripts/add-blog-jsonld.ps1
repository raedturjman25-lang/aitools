$ErrorActionPreference = 'Stop'
Set-Location "c:\Users\raed\Desktop\my-ai-site\aitools"

$articles = @(
  @{
    Slug='free-ai-tools-2026'
    Title='Free AI Tools 2026: A Practical Comparison'
    Description='Compare the most useful free AI tools in 2026 by limits, quality, and workflow fit.'
    Url='https://aitoolshubpro.me/blog/free-ai-tools-2026/'
    Image='https://aitoolshubpro.me/images/blog/free-ai-tools-2026.png'
    DatePublished='2026-04-20'
  },
  @{
    Slug='best-ai-apps-android-productivity'
    Title='Best AI Apps for Android Productivity'
    Description='A practical list of Android AI apps for notes, planning, summaries, and communication.'
    Url='https://aitoolshubpro.me/blog/best-ai-apps-android-productivity/'
    Image='https://aitoolshubpro.me/images/blog/android-productivity.png'
    DatePublished='2026-04-22'
  },
  @{
    Slug='ai-first-content-workflow'
    Title='How to Build an AI-First Content Workflow'
    Description='Build an AI-first content pipeline from research to drafting, editing, and publishing.'
    Url='https://aitoolshubpro.me/blog/ai-first-content-workflow/'
    Image='https://aitoolshubpro.me/images/blog/content-workflow.png'
    DatePublished='2026-04-24'
  },
  @{
    Slug='ai-video-apps-fast-marketing-campaigns'
    Title='AI Video Apps for Fast Marketing Campaigns'
    Description='Tools and process for producing social videos and campaign creatives quickly with AI.'
    Url='https://aitoolshubpro.me/blog/ai-video-apps-fast-marketing-campaigns/'
    Image='https://aitoolshubpro.me/images/blog/video-marketing.png'
    DatePublished='2026-04-22'
  },
  @{
    Slug='ai-tool-pricing-checklist'
    Title='What to Look for in AI Tool Pricing'
    Description='A pricing checklist to evaluate AI plans, usage caps, team limits, and hidden costs.'
    Url='https://aitoolshubpro.me/blog/ai-tool-pricing-checklist/'
    Image='https://aitoolshubpro.me/images/blog/pricing-checklist.png'
    DatePublished='2026-04-22'
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

    $content = [regex]::Replace(
      $content,
      '(?s)\s*<script type="application/ld\+json">.*?</script>\s*',
      "`r`n"
    )

    $json = @"
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "$($article.Title)",
  "description": "$($article.Description)",
  "image": ["$($article.Image)"],
  "datePublished": "$($article.DatePublished)",
  "dateModified": "$($article.DatePublished)",
  "author": {
    "@type": "Organization",
    "name": "AIToolsHubPro editorial team"
  },
  "publisher": {
    "@type": "Organization",
    "name": "AIToolsHubPro",
    "logo": {
      "@type": "ImageObject",
      "url": "https://aitoolshubpro.me/images/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "$($article.Url)"
  }
}
"@

    $jsonLdBlock = @"

  <script type="application/ld+json">
$json
  </script>
"@
    $content = $content -replace '</head>', ($jsonLdBlock + '</head>')

    Set-Content -LiteralPath $filePath -Value $content -NoNewline
    Write-Output "Updated $filePath"
  }
}

Write-Output 'DONE'
