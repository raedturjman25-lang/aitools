Add-Type -AssemblyName System.Drawing

function New-TopicImage {
  param(
    [string]$Path,
    [string]$Title,
    [string]$Subtitle,
    [string]$StartColor,
    [string]$EndColor,
    [string]$AccentColor
  )

  $full = Join-Path (Get-Location) $Path
  $dir = Split-Path -Parent $full
  if (-not (Test-Path $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  $bmp = New-Object System.Drawing.Bitmap 1200, 630
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  $rect = New-Object System.Drawing.Rectangle 0, 0, 1200, 630
  $bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush $rect, ([System.Drawing.Color]::FromName($StartColor)), ([System.Drawing.Color]::FromName($EndColor)), 35.0
  $g.FillRectangle($bgBrush, $rect)

  $overlay = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(45, 255, 255, 255))
  $g.FillEllipse($overlay, 760, -140, 520, 520)
  $g.FillEllipse($overlay, -120, 380, 520, 520)

  $cardBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(35, 0, 0, 0))
  $panel = New-Object System.Drawing.RectangleF 80, 90, 1040, 450
  $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
  $radius = 26.0
  $d = $radius * 2
  $gp.AddArc($panel.X, $panel.Y, $d, $d, 180, 90)
  $gp.AddArc($panel.Right - $d, $panel.Y, $d, $d, 270, 90)
  $gp.AddArc($panel.Right - $d, $panel.Bottom - $d, $d, $d, 0, 90)
  $gp.AddArc($panel.X, $panel.Bottom - $d, $d, $d, 90, 90)
  $gp.CloseFigure()
  $g.FillPath($cardBrush, $gp)

  $accentPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromName($AccentColor), 6)
  $g.DrawLine($accentPen, 120, 180, 1080, 180)

  $titleFont = New-Object System.Drawing.Font "Segoe UI", 56, ([System.Drawing.FontStyle]::Bold), ([System.Drawing.GraphicsUnit]::Pixel)
  $subFont = New-Object System.Drawing.Font "Segoe UI", 28, ([System.Drawing.FontStyle]::Regular), ([System.Drawing.GraphicsUnit]::Pixel)
  $titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(245, 255, 255, 255))
  $subBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(220, 236, 244, 255))

  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Near
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Near

  $g.DrawString($Title, $titleFont, $titleBrush, (New-Object System.Drawing.RectangleF 120, 220, 960, 180), $sf)
  $g.DrawString($Subtitle, $subFont, $subBrush, (New-Object System.Drawing.RectangleF 124, 410, 960, 90), $sf)

  $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

  $accentPen.Dispose()
  $gp.Dispose()
  $bgBrush.Dispose()
  $overlay.Dispose()
  $cardBrush.Dispose()
  $titleFont.Dispose()
  $subFont.Dispose()
  $titleBrush.Dispose()
  $subBrush.Dispose()
  $sf.Dispose()
  $g.Dispose()
  $bmp.Dispose()
}

$images = @(
  @{ Path = 'images/blog/the-ultimate-guide-to-the-best-ai-productivity-tools-in-2026.png'; Title = 'Ultimate Guide 2026'; Subtitle = 'Best AI Productivity Tools'; Start = 'MidnightBlue'; End = 'SteelBlue'; Accent = 'Gold' },
  @{ Path = 'images/home/blog-entrepreneurs.png'; Title = 'AI for Entrepreneurs'; Subtitle = 'Growth, Automation, and Content'; Start = 'DarkSlateBlue'; End = 'Teal'; Accent = 'Orange' },
  @{ Path = 'images/home/focussprint-ai.png'; Title = 'FocusSprint AI'; Subtitle = 'Deep Focus and Task Sprints'; Start = 'DarkCyan'; End = 'MediumSlateBlue'; Accent = 'Lime' },
  @{ Path = 'images/home/notesnap-ai.png'; Title = 'NoteSnap AI'; Subtitle = 'Smart Notes and Summaries'; Start = 'RoyalBlue'; End = 'DodgerBlue'; Accent = 'Yellow' },
  @{ Path = 'images/home/pixelassist.png'; Title = 'PixelAssist'; Subtitle = 'Fast Visual Design Assistant'; Start = 'DarkMagenta'; End = 'HotPink'; Accent = 'Cyan' },
  @{ Path = 'images/home/promptboard.png'; Title = 'PromptBoard'; Subtitle = 'Prompt Library and Team Workflows'; Start = 'DarkSlateGray'; End = 'SeaGreen'; Accent = 'Aqua' },
  @{ Path = 'images/home/swiftdraft-ai.png'; Title = 'SwiftDraft AI'; Subtitle = 'Write Faster, Publish Sooner'; Start = 'SaddleBrown'; End = 'DarkOrange'; Accent = 'White' },
  @{ Path = 'images/home/workflowpilot.png'; Title = 'WorkflowPilot'; Subtitle = 'Automate Repetitive Team Tasks'; Start = 'Indigo'; End = 'SlateBlue'; Accent = 'LightGreen' },
  @{ Path = 'images/tools/clipgen-pro.png'; Title = 'ClipGen Pro'; Subtitle = 'Generate Short Marketing Clips'; Start = 'Crimson'; End = 'OrangeRed'; Accent = 'White' },
  @{ Path = 'images/tools/codesprint-ai.png'; Title = 'CodeSprint AI'; Subtitle = 'Accelerated Coding Assistant'; Start = 'DarkSlateBlue'; End = 'MediumPurple'; Accent = 'Aqua' },
  @{ Path = 'images/tools/datalens-ai.png'; Title = 'DataLens AI'; Subtitle = 'Insights from Dashboards and Reports'; Start = 'DarkGreen'; End = 'SeaGreen'; Accent = 'LightYellow' },
  @{ Path = 'images/tools/inboxmate-ai.png'; Title = 'InboxMate AI'; Subtitle = 'Email Triage and Smart Replies'; Start = 'DarkBlue'; End = 'CornflowerBlue'; Accent = 'LightSkyBlue' },
  @{ Path = 'images/tools/promptsmith.PNG'; Title = 'PromptSmith'; Subtitle = 'Craft Better Prompts Quickly'; Start = 'DarkOliveGreen'; End = 'OliveDrab'; Accent = 'Gold' },
  @{ Path = 'images/tools/researchscope.png'; Title = 'ResearchScope'; Subtitle = 'Research, Sources, and Synthesis'; Start = 'DarkSlateGray'; End = 'CadetBlue'; Accent = 'Khaki' },
  @{ Path = 'images/tools/scenecanvas-ai.png'; Title = 'SceneCanvas AI'; Subtitle = 'Visual Storyboards with AI'; Start = 'Maroon'; End = 'Tomato'; Accent = 'Moccasin' },
  @{ Path = 'images/tools/taskbrain-mobile.png'; Title = 'TaskBrain Mobile'; Subtitle = 'Plan and Track Tasks Anywhere'; Start = 'DarkViolet'; End = 'MediumSlateBlue'; Accent = 'LightCyan' },
  @{ Path = 'images/tools/voicebrief.png'; Title = 'VoiceBrief'; Subtitle = 'Audio Notes to Actionable Briefs'; Start = 'DarkSlateBlue'; End = 'DeepSkyBlue'; Accent = 'White' }
)

foreach ($img in $images) {
  New-TopicImage -Path $img.Path -Title $img.Title -Subtitle $img.Subtitle -StartColor $img.Start -EndColor $img.End -AccentColor $img.Accent
}

Write-Output "Generated $($images.Count) topic images."
