import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const templatesDir = resolve(root, "templates/business");

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function extractMatch(content, regex, fallback = "") {
  const match = content.match(regex);
  return match ? match[1].trim() : fallback;
}

function extractPrompt(content) {
  return extractMatch(content, /<textarea class="template-prompt-box" id="prompt-box">([\s\S]*?)<\/textarea>/, "");
}

function extractTitle(content, fallbackTitle) {
  return extractMatch(content, /<h1>([\s\S]*?)<\/h1>/, fallbackTitle);
}

function extractMetaDescription(content, fallbackDescription) {
  return extractMatch(content, /<meta name="description" content="([^"]*)">/, fallbackDescription);
}

function buildPage({ title, description, canonical, prompt }) {
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const safePrompt = escapeHtml(prompt);
  const templateName = title.replace(/\s*\|\s*Business Templates$/i, "").replace(/\s*—.*$/u, "").trim();

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${safeCanonical}">
  <link rel="stylesheet" href="/styles.css">
  <link rel="icon" type="image/png" href="/images/logo.png">
  <link rel="apple-touch-icon" href="/images/logo.png">
</head>
<body>
  <header class="site-header">
    <div class="container nav-wrap">
      <a class="brand" href="/" aria-label="AIToolsHubPro home">
        <img class="brand-logo" src="/images/logo.png" alt="AIToolsHubPro Logo" width="156" height="40" loading="eager" decoding="async">
      </a>
      <div class="header-actions">
        <div class="search-wrap">
          <label class="sr-only" for="site-search">Search tools and blog posts</label>
          <input id="site-search" class="search-input" type="search" placeholder="Search tools or posts..." data-search-input>
        </div>
        <button class="theme-toggle" type="button" aria-label="Switch to dark mode" aria-pressed="false" data-theme-toggle>🌙</button>
      </div>
      <button class="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" data-nav-toggle>
        <span class="nav-toggle-line"></span>
        <span class="nav-toggle-line"></span>
        <span class="nav-toggle-line"></span>
      </button>
      <nav class="main-nav" data-nav-menu>
        <a href="/">Home</a>
        <a href="/tools/">Tools</a>
        <a href="/blog/">Blog</a>
        <a href="/about/">About</a>
        <a class="active" href="/templates/">Templates</a>
        <a class="nav-cta" href="/tools/">Explore Tools</a>
      </nav>
    </div>
  </header>

  <main>
    <section class="hero">
      <div class="container hero-panel">
        <span class="hero-kicker">Business Template</span>
        <h1>${safeTitle}</h1>
        <p class="lead">${safeDescription} Use this template when you need a structured, business-ready output that is easy to edit, share, and reuse.</p>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="/templates/business/">Back to Business Templates</a>
          <a class="btn btn-primary" href="/templates/">Templates Library</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container article-layout">
        <article class="article-content">
          <h2>Introduction</h2>
          <p>The ${templateName} helps you turn rough business inputs into a clear, usable first draft. It is designed for founders, operators, marketers, and teams that need consistent structure instead of vague AI output. Use it to create better planning documents, client-facing material, and internal working drafts with less editing time.</p>

          <div class="prompt-shell">
            <textarea class="template-prompt-box" id="prompt-box">${safePrompt}</textarea>
            <div class="hero-actions">
              <button class="btn btn-primary" type="button" data-copy-trigger data-copy-target="prompt-box">Copy Prompt</button>
              <a class="btn btn-secondary" href="/templates/business/">Back to Business Templates</a>
            </div>
            <p class="copy-feedback" data-copy-feedback hidden>Prompt copied successfully.</p>
          </div>

          <h2>How to Use This Template</h2>
          <ol>
            <li>Fill in the placeholders with your real topic, audience, and business goal.</li>
            <li>Run the prompt once, then tighten the answer for tone, accuracy, and details.</li>
            <li>Reuse the structure whenever you need a fast, consistent business draft.</li>
          </ol>

          <h2>Example Output</h2>
          <pre><code>Summary: Clear business draft for ${templateName}.
Audience: Team members, clients, or stakeholders.
Structure: Problem, solution, execution, and next steps.
Outcome: A polished first draft you can refine quickly.</code></pre>

          <h2>Key Benefits</h2>
          <ul>
            <li>Creates a more complete and professional output from the first prompt.</li>
            <li>Keeps the AI response focused on business structure and practical decisions.</li>
            <li>Saves time by giving you a reusable framework for repeat work.</li>
          </ul>

          <h2>Recommended AI Tools</h2>
          <ul>
            <li><strong>WorkflowPilot</strong> — Organize planning tasks and milestones.</li>
            <li><strong>WritePilot AI</strong> — Draft the main copy and refine clarity.</li>
            <li><strong>ResearchScope</strong> — Gather market and competitor insights.</li>
          </ul>

          <h2>Internal Linking Suggestions</h2>
          <ul>
            <li><a href="/templates/business/proposal-template/">Proposal Template</a></li>
            <li><a href="/templates/business/quarterly-report-template/">Quarterly Report Template</a></li>
            <li><a href="/blog/best-ai-tools-2026/">Best AI Tools 2026</a></li>
          </ul>

          <h2>FAQ</h2>
          <h3>Can I adapt this prompt for different business tasks?</h3>
          <p>Yes. Replace the placeholders, add more context, and ask for the format you need. The same structure works well for planning, proposals, reports, and internal notes.</p>

          <h2>Final Verdict</h2>
          <p>The ${templateName} is strongest when you need a clean, repeatable business prompt that saves editing time and keeps outputs organized. It works well as a starting point for teams and solo operators who want more consistent results from AI.</p>
        </article>

        <aside class="aside-box">
          <h3>Quick Facts</h3>
          <p><strong>Template:</strong> ${templateName}</p>
        </aside>
      </div>
    </section>
  </main>

  <script src="/script.js" defer></script>
</body>
</html>
`;
}

function rewritePage(filePath) {
  const existing = readFileSync(filePath, "utf8");
  const title = extractTitle(existing, "Business Template");
  const description = extractMetaDescription(
    existing,
    `${title} for creating a structured business draft that is clear, practical, and easy to customize.`
  );
  const canonical = extractMatch(existing, /<link rel="canonical" href="([^"]+)">/, `https://aitoolshubpro.me/${filePath.split("templates/business/")[1].replace(/\\/g, "/").replace(/index\.html$/, "")}`);
  const prompt = extractPrompt(existing);

  const next = buildPage({ title, description, canonical, prompt });
  writeFileSync(filePath, next, "utf8");
}

for (const entry of readdirSync(templatesDir, { withFileTypes: true })) {
  if (!entry.isDirectory()) {
    continue;
  }

  const filePath = resolve(templatesDir, entry.name, "index.html");
  rewritePage(filePath);
}

console.log("[normalize] Business template pages updated.");