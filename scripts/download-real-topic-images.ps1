Add-Type -AssemblyName System.Drawing

$ErrorActionPreference = 'Stop'

function Save-CoverPng {
  param(
    [string]$Url,
    [string]$OutputPath
  )

  $outDir = Split-Path -Parent $OutputPath
  if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir -Force | Out-Null
  }

  $tempFile = [System.IO.Path]::GetTempFileName()
  try {
    Invoke-WebRequest -Uri $Url -OutFile $tempFile -MaximumRedirection 10

    $img = [System.Drawing.Image]::FromFile($tempFile)
    try {
      $targetW = 1200
      $targetH = 630
      $targetRatio = $targetW / $targetH
      $srcRatio = $img.Width / $img.Height

      if ($srcRatio -gt $targetRatio) {
        $cropH = $img.Height
        $cropW = [int]($cropH * $targetRatio)
      } else {
        $cropW = $img.Width
        $cropH = [int]($cropW / $targetRatio)
      }

      $cropX = [int](($img.Width - $cropW) / 2)
      $cropY = [int](($img.Height - $cropH) / 2)

      $bmp = New-Object System.Drawing.Bitmap $targetW, $targetH
      $g = [System.Drawing.Graphics]::FromImage($bmp)
      try {
        $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
        $g.DrawImage(
          $img,
          (New-Object System.Drawing.Rectangle 0, 0, $targetW, $targetH),
          (New-Object System.Drawing.Rectangle $cropX, $cropY, $cropW, $cropH),
          [System.Drawing.GraphicsUnit]::Pixel
        )

        $bmp.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
      }
      finally {
        $g.Dispose()
        $bmp.Dispose()
      }
    }
    finally {
      $img.Dispose()
    }
  }
  finally {
    if (Test-Path $tempFile) {
      Remove-Item $tempFile -Force
    }
  }
}

$images = @(
  @{ Path = 'images/blog/the-ultimate-guide-to-the-best-ai-productivity-tools-in-2026.png'; Url = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80' },

  @{ Path = 'images/home/blog-entrepreneurs.png'; Url = 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/home/focussprint-ai.png'; Url = 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/home/notesnap-ai.png'; Url = 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/home/pixelassist.png'; Url = 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/home/promptboard.png'; Url = 'https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/home/swiftdraft-ai.png'; Url = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/home/workflowpilot.png'; Url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80' },

  @{ Path = 'images/tools/clipgen-pro.png'; Url = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/codesprint-ai.png'; Url = 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/datalens-ai.png'; Url = 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/imageforge-studio.PNG'; Url = 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/inboxmate-ai.png'; Url = 'https://images.unsplash.com/photo-1596526131083-e8c633c948d2?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/promptsmith.PNG'; Url = 'https://images.unsplash.com/photo-1494173853739-c21f58b16055?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/researchscope.png'; Url = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/scenecanvas-ai.png'; Url = 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/taskbrain-mobile.png'; Url = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/videoflow-ai.PNG'; Url = 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/voicebrief.png'; Url = 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=2000&q=80' },
  @{ Path = 'images/tools/writepilot-ai.PNG'; Url = 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=2000&q=80' }
)

$failed = @()
foreach ($item in $images) {
  try {
    Save-CoverPng -Url $item.Url -OutputPath (Join-Path (Get-Location) $item.Path)
    Write-Output "OK`t$($item.Path)"
  }
  catch {
    $failed += $item.Path
    Write-Output "FAILED`t$($item.Path)`t$($_.Exception.Message)"
  }
}

if ($failed.Count -gt 0) {
  Write-Output "----"
  Write-Output "Failed count: $($failed.Count)"
  $failed | ForEach-Object { Write-Output "MISSING`t$_" }
  exit 1
}

Write-Output "----"
Write-Output "Downloaded and converted $($images.Count) real images to PNG."
