$ErrorActionPreference = 'Stop'
Set-Location "c:\Users\raed\Desktop\my-ai-site\aitools"

$articles = @(
  @{
    Slug = 'free-ai-tools-2026'
    Keywords = 'free AI tools 2026, best free AI tools, AI productivity tools, AI tools comparison'
    Intro = 'This guide compares free AI tools 2026 options for writing, research, summarization, and daily productivity workflows.'
    P1 = 'If you are evaluating the best free AI tools, focus on output quality, monthly limits, watermark rules, and team collaboration support before deciding.'
    P2 = 'A practical AI tools comparison should include real test tasks such as drafting emails, summarizing long notes, and generating reusable templates for your workflow.'
    P3 = 'Choose free AI tools that can grow with your stack through integrations, export options, and predictable pricing once your usage expands.'
  },
  @{
    Slug = 'best-ai-apps-android-productivity'
    Keywords = 'best AI apps for Android, Android productivity apps, AI note taking app, AI task management'
    Intro = 'The best AI apps for Android can streamline note capture, scheduling, communication, and task execution on mobile-first teams.'
    P1 = 'When choosing Android productivity apps, prioritize speed, offline behavior, keyboard support, and reliable synchronization across phone and desktop environments.'
    P2 = 'A strong AI note taking app should convert voice notes to clear summaries, extract action items, and organize ideas by project context automatically.'
    P3 = 'For AI task management, prefer apps that connect with calendar and chat tools so your Android workflow remains centralized and easy to maintain.'
  },
  @{
    Slug = 'ai-first-content-workflow'
    Keywords = 'AI-first content workflow, AI content pipeline, content automation, SEO content workflow'
    Intro = 'An AI-first content workflow helps teams ship more high-quality articles by combining strategy, drafting, editing, and publishing in one repeatable system.'
    P1 = 'Build your AI content pipeline with clear stages: keyword research, outline creation, first draft generation, expert review, and final on-page SEO optimization.'
    P2 = 'Use content automation carefully by automating repetitive steps only, while keeping editorial judgment for claims, brand voice, and factual accuracy.'
    P3 = 'A strong SEO content workflow should track search intent, internal links, metadata, and update cycles to keep articles relevant over time.'
  },
  @{
    Slug = 'ai-video-apps-fast-marketing-campaigns'
    Keywords = 'AI video apps, AI marketing campaigns, short-form video tools, AI video editing'
    Intro = 'AI video apps can accelerate campaign production from script to final edit, helping teams launch AI marketing campaigns in hours instead of days.'
    P1 = 'Choose short-form video tools that offer brand kit support, subtitle automation, and platform-specific exports for TikTok, Reels, and YouTube Shorts.'
    P2 = 'For reliable AI video editing, test voiceover quality, scene consistency, and manual timeline controls to keep creative direction in your hands.'
    P3 = 'The best workflow for AI marketing campaigns combines template libraries, rapid A/B variations, and performance feedback loops after publishing.'
  },
  @{
    Slug = 'ai-tool-pricing-checklist'
    Keywords = 'AI tool pricing, AI pricing checklist, SaaS AI pricing, AI subscription value'
    Intro = 'Use this AI pricing checklist to evaluate AI tool pricing models and avoid hidden limits that reduce long-term value.'
    P1 = 'In SaaS AI pricing, compare seat policies, token limits, overage rules, and feature gates to understand true operating cost per team member.'
    P2 = 'A useful AI subscription value review should include uptime guarantees, support quality, integration depth, and historical price stability.'
    P3 = 'Before committing, run a 30-day cost simulation using real workloads so your AI tool pricing decision is data-backed and sustainable.'
  }
)

$targetRoots = @('blog', 'dist/blog')

foreach ($root in $targetRoots) {
  foreach ($article in $articles) {
    $filePath = Join-Path $root ($article.Slug + '/index.html')
    if (-not (Test-Path -LiteralPath $filePath)) {
      continue
    }

    $content = Get-Content -LiteralPath $filePath -Raw

    $keywordsMeta = ('  <meta name="keywords" content="{0}">' -f $article.Keywords)
    if ($content -notmatch '<meta name="keywords"') {
      $content = $content -replace '(?m)(\s*<meta name="description" content="[^"]*">\r?\n)', ("$1" + $keywordsMeta + "`r`n")
    } else {
      $content = $content -replace '(?m)<meta name="keywords" content="[^"]*">', $keywordsMeta.Trim()
    }

    $content = $content -replace '(?s)<p>.*?</p>\s*<p>Start by defining your exact use case, then shortlist tools based on speed, output quality, and integration fit\.</p>\s*<p>Run a one-week trial with real tasks, track time saved, and compare outcomes before rolling out to your full workflow\.</p>\s*<p>Document prompts, templates, and quality checks so your process stays consistent as your content volume grows\.</p>', "<p>$($article.Intro)</p>`r`n        <p>$($article.P1)</p>`r`n        <p>$($article.P2)</p>`r`n        <p>$($article.P3)</p>"

    Set-Content -LiteralPath $filePath -Value $content -NoNewline
    Write-Output "Updated $filePath"
  }
}

Write-Output 'DONE'
