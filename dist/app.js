const BLOG_SOURCE = {
  owner: 'raedturjman25-lang',
  repo: 'aitools',
  branch: 'main',
  folder: 'content/blog',
  fallbackImage: '/images/home/blog-entrepreneurs.png',
  maxCards: 6,
};

const EXCLUDED_BLOG_SLUGS = new Set([
  '2026-04-19-best-ai-tools-for-productivity-in-2026',
  '2026-04-20-the-ultimate-guide-to-the-best-ai-productivity-tools-in-2026',
]);

function parseFrontmatter(markdown) {
  const result = { data: {}, body: markdown || '' };
  const normalized = String(markdown || '');
  const match = normalized.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---\s*[\r\n]?([\s\S]*)$/);

  if (!match) {
    return result;
  }

  const frontmatterLines = match[1].split(/\r?\n/);
  const data = {};

  frontmatterLines.forEach((line) => {
    const separatorIndex = line.indexOf(':');
    if (separatorIndex === -1) {
      return;
    }

    const key = line.slice(0, separatorIndex).trim();
    const rawValue = line.slice(separatorIndex + 1).trim();
    const value = rawValue.replace(/^['\"]|['\"]$/g, '');

    if (key) {
      data[key] = value;
    }
  });

  return { data, body: match[2] || '' };
}

function stripMarkdown(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*\]\([^\)]*\)/g, ' ')
    .replace(/\[[^\]]+\]\([^\)]*\)/g, '$1')
    .replace(/[#>*_~\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatDate(value) {
  const parsedDate = value ? new Date(value) : null;
  if (!parsedDate || Number.isNaN(parsedDate.getTime())) {
    return 'Recent update';
  }

  return parsedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function normalizeImagePath(value) {
  const imagePath = String(value || '').trim();
  if (!imagePath) {
    return BLOG_SOURCE.fallbackImage;
  }

  if (/^https?:\/\//i.test(imagePath)) {
    return imagePath;
  }

  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  return `/${imagePath}`;
}

function normalizePostUrl(value) {
  const url = String(value || '').trim();
  if (!url) {
    return '/blog/';
  }

  if (/^https?:\/\//i.test(url) || url.startsWith('/')) {
    return url;
  }

  return '/blog/';
}

function createCard(post) {
  const article = document.createElement('article');
  article.className = 'card post-card';
  article.setAttribute('data-search-item', 'true');

  const image = normalizeImagePath(post.image);
  const postUrl = normalizePostUrl(post.url);

  const mediaLink = document.createElement('a');
  mediaLink.className = 'post-card-media';
  mediaLink.href = postUrl;
  mediaLink.setAttribute('aria-label', `Read ${post.title}`);

  const imageNode = document.createElement('img');
  imageNode.src = image;
  imageNode.alt = post.title;
  imageNode.width = 1200;
  imageNode.height = 630;
  imageNode.loading = 'lazy';
  imageNode.decoding = 'async';
  mediaLink.appendChild(imageNode);

  const body = document.createElement('div');
  body.className = 'post-card-body';

  const meta = document.createElement('p');
  meta.className = 'dynamic-post-meta';
  meta.textContent = post.dateLabel;

  const title = document.createElement('h3');
  title.setAttribute('data-search-title', 'true');
  title.textContent = post.title;

  const description = document.createElement('p');
  description.textContent = post.description;

  const readMore = document.createElement('a');
  readMore.className = 'btn btn-secondary';
  readMore.href = postUrl;
  readMore.textContent = 'Read More';

  body.appendChild(meta);
  body.appendChild(title);
  body.appendChild(description);
  body.appendChild(readMore);

  article.appendChild(mediaLink);
  article.appendChild(body);

  return article;
}

async function loadMarkdownFile(fileInfo) {
  const response = await fetch(fileInfo.download_url, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`Unable to fetch markdown file: ${fileInfo.name}`);
  }

  const markdown = await response.text();
  const parsed = parseFrontmatter(markdown);
  const slug = fileInfo.name.replace(/\.(md|markdown)$/i, '');
  const bodyPreview = stripMarkdown(parsed.body).slice(0, 180);

  return {
    title: parsed.data.title || slug.replace(/[-_]/g, ' '),
    description: parsed.data.description || (bodyPreview ? `${bodyPreview}${bodyPreview.length >= 180 ? '...' : ''}` : 'New AI insights and updates.'),
    image: parsed.data.image || BLOG_SOURCE.fallbackImage,
    url: parsed.data.url || '/blog/',
    date: parsed.data.date || '',
    dateLabel: formatDate(parsed.data.date),
  };
}

async function renderBlogFeed() {
  const blogGrid = document.querySelector('[data-blog-grid]');
  const statusNode = document.querySelector('[data-blog-status]');

  if (!blogGrid) {
    return;
  }

  // Prefer static cards embedded in HTML when available.
  if (blogGrid.hasAttribute('data-static-blog-feed') || blogGrid.querySelector('[data-static-blog-card]')) {
    if (statusNode) {
      statusNode.remove();
    }
    return;
  }

  if (statusNode) {
    statusNode.textContent = 'Loading latest Markdown posts...';
  }

  const listingUrl = `https://api.github.com/repos/${BLOG_SOURCE.owner}/${BLOG_SOURCE.repo}/contents/${BLOG_SOURCE.folder}?ref=${BLOG_SOURCE.branch}`;

  try {
    const response = await fetch(listingUrl, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error('Could not load blog listing from repository.');
    }

    const entries = await response.json();
    const markdownFiles = entries
      .filter((entry) => {
        if (entry.type !== 'file' || !/\.(md|markdown)$/i.test(entry.name)) {
          return false;
        }

        const slug = entry.name.replace(/\.(md|markdown)$/i, '');
        return !EXCLUDED_BLOG_SLUGS.has(slug);
      })
      .sort((a, b) => b.name.localeCompare(a.name))
      .slice(0, BLOG_SOURCE.maxCards);

    if (markdownFiles.length === 0) {
      if (statusNode) {
        statusNode.textContent = 'No posts found yet. Publish your first entry in Decap CMS.';
      }
      return;
    }

    const posts = await Promise.all(markdownFiles.map((item) => loadMarkdownFile(item)));
    posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    blogGrid.innerHTML = '';
    posts.forEach((post) => {
      blogGrid.appendChild(createCard(post));
    });
  } catch (error) {
    if (statusNode) {
      statusNode.textContent = 'Could not load live posts right now. Please try again shortly.';
    }
  }
}

renderBlogFeed();
