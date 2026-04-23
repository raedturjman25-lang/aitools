$ErrorActionPreference = 'Stop'
Set-Location "c:\Users\raed\Desktop\my-ai-site\aitools"

$tools = @(
  @{ Slug='writepilot-ai'; Name='WritePilot AI'; Category='Writing'; Image='/images/tools/writepilot-ai.PNG'; Price='Free + paid plans'; Platforms='Web'; BestFor='SEO writing, long-form articles, and conversion-focused landing pages'; Summary='WritePilot AI helps creators and marketing teams produce high-quality written content at scale with structured workflows and brand consistency.' },
  @{ Slug='promptsmith'; Name='PromptSmith'; Category='Writing'; Image='/images/tools/promptsmith.PNG'; Price='Paid plans'; Platforms='Web, Team'; BestFor='Prompt management, team template libraries, and standardized AI workflows'; Summary='PromptSmith gives teams a central prompt system with reusable templates, quality controls, and faster execution across departments.' },
  @{ Slug='imageforge-studio'; Name='ImageForge Studio'; Category='Design'; Image='/images/tools/imageforge-studio.PNG'; Price='Paid plans'; Platforms='Web'; BestFor='Campaign visuals, social creatives, and ad asset production'; Summary='ImageForge Studio is designed for marketers and designers who need fast visual output while keeping brand quality and creative control.' },
  @{ Slug='scenecanvas-ai'; Name='SceneCanvas AI'; Category='Design'; Image='/images/tools/scenecanvas-ai.png'; Price='Free + paid plans'; Platforms='Web'; BestFor='Concept art direction, storyboard creation, and visual ideation'; Summary='SceneCanvas AI transforms plain language into clear visual concepts for teams that need to plan creatives before full production.' },
  @{ Slug='videoflow-ai'; Name='VideoFlow AI'; Category='Video'; Image='/images/tools/videoflow-ai.PNG'; Price='Paid plans'; Platforms='Web'; BestFor='Script-to-video production for social campaigns and product explainers'; Summary='VideoFlow AI accelerates video production by combining scripting, voiceover, scene generation, and caption workflows in one tool.' },
  @{ Slug='clipgen-pro'; Name='ClipGen Pro'; Category='Video'; Image='/images/tools/clipgen-pro.png'; Price='Free + paid plans'; Platforms='Web'; BestFor='Repurposing long-form content into short social clips'; Summary='ClipGen Pro helps teams convert podcasts, interviews, and webinars into multiple short clips optimized for modern social platforms.' },
  @{ Slug='taskbrain-mobile'; Name='TaskBrain Mobile'; Category='Productivity'; Image='/images/tools/taskbrain-mobile.png'; Price='Free + paid plans'; Platforms='Android'; BestFor='Priority planning, personal execution systems, and daily focus routines'; Summary='TaskBrain Mobile helps users prioritize what matters most and turn daily goals into clear, trackable action blocks.' },
  @{ Slug='inboxmate-ai'; Name='InboxMate AI'; Category='Productivity'; Image='/images/tools/inboxmate-ai.png'; Price='Paid plans'; Platforms='Web'; BestFor='Email triage, smart replies, and communication workflows'; Summary='InboxMate AI reduces inbox overload by auto-summarizing threads and proposing context-aware drafts for faster communication.' },
  @{ Slug='datalens-ai'; Name='DataLens AI'; Category='Research'; Image='/images/tools/datalens-ai.png'; Price='Paid plans'; Platforms='Web, Team'; BestFor='Data exploration, chart generation, and reporting support'; Summary='DataLens AI lets non-technical teams ask questions in natural language and get practical data insights quickly.' },
  @{ Slug='researchscope'; Name='ResearchScope'; Category='Research'; Image='/images/tools/researchscope.png'; Price='Free + paid plans'; Platforms='Web'; BestFor='Document analysis, research briefs, and insight extraction'; Summary='ResearchScope condenses long documents into usable findings, helping teams move from reading to decisions faster.' },
  @{ Slug='voicebrief'; Name='VoiceBrief'; Category='Productivity'; Image='/images/tools/voicebrief.png'; Price='Paid plans'; Platforms='Web, Mobile'; BestFor='Meeting transcription, summaries, and action tracking'; Summary='VoiceBrief captures spoken discussions and turns them into structured summaries and actionable next steps.' },
  @{ Slug='codesprint-ai'; Name='CodeSprint AI'; Category='Developer'; Image='/images/tools/codesprint-ai.png'; Price='Free + paid plans'; Platforms='Web'; BestFor='Code scaffolding, test generation, and documentation acceleration'; Summary='CodeSprint AI supports engineering teams by reducing setup time and improving consistency in code quality workflows.' },
  @{ Slug='notesnap-ai'; Name='NoteSnap AI'; Category='Productivity'; Image='/images/home/notesnap-ai.png'; Price='Free + paid plans'; Platforms='Mobile, Web'; BestFor='Smart notes, screenshot understanding, and task extraction'; Summary='NoteSnap AI converts raw notes into concise action plans to help users keep momentum and reduce context switching.' },
  @{ Slug='promptboard'; Name='PromptBoard'; Category='Productivity'; Image='/images/home/promptboard.png'; Price='Free + paid plans'; Platforms='Web'; BestFor='Saving and organizing high-performing prompts across use cases'; Summary='PromptBoard provides a clean system to store, categorize, and improve prompts so teams can reuse what works.' },
  @{ Slug='focussprint-ai'; Name='FocusSprint AI'; Category='Productivity'; Image='/images/home/focussprint-ai.png'; Price='Paid plans'; Platforms='Mobile, Web'; BestFor='Deep work sessions, anti-distraction routines, and execution rhythm'; Summary='FocusSprint AI is built to improve concentration by structuring work cycles and protecting high-value focus windows.' },
  @{ Slug='swiftdraft-ai'; Name='SwiftDraft AI'; Category='Writing'; Image='/images/home/swiftdraft-ai.png'; Price='Paid plans'; Platforms='Web'; BestFor='Long-form drafts, content briefs, and editorial preparation'; Summary='SwiftDraft AI helps content teams move from topic idea to first draft faster while preserving structure and quality.' },
  @{ Slug='pixelassist'; Name='PixelAssist'; Category='Design'; Image='/images/home/pixelassist.png'; Price='Paid plans'; Platforms='Web'; BestFor='Brand-consistent visual production for social and ad channels'; Summary='PixelAssist keeps design output visually consistent and campaign-ready across formats and channels.' },
  @{ Slug='workflowpilot'; Name='WorkflowPilot'; Category='Productivity'; Image='/images/home/workflowpilot.png'; Price='Paid plans'; Platforms='Web, Team'; BestFor='Process automation, handoff reliability, and operational efficiency'; Summary='WorkflowPilot connects repetitive steps into automated flows so teams can spend more time on strategic work.' }
)

