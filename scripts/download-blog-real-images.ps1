Add-Type -AssemblyName System.Drawing

$items = @(
  @{ Path = 'images/blog/entrepreneurs-2026.png'; Query = 'entrepreneur laptop ai dashboard workspace' },
  @{ Path = 'images/blog/free-ai-tools-2026.png'; Query = 'free ai tools comparison laptop workspace' },
  @{ Path = 'images/blog/android-productivity.png'; Query = 'android smartphone productivity apps desk' },
  @{ Path = 'images/blog/content-workflow.png'; Query = 'content workflow planning board team laptop' },
  @{ Path = 'images/blog/video-marketing.png'; Query = 'video editing marketing timeline computer' },
  @{ Path = 'images/blog/pricing-checklist.png'; Query = 'pricing checklist business planning notebook laptop' },
  @{ Path = 'images/blog/best-ai-tools-2026.png'; Query = 'best ai tools business workspace technology' },
  @{ Path = 'images/blog/the-ultimate-guide-to-the-best-ai-productivity-tools-in-2026.png'; Query = 'ai productivity guide modern office laptop' },
  @{ Path = 'images/home/blog-entrepreneurs.png'; Query = 'entrepreneur startup ai productivity office' }
)

foreach ($item in $items) {
  $full = Join-Path (Get-Location) $item.Path
  $dir = Split-Path -Parent $full
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
  }

  $tmpJpg = [System.IO.Path]::GetTempFileName() + '.jpg'
  $encodedQuery = [System.Uri]::EscapeDataString($item.Query)
  $seed = ($item.Path -replace '[^a-zA-Z0-9]', '').ToLower()
  $loremTag = ($item.Query -split ' ')[0]
  $urls = @(
    "https://source.unsplash.com/1200x630/?$encodedQuery",
    "https://loremflickr.com/1200/630/$loremTag?lock=1",
    "https://picsum.photos/seed/$seed/1200/630"
  )

  try {
    $downloaded = $false
    foreach ($u in $urls) {
      try {
        Invoke-WebRequest -Uri $u -OutFile $tmpJpg -MaximumRedirection 8 -TimeoutSec 60
        $downloaded = $true
        break
      }
      catch {
      }
    }

    if (-not $downloaded) {
      throw "All providers failed for $($item.Path)"
    }

    $img = [System.Drawing.Image]::FromFile($tmpJpg)
    $bmp = New-Object System.Drawing.Bitmap 1200, 630
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    $g.DrawImage($img, 0, 0, 1200, 630)
    $bmp.Save($full, [System.Drawing.Imaging.ImageFormat]::Png)

    $g.Dispose()
    $bmp.Dispose()
    $img.Dispose()
  }
  catch {
    Write-Output "FAILED: $($item.Path) | $($_.Exception.Message)"
  }
  finally {
    if (Test-Path -LiteralPath $tmpJpg) {
      Remove-Item -LiteralPath $tmpJpg -Force -ErrorAction SilentlyContinue
    }
  }
}

Write-Output 'DONE'
