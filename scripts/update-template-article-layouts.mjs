import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const templatesDir = resolve(root, "templates");

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

function extractIntroduction(content, fallbackDescription) {
  const introMatch = content.match(/<h2>Introduction<\/h2>\s*<p>([\s\S]*?)<\/p>/);
  return introMatch ? introMatch[1].trim() : null;
}

function getCategoryFromPath(filePath) {
  const parts = filePath.split(/[\\/]/);
  const templatesIndex = parts.lastIndexOf("templates");

  if (templatesIndex === -1 || templatesIndex + 1 >= parts.length) {
    return "general";
  }

  return parts[templatesIndex + 1];
}

function normalizeTemplateName(title) {
  return title
    .replace(/\s*[—|].*$/u, "")
    .replace(/\s+\|\s+.*$/u, "")
    .replace(/\s+/g, " ")
    .trim();
}

function basePathFor(filePath) {
  const parts = filePath.split(/[\\/]/);
  const templatesIndex = parts.lastIndexOf("templates");

  if (templatesIndex === -1) {
    return "/templates/";
  }

  const relative = parts.slice(templatesIndex + 1).join("/").replace(/index\.html$/, "");
  return `/${relative}`;
}

function categoryLabel(category) {
  const labels = {
    business: "Business Template",
    marketing: "Marketing Template",
    linkedin: "LinkedIn Template",
    youtube: "YouTube Template",
    writing: "Writing Template",
    students: "Academic Template"
  };

  return labels[category] || "AI Prompt Template";
}

function categoryLibraryPath(category) {
  const paths = {
    business: "/templates/business/",
    marketing: "/templates/marketing/",
    linkedin: "/templates/linkedin/",
    youtube: "/templates/youtube/",
    writing: "/templates/writing/",
    students: "/templates/students/"
  };

  return paths[category] || "/templates/";
}

function categoryToolsLink(category) {
  const links = {
    business: "/blog/ai-first-content-workflow/",
    marketing: "/blog/best-ai-tools-2026/",
    linkedin: "/blog/ai-first-content-workflow/",
    youtube: "/blog/ai-first-content-workflow/",
    writing: "/blog/ai-first-content-workflow/",
    students: "/blog/ai-first-content-workflow/"
  };

  return links[category] || "/blog/best-ai-tools-2026/";
}

