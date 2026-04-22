$ErrorActionPreference = 'Stop'
Set-Location "c:\Users\raed\Desktop\my-ai-site\aitools"

$map = @{
  'free-ai-tools-2026' = @{ 
    Title='Free AI Tools 2026: A Practical Comparison | AIToolsHubPro'
    Desc='Compare the most useful free AI tools in 2026 by limits, quality, and workflow fit.'
    Keys='free AI tools 2026, best free AI tools, AI productivity tools, AI tools comparison'
  }
  'best-ai-apps-android-productivity' = @{ 
    Title='Best AI Apps for Android Productivity | AIToolsHubPro'
    Desc='A practical list of Android AI apps for notes, planning, summaries, and communication.'
    Keys='best AI apps for Android, Android productivity apps, AI note taking app, AI task management'
  }
  'ai-first-content-workflow' = @{ 
    Title='How to Build an AI-First Content Workflow | AIToolsHubPro'
    Desc='Build an AI-first content pipeline from research to drafting, editing, and publishing.'
    Keys='AI-first content workflow, AI content pipeline, content automation, SEO content workflow'
  }
  'ai-video-apps-fast-marketing-campaigns' = @{ 
    Title='AI Video Apps for Fast Marketing Campaigns | AIToolsHubPro'
    Desc='Tools and process for producing social videos and campaign creatives quickly with AI.'
    Keys='AI video apps, AI marketing campaigns, short-form video tools, AI video editing'
  }
  'ai-tool-pricing-checklist' = @{ 
    Title='What to Look for in AI Tool Pricing | AIToolsHubPro'
    Desc='A pricing checklist to evaluate AI plans, usage caps, team limits, and hidden costs.'
    Keys='AI tool pricing, AI pricing checklist, SaaS AI pricing, AI subscription value'
  }
}

$roots = @('blog', 'dist/blog')

foreach ($root in $roots) {
  foreach ($slug in $map.Keys) {
    $file = Join-Path $root ($slug + '/index.html')
    if (-not (Test-Path -LiteralPath $file)) {
      continue
    }

    $content = Get-Content -LiteralPath $file -Raw

    $newHead = @"
  <title>$($map[$slug].Title)</title>
  <meta name="description" content="$($map[$slug].Desc)">
  <meta name="keywords" content="$($map[$slug].Keys)">
"@

    $content = [regex]::Replace(
      $content,
      '(?s)\s*<title>.*?</title>\s*(<meta name="description" content="[^"]*">\s*)?(<meta name="keywords" content="[^"]*">\s*)?',
      "`r`n$newHead`r`n",
      1
    )

    Set-Content -LiteralPath $file -Value $content -NoNewline
    Write-Output "Fixed $file"
  }
}

Write-Output 'DONE'
