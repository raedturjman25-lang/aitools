[CmdletBinding()]
param(
  [switch]$FailOnFallback
)

$ErrorActionPreference = 'Stop'

function Escape-Html([string]$Value) {
  if ($null -eq $Value) { return '' }

  return $Value.
    Replace('&', '&amp;').
    Replace('<', '&lt;').
    Replace('>', '&gt;').
    Replace('"', '&quot;').
    Replace("'", '&#39;')
}

function Get-Eol([string]$Content) {
  if ($Content -like "*`r`n*") { return "`r`n" }
  return "`n"
}

function Extract-MatchValue([string]$Content, [string]$Pattern, [string]$Fallback = '') {
  $match = [regex]::Match($Content, $Pattern, [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $match.Success) { return $Fallback }
  return ($match.Groups[1].Value).Trim()
}

function Normalize-TemplateName([string]$Title) {
  if ([string]::IsNullOrWhiteSpace($Title)) { return $Title }

  $normalized = $Title -replace '\s*[—|].*$', ''
  $normalized = $normalized -replace '\s+', ' '
  return $normalized.Trim()
}

function Get-TemplatePathParts([string]$FilePath) {
  $parts = $FilePath -split '[\\/]'
  $templatesIndex = [array]::LastIndexOf($parts, 'templates')

  if ($templatesIndex -lt 0) {
    return @{ category = 'general'; slug = $null }
  }

  $category = if ($parts.Length -gt ($templatesIndex + 1) -and $parts[$templatesIndex + 1]) { $parts[$templatesIndex + 1] } else { 'general' }
  $maybeSlug = if ($parts.Length -gt ($templatesIndex + 2)) { $parts[$templatesIndex + 2] } else { $null }
  $slug = if ($maybeSlug -and -not $maybeSlug.EndsWith('.html')) { $maybeSlug } else { $null }

  return @{ category = $category; slug = $slug }
}

function Extract-JsObjectLiteral {
  param(
    [Parameter(Mandatory = $true)][string]$Content,
    [Parameter(Mandatory = $true)][string]$Marker
  )

  $markerIndex = $Content.IndexOf($Marker)
  if ($markerIndex -lt 0) {
    throw "Marker not found: $Marker"
  }

  $startIndex = $Content.IndexOf('{', $markerIndex)
  if ($startIndex -lt 0) {
    throw "Opening '{' not found after marker: $Marker"
  }

  $depth = 0
  $inString = $false
  $escaped = $false
  $endIndex = -1

  for ($i = $startIndex; $i -lt $Content.Length; $i++) {
    $ch = $Content[$i]

    if ($inString) {
      if ($escaped) {
        $escaped = $false
        continue
      }

      if ($ch -eq '\\') {
        $escaped = $true
        continue
      }

      if ($ch -eq '"') {
        $inString = $false
      }

      continue
    }

    if ($ch -eq '"') {
      $inString = $true
      continue
    }

    if ($ch -eq '{') {
      $depth++
      continue
    }

    if ($ch -eq '}') {
      $depth--
      if ($depth -eq 0) {
        $endIndex = $i
        break
      }

      continue
    }
  }

  if ($endIndex -lt 0) {
    throw "Could not find matching '}' for marker: $Marker"
  }

  return $Content.Substring($startIndex, $endIndex - $startIndex + 1)
}

function Convert-JsObjectLiteralToJson([string]$JsObjectLiteral) {
  $json = $JsObjectLiteral

  # Quote unquoted keys at the start of lines (category keys and property keys).
  $json = [regex]::Replace(
    $json,
    '(?m)^(\s*)([A-Za-z0-9_-]+)\s*:',
    '$1"$2":'
  )

  # Remove trailing commas before } or ]
  $json = [regex]::Replace($json, ',(?=\s*[}\]])', '')

  return $json
}

function Get-JsonPropValue($Obj, [string]$Name) {
  if ($null -eq $Obj) { return $null }
  $prop = $Obj.PSObject.Properties[$Name]
  if ($null -eq $prop) { return $null }
  return $prop.Value
}

function Get-FallbackBlueprint([string]$TemplateName, [string]$Category, $CategoryProfiles) {
  $profile = Get-JsonPropValue $CategoryProfiles $Category

  $role = Get-JsonPropValue $profile 'role'
  if (-not $role) { $role = 'expert AI assistant' }

  $audience = Get-JsonPropValue $profile 'audience'
  if (-not $audience) { $audience = 'a specific audience' }

  $tone = Get-JsonPropValue $profile 'tone'
  if (-not $tone) { $tone = 'clear and helpful' }

  return [pscustomobject]@{
    role = $role
    tone = $tone
    task = "Create a detailed $TemplateName that is ready to copy and use."
    inputs = @(
      'Context: [background details]',
	  'Audience: [who it''s for]',
      'Goal: [what you want to achieve]',
      'Constraints: [limits, format, rules]',
      'Examples (optional): [paste]'
    )
    outputs = @(
      'A structured draft with clear headings',
      'Variations (2–3) if helpful',
      'A short checklist for next steps'
    )
    rules = @(
      'Avoid generic filler.',
      'Ask clarifying questions when needed.',
      'Keep the output practical and copy-ready.'
    )
    audience = $audience
  }
}

function Build-Prompt {
  param(
    [Parameter(Mandatory = $true)][string]$TemplateName,
    [Parameter(Mandatory = $true)][string]$Category,
    [Parameter()][string]$Slug,
    [Parameter(Mandatory = $true)]$CategoryProfiles,
    [Parameter(Mandatory = $true)]$PromptBlueprints,
    [ref]$UsedFallback
  )

  $profile = Get-JsonPropValue $CategoryProfiles $Category
  $defaultRole = (Get-JsonPropValue $profile 'role')
  if (-not $defaultRole) { $defaultRole = 'expert AI assistant' }

  $defaultAudience = (Get-JsonPropValue $profile 'audience')
  if (-not $defaultAudience) { $defaultAudience = 'a specific audience' }

  $defaultTone = (Get-JsonPropValue $profile 'tone')
  if (-not $defaultTone) { $defaultTone = 'clear and helpful' }

  $blueprint = $null
  if ($Slug) {
    $categoryBlueprints = Get-JsonPropValue $PromptBlueprints $Category
    if ($categoryBlueprints) {
      $blueprint = Get-JsonPropValue $categoryBlueprints $Slug
    }
  }

  if (-not $blueprint) {
    $UsedFallback.Value = $true
    $blueprint = Get-FallbackBlueprint -TemplateName $TemplateName -Category $Category -CategoryProfiles $CategoryProfiles
  }

  $role = Get-JsonPropValue $blueprint 'role'
  if (-not $role) { $role = $defaultRole }

  $tone = Get-JsonPropValue $blueprint 'tone'
  if (-not $tone) { $tone = $defaultTone }

  $audience = Get-JsonPropValue $blueprint 'audience'
  if (-not $audience) { $audience = $defaultAudience }

  $task = Get-JsonPropValue $blueprint 'task'
  if (-not $task) { $task = "Create a detailed $TemplateName that is ready to copy and use." }

  $inputs = Get-JsonPropValue $blueprint 'inputs'
  if (-not $inputs) { $inputs = @() }

  $outputs = Get-JsonPropValue $blueprint 'outputs'
  if (-not $outputs) { $outputs = @() }

  $rules = Get-JsonPropValue $blueprint 'rules'
  if (-not $rules) { $rules = @() }

  $lines = New-Object System.Collections.Generic.List[string]
  $lines.Add("You are a $role.")
  $lines.Add("Task: $task")
  $lines.Add("Write for: $audience.")
  $lines.Add("Tone: $tone.")
  $lines.Add('')
  $lines.Add('Inputs (fill in the brackets):')
  foreach ($inputLine in $inputs) {
    $lines.Add("- $inputLine")
  }
  $lines.Add('')
  $lines.Add('Output (use this exact structure):')
  $index = 1
  foreach ($section in $outputs) {
    $lines.Add("$index) $section")
    $index++
  }
  $lines.Add('')
  $lines.Add('Rules:')
  foreach ($rule in $rules) {
    $lines.Add("- $rule")
  }
  $lines.Add('')
  $lines.Add('If any critical information is missing, ask up to 5 clarifying questions before writing.')
  $lines.Add('If details are optional, make reasonable assumptions and label them clearly.')

  return ($lines -join "`n")
}

function Rewrite-Page {
  param(
    [Parameter(Mandatory = $true)][string]$FilePath,
    [Parameter(Mandatory = $true)]$CategoryProfiles,
    [Parameter(Mandatory = $true)]$PromptBlueprints,
    [ref]$FallbackCount,
    [ref]$FallbackFiles
  )

  $existing = [System.IO.File]::ReadAllText($FilePath, [System.Text.Encoding]::UTF8)

  $textareaMatch = [regex]::Match(
    $existing,
    '<textarea class="template-prompt-box" id="prompt-box">([\s\S]*?)</textarea>',
    [System.Text.RegularExpressions.RegexOptions]::Singleline
  )

  if (-not $textareaMatch.Success) {
    return $false
  }

  $pathParts = Get-TemplatePathParts -FilePath $FilePath
  $category = $pathParts.category
  $slug = $pathParts.slug

  $titleRaw = Extract-MatchValue -Content $existing -Pattern '<h1>([\s\S]*?)</h1>' -Fallback 'AI Prompt Template'
  $templateName = Normalize-TemplateName -Title $titleRaw

  $usedFallback = $false
  $prompt = Build-Prompt -TemplateName $templateName -Category $category -Slug $slug -CategoryProfiles $CategoryProfiles -PromptBlueprints $PromptBlueprints -UsedFallback ([ref]$usedFallback)

  if ($usedFallback) {
    $FallbackCount.Value++
    $FallbackFiles.Value += $FilePath
  }

  $eol = Get-Eol -Content $existing
  $escapedPrompt = Escape-Html -Value $prompt
  $escapedPrompt = $escapedPrompt.Replace("`n", $eol)

  $startIndex = $textareaMatch.Groups[1].Index
  $length = $textareaMatch.Groups[1].Length

  $next = $existing.Substring(0, $startIndex) + $escapedPrompt + $existing.Substring($startIndex + $length)

  if ($next -eq $existing) {
    return $false
  }

  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText($FilePath, $next, $utf8NoBom)

  return $true
}

$root = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$templatesDir = Join-Path $root 'templates'
$mjsPath = Join-Path $PSScriptRoot 'update-template-prompts.mjs'

if (-not (Test-Path $templatesDir)) {
  throw "Templates directory not found: $templatesDir"
}

if (-not (Test-Path $mjsPath)) {
  throw "Source blueprint file not found: $mjsPath"
}

$mjsContent = [System.IO.File]::ReadAllText($mjsPath, [System.Text.Encoding]::UTF8)

$categoryProfilesLiteral = Extract-JsObjectLiteral -Content $mjsContent -Marker 'const categoryProfiles ='
$promptBlueprintsLiteral = Extract-JsObjectLiteral -Content $mjsContent -Marker 'const promptBlueprints ='

$categoryProfilesJson = Convert-JsObjectLiteralToJson -JsObjectLiteral $categoryProfilesLiteral
$promptBlueprintsJson = Convert-JsObjectLiteralToJson -JsObjectLiteral $promptBlueprintsLiteral

$categoryProfiles = $categoryProfilesJson | ConvertFrom-Json
$promptBlueprints = $promptBlueprintsJson | ConvertFrom-Json

$updatedCount = 0
$fallbackCount = 0
$fallbackFiles = @()

Get-ChildItem -Path $templatesDir -Recurse -File -Filter '*.html' | ForEach-Object {
  if (Rewrite-Page -FilePath $_.FullName -CategoryProfiles $categoryProfiles -PromptBlueprints $promptBlueprints -FallbackCount ([ref]$fallbackCount) -FallbackFiles ([ref]$fallbackFiles)) {
    $updatedCount++
  }
}

if ($FailOnFallback -and $fallbackCount -gt 0) {
  $list = ($fallbackFiles | Select-Object -First 20) -join "`n- "
  throw "Missing blueprints detected ($fallbackCount). First files:`n- $list"
}

Write-Output "[prompts] Updated prompt boxes in $updatedCount template pages."
Write-Output "[prompts] Used fallback blueprint for $fallbackCount template pages."
if ($fallbackCount -gt 0) {
  Write-Output "[prompts] Fallback files (first 20):"
  $fallbackFiles | Select-Object -First 20 | ForEach-Object { Write-Output "- $_" }
}