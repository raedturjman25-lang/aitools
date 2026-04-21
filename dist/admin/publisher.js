(function () {
  const STORAGE_KEY = "aitoolshubpro-admin-config";

  const form = document.getElementById("publish-form");
  const statusNode = document.getElementById("status");
  const publishButton = document.getElementById("publish-btn");
  const clearButton = document.getElementById("clear-btn");

  const ownerInput = document.getElementById("owner");
  const repoInput = document.getElementById("repo");
  const branchInput = document.getElementById("branch");
  const tokenInput = document.getElementById("token");

  const titleInput = document.getElementById("title");
  const publishDateInput = document.getElementById("publish-date");
  const descriptionInput = document.getElementById("description");
  const categoryInput = document.getElementById("category");
  const externalUrlInput = document.getElementById("external-url");
  const imageFileInput = document.getElementById("image-file");
  const imageAltInput = document.getElementById("image-alt");
  const bodyInput = document.getElementById("body");

  setDefaultDate();
  restoreSavedConfig();

  [ownerInput, repoInput, branchInput, tokenInput].forEach((node) => {
    node.addEventListener("input", saveConfig);
  });

  clearButton.addEventListener("click", () => {
    form.reset();
    setDefaultDate();
    appendStatus("Form cleared.");
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const config = {
      owner: ownerInput.value.trim(),
      repo: repoInput.value.trim(),
      branch: branchInput.value.trim() || "main",
      token: tokenInput.value.trim(),
    };

    const postData = {
      title: titleInput.value.trim(),
      publishDate: publishDateInput.value,
      description: descriptionInput.value.trim(),
      category: categoryInput.value.trim(),
      externalUrl: externalUrlInput.value.trim(),
      imageAlt: imageAltInput.value.trim(),
      body: bodyInput.value.trim(),
      imageFile: imageFileInput.files[0] || null,
    };

    if (!validate(config, postData)) {
      return;
    }

    togglePublishing(true);
    statusNode.textContent = "Starting publish workflow...";

    try {
      const slug = slugify(postData.title);
      const dateInfo = getDateInfo(postData.publishDate);
      const markdownFileName = `${dateInfo.filePrefix}-${slug}.md`;
      const markdownPath = `content/blog/${markdownFileName}`;
      const postUrl = postData.externalUrl || `/blog/${slug}/`;

      appendStatus(`Slug: ${slug}`);
      appendStatus(`Markdown path: ${markdownPath}`);

      let imagePath = "";
      if (postData.imageFile) {
        const extension = getFileExtension(postData.imageFile.name);
        imagePath = `/images/blog/${slug}${extension}`;
        appendStatus(`Uploading image to ${imagePath}...`);

        const imageContent = await fileToBase64(postData.imageFile);
        await upsertFile({
          ...config,
          path: imagePath.slice(1),
          contentBase64: imageContent,
          message: `chore(blog): upload image for ${slug}`,
          isBinary: true,
        });
        appendStatus("Image uploaded.");
      }

      const markdown = buildMarkdown({
        ...postData,
        imagePath,
        postUrl,
      });

      appendStatus("Creating markdown content file...");
      await upsertFile({
        ...config,
        path: markdownPath,
        contentBase64: utf8ToBase64(markdown),
        message: `feat(blog): add ${slug} markdown`,
      });
      appendStatus("Markdown file committed.");

      const html = buildArticleHtml({
        title: postData.title,
        description: postData.description,
        dateIso: toIsoDate(postData.publishDate),
        canonicalUrl: `https://aitoolshubpro.me/blog/${slug}/`,
        imagePath: imagePath || "/images/home/blog-entrepreneurs.webp",
        imageAlt: postData.imageAlt || `${postData.title} featured image`,
        markdownBody: postData.body,
      });

      appendStatus("Creating article page file...");
      await upsertFile({
        ...config,
        path: `blog/${slug}/index.html`,
        contentBase64: utf8ToBase64(html),
        message: `feat(blog): publish ${slug} page`,
      });

      appendStatus("Done. Article published successfully.");
      appendStatus(`Live URL: ${postUrl}`);
    } catch (error) {
      appendStatus(`Publishing failed: ${error.message}`);
    } finally {
      togglePublishing(false);
    }
  });

  function setDefaultDate() {
    if (!publishDateInput.value) {
      const now = new Date();
      publishDateInput.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    }
  }

  function validate(config, postData) {
    if (!config.owner || !config.repo || !config.branch || !config.token) {
      statusNode.textContent = "Please complete GitHub owner, repo, branch, and token.";
      return false;
    }

    if (!postData.title || !postData.publishDate || !postData.description || !postData.body) {
      statusNode.textContent = "Please fill all required post fields.";
      return false;
    }

    return true;
  }

  function togglePublishing(isPublishing) {
    publishButton.disabled = isPublishing;
    publishButton.textContent = isPublishing ? "Publishing..." : "Publish Article";
  }

  function appendStatus(text) {
    statusNode.textContent += `\n${text}`;
  }

  function saveConfig() {
    const payload = {
      owner: ownerInput.value.trim(),
      repo: repoInput.value.trim(),
      branch: branchInput.value.trim(),
      token: tokenInput.value.trim(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }

  function restoreSavedConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const saved = JSON.parse(raw);
      if (saved.owner) ownerInput.value = saved.owner;
      if (saved.repo) repoInput.value = saved.repo;
      if (saved.branch) branchInput.value = saved.branch;
      if (saved.token) tokenInput.value = saved.token;
    } catch (_error) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  function slugify(value) {
    return String(value || "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "new-post";
  }

  function getDateInfo(dateValue) {
    const parsed = new Date(dateValue);
    if (Number.isNaN(parsed.getTime())) {
      throw new Error("Invalid publish date.");
    }

    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, "0");
    const day = String(parsed.getUTCDate()).padStart(2, "0");

    return {
      filePrefix: `${year}-${month}-${day}`,
    };
  }

  function toIsoDate(dateValue) {
    const parsed = new Date(dateValue);
    return parsed.toISOString().slice(0, 10);
  }

  function getFileExtension(fileName) {
    const match = String(fileName || "").toLowerCase().match(/\.(png|jpe?g|webp|gif|svg)$/);
    if (!match) {
      return ".png";
    }
    return match[0] === ".jpeg" ? ".jpg" : match[0];
  }

  function utf8ToBase64(value) {
    return btoa(unescape(encodeURIComponent(value)));
  }

  async function fileToBase64(file) {
    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";

    bytes.forEach((byte) => {
      binary += String.fromCharCode(byte);
    });

    return btoa(binary);
  }

  function buildMarkdown({ title, publishDate, description, category, postUrl, imagePath, body }) {
    const lines = [
      "---",
      `title: \"${sanitizeYaml(title)}\"`,
      `date: \"${toIsoDate(publishDate)}\"`,
      `description: \"${sanitizeYaml(description)}\"`,
      `image: \"${sanitizeYaml(imagePath || "/images/home/blog-entrepreneurs.webp")}\"`,
      category ? `category: \"${sanitizeYaml(category)}\"` : null,
      `url: \"${sanitizeYaml(postUrl)}\"`,
      "---",
      "",
      body,
      "",
    ];

    return lines.filter((line) => line !== null).join("\n");
  }

  function sanitizeYaml(value) {
    return String(value || "").replace(/\"/g, "\\\"");
  }

  function buildArticleHtml({ title, description, dateIso, canonicalUrl, imagePath, imageAlt, markdownBody }) {
    const dateLabel = new Date(dateIso).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const articleBodyHtml = markdownToHtml(markdownBody);

    return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | AIToolsHubPro</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${escapeAttribute(canonicalUrl)}">
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
        <a class="active" href="/blog/">Blog</a>
        <a href="/about/">About</a>
        <a class="nav-cta" href="/tools/">Explore Tools</a>
      </nav>
    </div>
  </header>

  <main class="section">
    <div class="container article-layout">
      <article class="article-content">
        <h1>${escapeHtml(title)}</h1>
        <p class="muted">Published ${escapeHtml(dateLabel)} by AIToolsHubPro editorial team.</p>

        <figure class="article-hero-image">
          <img src="${escapeAttribute(imagePath)}" alt="${escapeAttribute(imageAlt)}" width="1200" height="630" loading="eager" decoding="async">
        </figure>

${articleBodyHtml}
      </article>

      <aside class="aside-box" aria-label="Article sidebar">
        <h3>Quick Links</h3>
        <p><a class="btn btn-secondary" href="/tools/">Explore All Tools</a></p>
        <p><a class="btn affiliate-btn" href="#" rel="nofollow sponsored">Featured Deal</a></p>
        <p class="muted">This article may include affiliate placeholders for future partner links.</p>
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
</html>`;
  }

  function markdownToHtml(markdownText) {
    const lines = String(markdownText || "").split(/\r?\n/);
    const output = [];
    let inUnorderedList = false;
    let inOrderedList = false;
    let paragraphBuffer = [];

    function flushParagraph() {
      if (!paragraphBuffer.length) {
        return;
      }
      output.push(`<p>${formatInline(paragraphBuffer.join(" "))}</p>`);
      paragraphBuffer = [];
    }

    function closeLists() {
      if (inUnorderedList) {
        output.push("</ul>");
        inUnorderedList = false;
      }
      if (inOrderedList) {
        output.push("</ol>");
        inOrderedList = false;
      }
    }

    lines.forEach((rawLine) => {
      const line = rawLine.trim();

      if (!line) {
        flushParagraph();
        closeLists();
        return;
      }

      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        flushParagraph();
        closeLists();
        const level = headingMatch[1].length;
        output.push(`<h${level}>${formatInline(headingMatch[2])}</h${level}>`);
        return;
      }

      const unorderedMatch = line.match(/^[-*]\s+(.+)$/);
      if (unorderedMatch) {
        flushParagraph();
        if (inOrderedList) {
          output.push("</ol>");
          inOrderedList = false;
        }
        if (!inUnorderedList) {
          output.push("<ul>");
          inUnorderedList = true;
        }
        output.push(`<li>${formatInline(unorderedMatch[1])}</li>`);
        return;
      }

      const orderedMatch = line.match(/^\d+\.\s+(.+)$/);
      if (orderedMatch) {
        flushParagraph();
        if (inUnorderedList) {
          output.push("</ul>");
          inUnorderedList = false;
        }
        if (!inOrderedList) {
          output.push("<ol>");
          inOrderedList = true;
        }
        output.push(`<li>${formatInline(orderedMatch[1])}</li>`);
        return;
      }

      closeLists();
      paragraphBuffer.push(line);
    });

    flushParagraph();
    closeLists();

    return output.join("\n");
  }

  function formatInline(text) {
    return escapeHtml(text)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|\/[^\s)]+)\)/g, '<a href="$2">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code>$1</code>");
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replace(/`/g, "");
  }

  async function upsertFile({ owner, repo, branch, token, path, contentBase64, message, isBinary }) {
    const normalizedPath = path
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    const endpoint = `https://api.github.com/repos/${owner}/${repo}/contents/${normalizedPath}`;

    const existing = await fetch(endpoint, {
      method: "GET",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
      },
    });

    let sha;
    if (existing.status === 200) {
      const data = await existing.json();
      sha = data.sha;
      appendStatus(`Updating existing file: ${path}`);
    } else if (existing.status === 404) {
      appendStatus(`Creating new file: ${path}`);
    } else {
      const failBody = await safeReadText(existing);
      throw new Error(`Failed checking ${path}. ${existing.status} ${failBody}`);
    }

    const payload = {
      message,
      content: contentBase64,
      branch,
    };

    if (sha) {
      payload.sha = sha;
    }

    const response = await fetch(endpoint, {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const failBody = await safeReadText(response);
      const fileType = isBinary ? "binary file" : "text file";
      throw new Error(`Failed publishing ${fileType} ${path}. ${response.status} ${failBody}`);
    }
  }

  async function safeReadText(response) {
    try {
      return await response.text();
    } catch (_error) {
      return "";
    }
  }
})();