$roots = @('tools', 'dist/tools')

foreach ($root in $roots) {
  foreach ($tool in $tools) {
    $dir = Join-Path $root $tool.Slug
    if (-not (Test-Path -LiteralPath $dir)) {
      New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }

    $url = "https://aitoolshubpro.me/tools/$($tool.Slug)/"
    $title = "$($tool.Name): Detailed Review & Use Cases | AIToolsHubPro"
    $description = "Detailed review of $($tool.Name), including core features, ideal use cases, pricing context, and implementation guidance."

    $content = @"
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>$title</title>
  <meta name="description" content="$description">
  <meta name="keywords" content="$($tool.Name), $($tool.Category) AI tool, AI productivity tool, detailed tool review">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="$url">
  <meta property="og:type" content="article">
  <meta property="og:title" content="$title">
  <meta property="og:description" content="$description">
  <meta property="og:url" content="$url">
  <meta property="og:image" content="https://aitoolshubpro.me$($tool.Image)">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="$title">
  <meta name="twitter:description" content="$description">
  <meta name="twitter:image" content="https://aitoolshubpro.me$($tool.Image)">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" type="image/png" href="/images/logo.png">
  <link rel="apple-touch-icon" href="/images/logo.png">
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "$($tool.Name)",
  "applicationCategory": "$($tool.Category)",
  "operatingSystem": "$($tool.Platforms)",
  "description": "$description",
  "url": "$url",
  "image": "https://aitoolshubpro.me$($tool.Image)",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "description": "$($tool.Price)"
  }
}
  </script>
  <script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://aitoolshubpro.me/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://aitoolshubpro.me/tools/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "$($tool.Name)",
      "item": "$url"
    }
  ]
}
  </script>