function titleCasePathSegment(segment) {
  return segment
    .replace(/-/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function categoryUseCases(category) {
  const maps = {
    business: [
      "client proposals and sales documents",
      "internal planning, operations, and reporting",
      "onboarding, memos, and team communication"
    ],
    marketing: [
      "campaign copy, ads, and conversion pages",
      "email sequences and lead generation assets",
      "social content, persona work, and SEO outlines"
    ],
    linkedin: [
      "thought leadership posts and personal branding",
      "DM outreach, case studies, and lead magnets",
      "profile sections, newsletters, and event promotion"
    ],
    youtube: [
      "video outlines, hooks, and retention scripts",
      "titles, thumbnails, and description copy",
      "series planning, branding, and monetization ideas"
    ],
    writing: [
      "blog outlines, newsletters, and editorial drafts",
      "case studies and long-form article planning",
      "structured content for publishing workflows"
    ],
    students: [
      "study plans, essays, and research papers",
      "revision notes, summaries, and flashcards",
      "academic email, thesis, and presentation planning"
    ]
  };

  return maps[category] || [
    "structured drafting and planning tasks",
    "repeatable AI workflows",
    "content that needs clear organization"
  ];
}

function categoryBenefits(category) {
  const maps = {
    business: [
      "Creates clearer planning documents and client-ready drafts.",
      "Makes business communication easier to review and reuse.",
      "Helps teams move from ideas to action faster."
    ],
    marketing: [
      "Produces conversion-focused copy faster.",
      "Keeps campaigns aligned across channels.",
      "Supports testing, iteration, and message clarity."
    ],
    linkedin: [
      "Improves authority and consistency on LinkedIn.",
      "Helps generate posts, outreach, and profile copy.",
      "Makes personal branding easier to scale."
    ],
    youtube: [
      "Improves retention with stronger structure and pacing.",
      "Speeds up scripting, planning, and SEO work.",
      "Helps creators ship content more consistently."
    ],
    writing: [
      "Turns rough ideas into publishable drafts.",
      "Helps maintain tone, structure, and editorial quality.",
      "Saves time in content workflows."
    ],
    students: [
      "Makes academic work more organized and manageable.",
      "Supports study, revision, and assignment planning.",
      "Helps students create cleaner first drafts."
    ]
  };

  return maps[category] || [
    "Creates a more structured first draft.",
    "Saves time on repeated writing tasks.",
    "Keeps AI output practical and easy to edit."
  ];
}

function categoryFaq(category) {
  const maps = {
    business: [
      ["Can I adapt this prompt for different business tasks?", "Yes. Replace the placeholders, add more context, and ask for the format you need."],
      ["Who should use this template?", "Founders, operators, consultants, and teams that need clearer business drafts."]
    ],
    marketing: [
      ["Is this template suitable for paid campaigns?", "Yes. It works well for ads, emails, landing pages, and content briefs."],
      ["Should I test multiple variations?", "Yes. Start with 3 to 5 and keep the strongest angle." ]
    ],
    linkedin: [
      ["Can I use this for personal branding?", "Yes. It works well for posts, profile sections, DM outreach, and newsletters."],
      ["How do I make the output feel more human?", "Add personal context, proof, and a specific point of view."]
    ],
    youtube: [
      ["Can I use this for long-form and Shorts?", "Yes. Adjust the pacing and output length to match the format."],
      ["What matters most for retention?", "Hook strength, structure, pacing, and clear payoff moments."]
    ],
    writing: [
      ["Can I use this for blogs and newsletters?", "Yes. It helps with structure, voice, and first-draft generation."],
      ["Should I refine the output manually?", "Yes. Edit for accuracy, tone, and audience fit before publishing."]
    ],
    students: [
      ["Is this useful for different academic levels?", "Yes. You can adapt it for essays, revisions, presentations, and research."],
      ["Should the result be used as a final submission?", "No. Use it as a draft or study aid, then review carefully."]
    ]
  };

  return maps[category] || [
    ["Can I adapt this prompt?", "Yes. Replace placeholders and add the context you need."],
    ["Should I review the output?", "Yes. Always refine the result for accuracy and tone."]
  ];
}

function categoryArticleDescriptor(category) {
  const maps = {
    business: "Clear Business Drafts",
    marketing: "Copy That Converts",
    linkedin: "Authority-Building Posts",
    youtube: "Retention-Focused Video Structure",
    writing: "Editorial Draft Framework",
    students: "Study and Research Support"
  };

  return maps[category] || "Copy-Ready AI Prompt Guide";
}

function buildTitle(templateName, category) {
  return `${templateName} — ${categoryArticleDescriptor(category)} (2026)`;
}

function buildIntroFallback(templateName, category) {
  const useCases = categoryUseCases(category).join(", ");
  return `The ${templateName} helps you turn rough ideas into a clear, usable first draft. It is designed for people who need structured output instead of vague AI responses, and it works especially well for ${useCases}. Use it to save editing time and create a more consistent starting point for your workflow.`;
}

function categoryTools(category) {
  const maps = {
    business: [
      ["WorkflowPilot", "Organize planning tasks and milestones."],
      ["WritePilot AI", "Draft the main copy and refine clarity."],
      ["ResearchScope", "Gather market and competitor insights."]
    ],
    marketing: [
      ["WritePilot AI", "Fast short-form copy generation and tone refinement."],
      ["PromptSmith", "Test prompt variations and angles quickly."],
      ["ResearchScope", "Summarize market context and audience insights."]
    ],
    linkedin: [
      ["PromptSmith", "Generate and refine post variations and outreach angles."],
      ["WritePilot AI", "Draft polished social copy and profile language."],
      ["WorkflowPilot", "Track posting and follow-up tasks."]
    ],
    youtube: [
      ["WritePilot AI", "Draft scripts, descriptions, and titles quickly."],
      ["PromptSmith", "Create multiple hooks, angles, and thumbnail ideas."],
      ["WorkflowPilot", "Organize production steps and publishing tasks."]
    ],
    writing: [
      ["WritePilot AI", "Draft long-form copy with better structure."],
      ["PromptSmith", "Rewrite for tone and format variations."],
      ["ResearchScope", "Summarize sources and supporting material."]
    ],
    students: [
      ["ResearchScope", "Organize research notes and source summaries."],
      ["WritePilot AI", "Draft polished academic copy and outlines."],
      ["WorkflowPilot", "Turn study plans into simple task lists."]
    ]
  };

  return maps[category] || [
    ["WritePilot AI", "Draft and refine structured copy."],
    ["PromptSmith", "Generate prompt variations fast."],
    ["WorkflowPilot", "Turn ideas into repeatable steps."]
  ];
}

function sectionClass(category) {
  if (category === "youtube") {
    return "grid grid-3";
  }

  return "grid grid-3";
}

function buildPage({ title, description, canonical, prompt, intro, category, sourceTitle }) {
  const articleTitle = buildTitle(sourceTitle || title, category);
  const safeTitle = escapeHtml(articleTitle);
  const safeDescription = escapeHtml(description);
  const safeCanonical = escapeHtml(canonical);
  const safePrompt = escapeHtml(prompt);
  const safeIntro = escapeHtml(intro || buildIntroFallback(sourceTitle || title, category));
  const templateName = normalizeTemplateName(sourceTitle || title);
  const label = categoryLabel(category);
  const libraryPath = categoryLibraryPath(category);
  const toolsLink = categoryToolsLink(category);
  const useCases = categoryUseCases(category);
  const benefits = categoryBenefits(category);
  const tools = categoryTools(category);
  const faq = categoryFaq(category);
  const quickFactsLabel = templateName.replace(/\s*[—|].*$/u, "").replace(/\s+Template$/i, "").trim();

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
  <meta property="og:type" content="article">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:url" content="${safeCanonical}">
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
        <span class="hero-kicker">${label}</span>
        <h1>${safeTitle}</h1>
        <p>${safeDescription}</p>
        <div class="hero-actions">
          <a class="btn btn-secondary" href="${libraryPath}">Back to ${label.replace(/ Template$/i, " Templates")}</a>
          <a class="btn btn-primary" href="/templates/">Templates Library</a>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container article-layout">
        <article class="article-content">
          <h2>Meta Description</h2>
          <p>${safeDescription}</p>

          <h2>Introduction</h2>
          <p>${safeIntro}</p>

          <h2>The Template (Copy Section)</h2>
          <div class="prompt-shell">
            <textarea class="template-prompt-box" id="prompt-box">${safePrompt}</textarea>
            <div class="hero-actions">
              <button class="btn btn-primary" type="button" data-copy-trigger data-copy-target="prompt-box">Copy Prompt</button>
              <a class="btn btn-secondary" href="${libraryPath}">Back to ${label.replace(/ Template$/i, " Templates")}</a>
            </div>
            <p class="copy-feedback" data-copy-feedback hidden>Prompt copied successfully.</p>
          </div>

          <h2>How to Use This Template</h2>
          <ol>
            <li>Replace the bracketed fields with your real topic, audience, and goal.</li>
            <li>Run the prompt once, then tighten the output for tone, accuracy, and detail.</li>
            <li>Reuse the prompt whenever you need a consistent first draft.</li>
          </ol>

          <h2>Example Output</h2>
          <pre><code>Topic: ${templateName}
Audience: [audience]
Goal: [goal]
Result: A clear, practical first draft that is ready to refine.</code></pre>

          <h2>Key Benefits</h2>
          <ul>
            ${benefits.map((item) => `<li>${item}</li>`).join("\n")}
          </ul>

          <h2>Best Use Cases</h2>
          <ul>
            ${useCases.map((item) => `<li>Works well for ${item}.</li>`).join("\n")}
          </ul>

          <h2>Recommended AI Tools</h2>
          <ul>
            ${tools.map(([name, description]) => `<li><strong>${name}</strong> — ${description}</li>`).join("\n")}
          </ul>

          <h2>Internal Linking Suggestions</h2>
          <ul>
            <li><a href="${libraryPath}">More ${label.replace(/ Template$/i, " Templates")}</a></li>
            <li><a href="${toolsLink}">Related workflow guide</a></li>
            <li><a href="/blog/best-ai-tools-2026/">Best AI Tools 2026</a></li>
          </ul>

          <h2>FAQ</h2>
          <h3>${faq[0][0]}</h3>
          <p>${faq[0][1]}</p>
          <h3>${faq[1][0]}</h3>
          <p>${faq[1][1]}</p>

          <h2>Final Verdict</h2>
          <p>The ${quickFactsLabel} page is most useful when you need a clear, repeatable prompt that saves editing time and keeps output structured. It works best as a starting point for teams and solo creators who want better AI drafts with less friction.</p>
        </article>

        <aside class="aside-box">
          <h3>Quick Facts</h3>
          <p><strong>Template:</strong> ${quickFactsLabel}</p>
          <p><strong>Category:</strong> ${titleCasePathSegment(category)}</p>
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

  if (!existing.includes("template-prompt-box")) {
    return false;
  }

  const title = extractTitle(existing, "AI Prompt Template");
  const description = extractMetaDescription(
    existing,
    `${title} for creating a structured draft that is clear, practical, and easy to customize.`
  );
  const intro = extractIntroduction(existing, description);
  const prompt = extractPrompt(existing);
  const category = getCategoryFromPath(filePath);
  const canonical = extractMatch(existing, /<link rel="canonical" href="([^"]+)">/, `https://aitoolshubpro.me${basePathFor(filePath)}`);
  const next = buildPage({
    title,
    description,
    canonical,
    prompt,
    intro,
    category,
    sourceTitle: normalizeTemplateName(title)
  });

  if (next === existing) {
    return false;
  }

  writeFileSync(filePath, next, "utf8");
  return true;
}

function collectTemplatePages(directory) {
  const pages = [];
  const entries = readdirSync(directory, { withFileTypes: true });

  for (const entry of entries) {
    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      pages.push(...collectTemplatePages(absolutePath));
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith(".html")) {
      continue;
    }

    pages.push(absolutePath);
  }

  return pages;
}

let updatedCount = 0;
for (const filePath of collectTemplatePages(templatesDir)) {
  if (rewritePage(filePath)) {
    updatedCount += 1;
  }
}

console.log(`[layout] Updated article layout on ${updatedCount} template pages.`);