</head>
<body>
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="/" aria-label="AIToolsHubPro home">
        <img class="brand-logo" src="/images/logo.png" alt="AIToolsHubPro Logo" width="156" height="40" loading="eager" decoding="async">
      </a>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-nav-toggle>
        <span class="nav-toggle-line"></span>
        <span class="nav-toggle-line"></span>
        <span class="nav-toggle-line"></span>
      </button>
      <nav class="main-nav" data-nav-menu>
        <a href="/">Home</a>
        <a class="active" href="/tools/">Tools</a>
        <a href="/blog/">Blog</a>
        <a href="/about/">About</a>
      </nav>
    </div>
  </header>

  <main class="section">
    <div class="container article-layout">
      <article class="article-content">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span>/</span>
          <a href="/tools/">Tools</a>
          <span>/</span>
          <span aria-current="page">$($tool.Name)</span>
        </nav>

        <h1>$($tool.Name): Complete Breakdown, Use Cases, and Practical Fit</h1>
        <p class="muted">Category: $($tool.Category)</p>

        <figure class="article-hero-image">
          <img src="$($tool.Image)" alt="$($tool.Name) product overview image" width="1200" height="630" loading="eager" decoding="async">
        </figure>

        <p>$($tool.Summary) Teams usually adopt this tool when they need faster output without sacrificing quality or consistency across repeated tasks.</p>
        <p>$($tool.Name) is especially strong for $($tool.BestFor). In practical workflows, it can reduce setup overhead and shorten delivery cycles when paired with clear internal standards.</p>
        <p>From a decision perspective, the key advantage is predictable execution: users can move from idea to deliverable with fewer manual steps, clearer structure, and more repeatable outcomes. This is important for creators, operators, and team leads who need reliable production quality over time.</p>
        <p>Before full rollout, run a 2-week pilot with real tasks. Measure time saved, output quality, and collaboration friction, then compare results against your current stack. This gives a realistic view of whether $($tool.Name) should be used as a primary platform or a specialized supporting tool.</p>

        <p><a class="btn btn-secondary" href="/tools/">Back to Tools Directory</a></p>
      </article>

      <aside class="aside-box">
        <h3>Quick Facts</h3>
        <p><strong>Tool:</strong> $($tool.Name)</p>
        <p><strong>Category:</strong> $($tool.Category)</p>
        <p><strong>Starting Price:</strong> $($tool.Price)</p>
        <p><strong>Platforms:</strong> $($tool.Platforms)</p>
        <p><strong>Best For:</strong> $($tool.BestFor)</p>
      </aside>
    </div>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p>Copyright <span data-current-year></span> AIToolsHubPro. All rights reserved.</p>
      <nav class="footer-links" aria-label="Footer">
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
        <a href="/privacy.html">Privacy Policy</a>
      </nav>
    </div>
  </footer>

  <script src="/script.js" defer></script>
</body>
</html>
"@

    Set-Content -LiteralPath (Join-Path $dir 'index.html') -Value $content -NoNewline
    Write-Output "Generated $(Join-Path $dir 'index.html')"
  }
}

Write-Output 'DONE'
