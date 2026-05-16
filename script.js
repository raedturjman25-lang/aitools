const googleAnalyticsMeasurementId = 'G-8LLLL9YY7H';

function initGoogleAnalytics() {
  if (!googleAnalyticsMeasurementId) {
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  const gtagScript = document.createElement('script');
  gtagScript.async = true;
  gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsMeasurementId}`;
  document.head.appendChild(gtagScript);

  window.gtag('js', new Date());
  window.gtag('config', googleAnalyticsMeasurementId);
}

initGoogleAnalytics();

const navToggle = document.querySelector('[data-nav-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');

function enhanceTemplatesNav() {
  const categoryLinks = [
    { label: 'All Templates', href: '/templates/' },
    { label: 'Marketing', href: '/templates/marketing/' },
    { label: 'Business', href: '/templates/business/' },
    { label: 'LinkedIn', href: '/templates/linkedin/' },
    { label: 'YouTube', href: '/templates/youtube/' },
    { label: 'Students', href: '/templates/students/' },
    { label: 'Writing', href: '/templates/writing/' },
  ];

  document.querySelectorAll('.main-nav > a[href="/templates/"]').forEach((link) => {
    link.textContent = 'AI Templates';

    if (link.closest('.templates-nav-item')) {
      return;
    }

    const navItem = document.createElement('div');
    navItem.className = 'templates-nav-item';

    const dropdown = document.createElement('div');
    dropdown.className = 'templates-dropdown';

    const dropdownList = document.createElement('div');
    dropdownList.className = 'templates-dropdown-list';

    categoryLinks.forEach((item) => {
      const categoryLink = document.createElement('a');
      categoryLink.href = item.href;
      categoryLink.textContent = item.label;
      dropdownList.appendChild(categoryLink);
    });

    dropdown.appendChild(dropdownList);
    navItem.appendChild(link.cloneNode(true));
    navItem.appendChild(dropdown);
    link.replaceWith(navItem);
  });
}

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(navMenu.classList.contains('open')));
  });
}

enhanceTemplatesNav();

const themeToggle = document.querySelector('[data-theme-toggle]');
const themeStorageKey = 'aitoolshubpro-theme';

function applyTheme(theme) {
  const isDark = theme === 'dark';
  document.body.classList.toggle('dark-mode', isDark);

  if (themeToggle) {
    themeToggle.setAttribute('aria-pressed', String(isDark));
    themeToggle.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    themeToggle.textContent = isDark ? '☀' : '🌙';
  }

  // Optional advanced mode: switch image sources if alternate theme assets are provided.
  document.querySelectorAll('[data-theme-src-light][data-theme-src-dark]').forEach((img) => {
    const lightSrc = img.getAttribute('data-theme-src-light');
    const darkSrc = img.getAttribute('data-theme-src-dark');
    if (lightSrc && darkSrc) {
      img.setAttribute('src', isDark ? darkSrc : lightSrc);
    }
  });
}

const savedTheme = localStorage.getItem(themeStorageKey);
if (savedTheme === 'dark' || savedTheme === 'light') {
  applyTheme(savedTheme);
} else {
  applyTheme('light');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const nextTheme = document.body.classList.contains('dark-mode') ? 'light' : 'dark';
    localStorage.setItem(themeStorageKey, nextTheme);
    applyTheme(nextTheme);
  });
}

const searchInput = document.querySelector('[data-search-input]');

function getSearchableItems() {
  return Array.from(document.querySelectorAll('[data-search-item]'));
}

function stripHighlight(target) {
  const rawText = target.getAttribute('data-original-title');
  if (rawText !== null) {
    target.textContent = rawText;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function addHighlight(target, searchTerm) {
  const originalTitle = target.getAttribute('data-original-title') || target.textContent || '';
  target.setAttribute('data-original-title', originalTitle);

  if (!searchTerm) {
    target.textContent = originalTitle;
    return;
  }

  const expression = new RegExp(`(${escapeRegExp(searchTerm)})`, 'ig');
  const highlighted = originalTitle.replace(expression, '<mark class="match-highlight">$1</mark>');
  target.innerHTML = highlighted;
}

function updateSearchResults() {
  const searchableItems = getSearchableItems();

  if (!searchInput || searchableItems.length === 0) {
    return;
  }

  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  searchableItems.forEach((item) => {
    const titleNode = item.querySelector('[data-search-title]') || item.querySelector('h2, h3, h4');
    if (!titleNode) {
      return;
    }

    const titleText = (titleNode.getAttribute('data-original-title') || titleNode.textContent || '').trim();
    const matches = !query || titleText.toLowerCase().includes(query);

    item.classList.toggle('search-result-hidden', !matches);

    if (matches) {
      visibleCount += 1;
      addHighlight(titleNode, query);
    } else {
      stripHighlight(titleNode);
    }
  });

  const existingMessage = document.querySelector('[data-search-empty]');
  if (existingMessage) {
    existingMessage.remove();
  }

  if (query && visibleCount === 0) {
    const searchContainer = document.querySelector('[data-search-scope]') || document.querySelector('main .container');
    if (searchContainer) {
      const message = document.createElement('p');
      message.className = 'search-empty';
      message.setAttribute('data-search-empty', 'true');
      message.textContent = 'No matching tools or posts found.';
      searchContainer.appendChild(message);
    }
  }
}

if (searchInput) {
  searchInput.addEventListener('input', updateSearchResults);
}

const toolFinder = document.querySelector('[data-tool-finder]');

if (toolFinder) {
  const quizForm = toolFinder.querySelector('[data-tool-finder-form]');
  const quizResult = toolFinder.querySelector('[data-tool-finder-result]');
  const quizResultList = toolFinder.querySelector('[data-tool-finder-list]');

  const quizTools = [
    {
      name: 'WritePilot AI',
      description: 'Best for fast writing, blog drafts, and SEO content workflows.',
      href: '/tools/',
      tags: ['writing', 'web', 'team', 'free', 'paid'],
    },
    {
      name: 'ImageForge Studio',
      description: 'Best for AI visuals, ads, and social design assets.',
      href: '/tools/',
      tags: ['design', 'web', 'paid'],
    },
    {
      name: 'VideoFlow AI',
      description: 'Best for campaign videos, reels, and product demos.',
      href: '/tools/',
      tags: ['video', 'web', 'team', 'paid'],
    },
    {
      name: 'TaskBrain Mobile',
      description: 'Best for Android productivity, planning, and personal execution.',
      href: '/tools/',
      tags: ['automation', 'android', 'free'],
    },
    {
      name: 'NoteSnap AI',
      description: 'Best for turning notes and screenshots into clear action steps.',
      href: '/tools/',
      tags: ['writing', 'android', 'free'],
    },
    {
      name: 'WorkflowPilot',
      description: 'Best for team operations and automating repetitive tasks.',
      href: '/tools/',
      tags: ['automation', 'team', 'paid'],
    },
  ];

  function scoreTool(tool, answers) {
    let score = 0;

    if (tool.tags.includes(answers.goal)) {
      score += 4;
    }

    if (tool.tags.includes(answers.platform)) {
      score += 2;
    }

    if (tool.tags.includes(answers.budget)) {
      score += 1;
    }

    return score;
  }

  function buildQuizResultCard(tool, answers) {
    const card = document.createElement('article');
    card.className = 'card quiz-result-card';

    const title = document.createElement('h3');
    title.textContent = tool.name;

    const description = document.createElement('p');
    description.textContent = tool.description;

    const fit = document.createElement('p');
    fit.className = 'quiz-fit';
    fit.textContent = `Best fit for ${answers.goal}, ${answers.platform}, ${answers.budget} plans.`;

    const cta = document.createElement('a');
    cta.className = 'btn btn-primary';
    cta.href = tool.href;
    cta.textContent = 'Open Tool';

    card.appendChild(title);
    card.appendChild(description);
    card.appendChild(fit);
    card.appendChild(cta);

    return card;
  }

  if (quizForm && quizResult && quizResultList) {
    quizForm.addEventListener('submit', (event) => {
      event.preventDefault();

      const formData = new FormData(quizForm);
      const answers = {
        goal: String(formData.get('goal') || ''),
        budget: String(formData.get('budget') || ''),
        platform: String(formData.get('platform') || ''),
      };

      if (!answers.goal || !answers.budget || !answers.platform) {
        return;
      }

      const recommendations = quizTools
        .map((tool) => ({ tool, score: scoreTool(tool, answers) }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      quizResultList.innerHTML = '';
      recommendations.forEach((entry) => {
        quizResultList.appendChild(buildQuizResultCard(entry.tool, answers));
      });

      quizResult.hidden = false;
      quizResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    quizForm.addEventListener('reset', () => {
      quizResultList.innerHTML = '';
      quizResult.hidden = true;
    });
  }
}

const yearNode = document.querySelector('[data-current-year]');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}

const compareSelectionStorageKey = 'aitoolshubpro-compare-selection-v1';
const compareFiltersStorageKey = 'aitoolshubpro-compare-filters-v1';
const maxCompareSelection = 3;

const compareCatalog = {
  'writepilot-ai': { name: 'WritePilot AI', category: 'Writing', price: '$0', free: 'Yes', platforms: 'Web', bestFor: 'SEO articles and landing copy', rating: '4.8' },
  promptsmith: { name: 'PromptSmith', category: 'Writing', price: '$19', free: 'No', platforms: 'Web, Team', bestFor: 'Prompt libraries and reuse', rating: '4.5' },
  'imageforge-studio': { name: 'ImageForge Studio', category: 'Design', price: '$15', free: 'No', platforms: 'Web', bestFor: 'Ad visuals and creative assets', rating: '4.7' },
  'scenecanvas-ai': { name: 'SceneCanvas AI', category: 'Design', price: '$0', free: 'Yes', platforms: 'Web', bestFor: 'Mood boards and concepts', rating: '4.4' },
  'videoflow-ai': { name: 'VideoFlow AI', category: 'Video', price: '$24', free: 'No', platforms: 'Web', bestFor: 'Script-to-video campaigns', rating: '4.6' },
  'clipgen-pro': { name: 'ClipGen Pro', category: 'Video', price: '$0', free: 'Yes', platforms: 'Web', bestFor: 'Podcast highlights and reels', rating: '4.3' },
  'taskbrain-mobile': { name: 'TaskBrain Mobile', category: 'Productivity', price: '$0', free: 'Yes', platforms: 'Android', bestFor: 'Personal planning and execution', rating: '4.5' },
  'inboxmate-ai': { name: 'InboxMate AI', category: 'Productivity', price: '$12', free: 'No', platforms: 'Web', bestFor: 'Email summaries and replies', rating: '4.4' },
  'datalens-ai': { name: 'DataLens AI', category: 'Research', price: '$29', free: 'No', platforms: 'Web, Team', bestFor: 'Data insights and charts', rating: '4.2' },
  researchscope: { name: 'ResearchScope', category: 'Research', price: '$0', free: 'Yes', platforms: 'Web', bestFor: 'Document summaries and briefs', rating: '4.6' },
  voicebrief: { name: 'VoiceBrief', category: 'Productivity', price: '$9', free: 'No', platforms: 'Web, Mobile', bestFor: 'Meeting notes and actions', rating: '4.1' },
  'codesprint-ai': { name: 'CodeSprint AI', category: 'Developer', price: '$0', free: 'Yes', platforms: 'Web', bestFor: 'Tests, docs, and boilerplate code', rating: '4.3' },
};

function slugifyToolName(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getToolDetailUrl(slug) {
  return `/tools/${slug}/`;
}

function getToolSlugFromTitle(title) {
  const normalized = String(title || '').replace(/^Top Pick:\s*/i, '').trim();
  return slugifyToolName(normalized);
}

function getCompareSelection() {
  try {
    const raw = localStorage.getItem(compareSelectionStorageKey);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((slug) => typeof slug === 'string').slice(0, maxCompareSelection);
  } catch (error) {
    return [];
  }
}

function setCompareSelection(slugs) {
  const normalized = Array.from(new Set((slugs || []).filter(Boolean))).slice(0, maxCompareSelection);
  try {
    localStorage.setItem(compareSelectionStorageKey, JSON.stringify(normalized));
  } catch (error) {
    // Ignore storage write issues.
  }

  window.dispatchEvent(new CustomEvent('compare-selection-updated', { detail: { slugs: normalized } }));
  return normalized;
}

function buildComparePageUrl(slugs) {
  const selected = Array.from(new Set((slugs || []).filter(Boolean))).slice(0, maxCompareSelection);
  if (selected.length === 0) {
    return '/tools/compare/';
  }

  return `/tools/compare/?tools=${encodeURIComponent(selected.join(','))}`;
}

function renderCompareCardsFromSlugs(slugs) {
  const selected = (slugs || []).filter((slug) => compareCatalog[slug]);
  if (selected.length < 2) {
    return '<p class="compare-note">Choose at least 2 tools to compare.</p>';
  }

  return `<div class="compare-result-grid">${selected
    .map((slug) => {
      const item = compareCatalog[slug];
      return `
        <article class="card compare-result-card">
          <h3>${item.name}</h3>
          <p><strong>Category:</strong> ${item.category}</p>
          <p><strong>Price:</strong> ${item.price}</p>
          <p><strong>Free Plan:</strong> ${item.free}</p>
          <p><strong>Platforms:</strong> ${item.platforms}</p>
          <p><strong>Best For:</strong> ${item.bestFor}</p>
          <p><strong>Rating:</strong> ${item.rating}</p>
        </article>
      `;
    })
    .join('')}</div>`;
}

function ensureCompareJsonLd(slugs) {
  if (typeof document === 'undefined') {
    return;
  }

  const selected = (slugs || []).filter((slug) => compareCatalog[slug]);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'AI Tools Comparison',
    itemListOrder: 'https://schema.org/ItemListOrderAscending',
    numberOfItems: selected.length,
    itemListElement: selected.map((slug, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'SoftwareApplication',
        name: compareCatalog[slug].name,
        applicationCategory: compareCatalog[slug].category,
        operatingSystem: compareCatalog[slug].platforms,
      },
    })),
  };

  let node = document.getElementById('compare-jsonld');
  if (!node) {
    node = document.createElement('script');
    node.type = 'application/ld+json';
    node.id = 'compare-jsonld';
    document.head.appendChild(node);
  }

  node.textContent = JSON.stringify(jsonLd);
}

const compareTable = document.querySelector('[data-compare-table]');

if (compareTable) {
  const body = compareTable.querySelector('[data-compare-body]');
  const emptyState = compareTable.querySelector('[data-compare-empty]');
  const categorySelect = compareTable.querySelector('[data-compare-category]');
  const pricingSelect = compareTable.querySelector('[data-compare-pricing]');
  const sortSelect = compareTable.querySelector('[data-compare-sort]');
  const runCompareButton = compareTable.querySelector('[data-compare-run]');
  const clearCompareButton = compareTable.querySelector('[data-compare-clear]');
  const openCompareLink = compareTable.querySelector('[data-compare-open]');
  const compareResult = compareTable.querySelector('[data-compare-result]');
  let selectedSlugs = getCompareSelection();

  function updateCompareButtonLabel() {
    if (runCompareButton) {
      runCompareButton.textContent = `Compare Selected (${selectedSlugs.length}/3)`;
    }

    if (openCompareLink) {
      openCompareLink.href = buildComparePageUrl(selectedSlugs);
    }
  }

  function persistCompareFilters() {
    try {
      const payload = {
        category: categorySelect ? categorySelect.value : 'all',
        pricing: pricingSelect ? pricingSelect.value : 'all',
        sort: sortSelect ? sortSelect.value : 'rating',
      };
      localStorage.setItem(compareFiltersStorageKey, JSON.stringify(payload));
    } catch (error) {
      // Ignore localStorage write issues.
    }
  }

  function restoreCompareFilters() {
    try {
      const raw = localStorage.getItem(compareFiltersStorageKey);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (categorySelect && parsed.category) {
        categorySelect.value = parsed.category;
      }
      if (pricingSelect && parsed.pricing) {
        pricingSelect.value = parsed.pricing;
      }
      if (sortSelect && parsed.sort) {
        sortSelect.value = parsed.sort;
      }
    } catch (error) {
      // Ignore localStorage read/parse issues.
    }
  }

  function enrichRows() {
    const rows = Array.from(body ? body.querySelectorAll('tr') : []);
    const headerRow = compareTable.querySelector('thead tr');

    if (headerRow && !headerRow.querySelector('[data-compare-select-header]')) {
      const selectHeader = document.createElement('th');
      selectHeader.textContent = 'Select';
      selectHeader.setAttribute('data-compare-select-header', 'true');
      headerRow.prepend(selectHeader);
    }

    rows.forEach((row) => {
      const name = row.getAttribute('data-name') || '';
      const slug = slugifyToolName(name);
      row.setAttribute('data-tool-slug', slug);

      if (!row.querySelector('[data-compare-pick]')) {
        const selectCell = document.createElement('td');
        const selectBox = document.createElement('input');
        selectBox.type = 'checkbox';
        selectBox.setAttribute('data-compare-pick', 'true');
        selectBox.setAttribute('aria-label', `Select ${name} for comparison`);
        selectCell.appendChild(selectBox);
        row.prepend(selectCell);

        selectBox.addEventListener('change', () => {
          if (selectBox.checked) {
            if (selectedSlugs.length >= maxCompareSelection) {
              selectBox.checked = false;
              return;
            }
            selectedSlugs = Array.from(new Set([...selectedSlugs, slug]));
          } else {
            selectedSlugs = selectedSlugs.filter((item) => item !== slug);
          }

          setCompareSelection(selectedSlugs);
          syncSelectionUI();
          updateCompareButtonLabel();
        });
      }

      const cells = row.querySelectorAll('td');
      if (cells.length > 1 && !cells[1].querySelector('a')) {
        const toolName = cells[1].textContent.trim();
        cells[1].innerHTML = `<a class="compare-link" href="${getToolDetailUrl(slug)}">${toolName}</a>`;
      }
    });
  }

  function syncSelectionUI() {
    const selectedSet = new Set(selectedSlugs);
    if (!body) {
      return;
    }

    body.querySelectorAll('tr').forEach((row) => {
      const slug = row.getAttribute('data-tool-slug') || '';
      const isSelected = selectedSet.has(slug);
      row.classList.toggle('is-selected', isSelected);
      const checkbox = row.querySelector('[data-compare-pick]');
      if (checkbox) {
        checkbox.checked = isSelected;
      }
    });
  }

  function renderComparisonCards() {
    if (!compareResult) {
      return;
    }

    compareResult.hidden = false;
    compareResult.innerHTML = renderCompareCardsFromSlugs(selectedSlugs);
    compareResult.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function applyComparisonFilters() {
    if (!body || !categorySelect || !pricingSelect || !sortSelect) {
      return;
    }

    const category = categorySelect.value;
    const pricing = pricingSelect.value;
    const sortBy = sortSelect.value;
    const rows = Array.from(body.querySelectorAll('tr'));

    const filteredRows = rows.filter((row) => {
      const rowCategory = row.getAttribute('data-category') || '';
      const rowFree = row.getAttribute('data-free') || 'false';

      const categoryMatch = category === 'all' || rowCategory === category;
      const pricingMatch = pricing === 'all' || (pricing === 'free' ? rowFree === 'true' : rowFree === 'false');

      row.hidden = !(categoryMatch && pricingMatch);
      return categoryMatch && pricingMatch;
    });

    const sortedRows = filteredRows.sort((a, b) => {
      if (sortBy === 'name') {
        return (a.getAttribute('data-name') || '').localeCompare(b.getAttribute('data-name') || '');
      }

      if (sortBy === 'price-low') {
        return Number(a.getAttribute('data-price') || 0) - Number(b.getAttribute('data-price') || 0);
      }

      if (sortBy === 'price-high') {
        return Number(b.getAttribute('data-price') || 0) - Number(a.getAttribute('data-price') || 0);
      }

      return Number(b.getAttribute('data-rating') || 0) - Number(a.getAttribute('data-rating') || 0);
    });

    sortedRows.forEach((row) => {
      body.appendChild(row);
    });

    if (emptyState) {
      emptyState.hidden = sortedRows.length > 0;
    }

    persistCompareFilters();
  }

  [categorySelect, pricingSelect, sortSelect].forEach((select) => {
    select.addEventListener('change', applyComparisonFilters);
  });

  if (runCompareButton) {
    runCompareButton.addEventListener('click', renderComparisonCards);
  }

  if (clearCompareButton) {
    clearCompareButton.addEventListener('click', () => {
      selectedSlugs = [];
      setCompareSelection(selectedSlugs);
      syncSelectionUI();
      if (compareResult) {
        compareResult.hidden = true;
        compareResult.innerHTML = '';
      }
      updateCompareButtonLabel();
    });
  }

  restoreCompareFilters();
  enrichRows();
  syncSelectionUI();
  updateCompareButtonLabel();
  applyComparisonFilters();

  window.addEventListener('compare-selection-updated', (event) => {
    const slugs = event.detail && Array.isArray(event.detail.slugs) ? event.detail.slugs : [];
    selectedSlugs = slugs;
    syncSelectionUI();
    updateCompareButtonLabel();
  });
}

const toolsGrid = document.querySelector('section[aria-label="Tools grid"]');
if (toolsGrid) {
  let selectedSlugs = getCompareSelection();

  function syncCardCompareButtons() {
    const selectedSet = new Set(selectedSlugs);
    toolsGrid.querySelectorAll('.tool-card').forEach((card) => {
      const titleNode = card.querySelector('[data-search-title]');
      const footer = card.querySelector('.card-footer');
      if (!titleNode || !footer) {
        return;
      }

      const slug = slugifyToolName(titleNode.textContent.trim());
      card.id = card.id || slug;

      let button = footer.querySelector('[data-compare-card-btn]');
      if (!button) {
        button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn btn-secondary compare-card-btn';
        button.setAttribute('data-compare-card-btn', 'true');
        footer.appendChild(button);

        button.addEventListener('click', () => {
          const isSelected = selectedSlugs.includes(slug);
          if (isSelected) {
            selectedSlugs = selectedSlugs.filter((item) => item !== slug);
          } else {
            if (selectedSlugs.length >= maxCompareSelection) {
              return;
            }
            selectedSlugs = [...selectedSlugs, slug];
          }

          selectedSlugs = setCompareSelection(selectedSlugs);
          syncCardCompareButtons();
        });
      }

      const active = selectedSet.has(slug);
      button.classList.toggle('is-active', active);
      button.textContent = active ? 'Remove Compare' : 'Add Compare';
    });
  }

  syncCardCompareButtons();
  window.addEventListener('compare-selection-updated', (event) => {
    const slugs = event.detail && Array.isArray(event.detail.slugs) ? event.detail.slugs : [];
    selectedSlugs = slugs;
    syncCardCompareButtons();
  });
}

document.querySelectorAll('.tool-card').forEach((card) => {
  const titleNode = card.querySelector('[data-search-title]');
  if (!titleNode) {
    return;
  }

  const slug = getToolSlugFromTitle(titleNode.textContent);
  if (!slug) {
    return;
  }

  card.id = card.id || slug;

  card.querySelectorAll('a.btn').forEach((link) => {
    if (link.classList.contains('compare-card-btn')) {
      return;
    }
    link.href = getToolDetailUrl(slug);
  });
});

const comparePage = document.querySelector('[data-compare-page]');
if (comparePage) {
  const grid = comparePage.querySelector('[data-compare-page-grid]');
  const note = comparePage.querySelector('[data-compare-page-note]');
  const shareButton = comparePage.querySelector('[data-compare-share]');
  const shareFeedback = comparePage.querySelector('[data-compare-share-feedback]');
  const params = new URLSearchParams(window.location.search);
  const queryTools = String(params.get('tools') || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, maxCompareSelection);

  const selected = queryTools.length > 0 ? queryTools : getCompareSelection();
  if (selected.length > 0) {
    setCompareSelection(selected);
  }

  if (grid) {
    if (selected.length >= 2) {
      grid.innerHTML = renderCompareCardsFromSlugs(selected);
    } else {
      grid.innerHTML = '';
    }
  }

  if (note) {
    note.hidden = selected.length >= 2;
  }

  ensureCompareJsonLd(selected);

  if (shareButton) {
    shareButton.addEventListener('click', async () => {
      const compareUrl = `${window.location.origin}${buildComparePageUrl(selected)}`;

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(compareUrl);
        }

        if (shareFeedback) {
          shareFeedback.hidden = false;
          shareFeedback.textContent = 'Comparison link copied successfully.';
        }
      } catch (error) {
        if (shareFeedback) {
          shareFeedback.hidden = false;
          shareFeedback.textContent = `Share this link: ${compareUrl}`;
        }
      }
    });
  }
}

const toolsPage = document.querySelector('[data-tools-page]');
if (toolsPage && window.location.pathname.startsWith('/tools/')) {
  const reviewStorageKey = 'aitoolshubpro-user-reviews-v1';
  const reviewRoot = toolsPage.querySelector('[data-reviews-root]');
  const relatedRoot = toolsPage.querySelector('[data-related-widget]');

  function loadReviews() {
    try {
      const raw = localStorage.getItem(reviewStorageKey);
      if (!raw) {
        return [];
      }

      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return [];
      }

      return parsed
        .filter((item) => item && compareCatalog[item.tool] && item.text)
        .slice(-100);
    } catch (error) {
      return [];
    }
  }

  function saveReviews(items) {
    try {
      localStorage.setItem(reviewStorageKey, JSON.stringify((items || []).slice(-100)));
    } catch (error) {
      // Ignore storage write issues.
    }
  }

  function getAverageRatingByTool(reviews) {
    const map = {};

    (reviews || []).forEach((item) => {
      if (!map[item.tool]) {
        map[item.tool] = { total: 0, count: 0 };
      }
      map[item.tool].total += Number(item.rating || 0);
      map[item.tool].count += 1;
    });

    return map;
  }

  function renderToolRatingBadges(reviews) {
    const ratings = getAverageRatingByTool(reviews);
    const cards = toolsPage.querySelectorAll('section[data-search-scope] .tool-card');

    cards.forEach((card) => {
      const titleNode = card.querySelector('[data-search-title]');
      const body = card.querySelector('.tool-card-body');
      if (!titleNode || !body) {
        return;
      }

      const slug = slugifyToolName(titleNode.textContent.trim());
      let badge = body.querySelector('[data-tool-rating-badge]');
      if (!badge) {
        badge = document.createElement('p');
        badge.className = 'tool-user-rating';
        badge.setAttribute('data-tool-rating-badge', 'true');
        body.insertBefore(badge, body.querySelector('.card-footer'));
      }

      const entry = ratings[slug];
      if (!entry || entry.count === 0) {
        badge.remove();
      } else {
        const avg = (entry.total / entry.count).toFixed(1);
        badge.textContent = `User rating: ${avg}/5 (${entry.count} reviews)`;
      }
    });
  }

  function populateToolSelect(selectNode) {
    if (!selectNode) {
      return;
    }

    const entries = Object.entries(compareCatalog).sort((a, b) => a[1].name.localeCompare(b[1].name));
    entries.forEach(([slug, data]) => {
      const option = document.createElement('option');
      option.value = slug;
      option.textContent = data.name;
      selectNode.appendChild(option);
    });
  }

  function renderReviewsList(reviews) {
    if (!reviewRoot) {
      return;
    }

    const listNode = reviewRoot.querySelector('[data-review-list]');
    if (!listNode) {
      return;
    }

    listNode.innerHTML = '';
    const latest = (reviews || []).slice().reverse().slice(0, 8);
    if (latest.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'compare-note';
      empty.textContent = 'No user reviews yet. Be the first to submit one.';
      listNode.appendChild(empty);
      return;
    }

    latest.forEach((item) => {
      const card = document.createElement('article');
      card.className = 'card review-card';

      const toolName = document.createElement('h3');
      toolName.textContent = compareCatalog[item.tool].name;

      const meta = document.createElement('p');
      meta.className = 'review-meta';
      meta.textContent = `Rating: ${item.rating}/5`;

      const text = document.createElement('p');
      text.textContent = item.text;

      card.appendChild(toolName);
      card.appendChild(meta);
      card.appendChild(text);
      listNode.appendChild(card);
    });
  }

  function renderRelatedTools(slug) {
    if (!relatedRoot) {
      return;
    }

    const listNode = relatedRoot.querySelector('[data-related-list]');
    if (!listNode) {
      return;
    }

    listNode.innerHTML = '';
    if (!slug || !compareCatalog[slug]) {
      const empty = document.createElement('p');
      empty.className = 'compare-note';
      empty.textContent = 'Select a tool to see related alternatives.';
      listNode.appendChild(empty);
      return;
    }

    const current = compareCatalog[slug];
    const related = Object.entries(compareCatalog)
      .filter(([itemSlug, item]) => itemSlug !== slug && item.category === current.category)
      .sort((a, b) => Number(b[1].rating) - Number(a[1].rating))
      .slice(0, 3);

    if (related.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'compare-note';
      empty.textContent = 'No related tools available yet.';
      listNode.appendChild(empty);
      return;
    }

    related.forEach(([itemSlug, item]) => {
      const card = document.createElement('article');
      card.className = 'card related-card';

      const title = document.createElement('h3');
      title.textContent = item.name;

      const desc = document.createElement('p');
      desc.textContent = item.bestFor;

      const link = document.createElement('a');
      link.className = 'btn btn-secondary';
      link.href = getToolDetailUrl(itemSlug);
      link.textContent = 'View Tool';

      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(link);
      listNode.appendChild(card);
    });
  }

  if (reviewRoot) {
    const form = reviewRoot.querySelector('[data-review-form]');
    const toolSelect = reviewRoot.querySelector('[data-review-tool]');
    const ratingSelect = reviewRoot.querySelector('[data-review-rating]');
    const textArea = reviewRoot.querySelector('[data-review-text]');

    populateToolSelect(toolSelect);

    let reviews = loadReviews();
    renderReviewsList(reviews);
    renderToolRatingBadges(reviews);

    if (form && toolSelect && ratingSelect && textArea) {
      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const tool = toolSelect.value;
        const rating = Number(ratingSelect.value || 0);
        const text = textArea.value.trim().slice(0, 280);
        if (!tool || !rating || !text) {
          return;
        }

        reviews.push({
          tool,
          rating,
          text,
          createdAt: new Date().toISOString(),
        });

        saveReviews(reviews);
        reviews = loadReviews();
        renderReviewsList(reviews);
        renderToolRatingBadges(reviews);
        form.reset();
      });
    }
  }

  if (relatedRoot) {
    const toolSelect = relatedRoot.querySelector('[data-related-tool-select]');
    populateToolSelect(toolSelect);
    renderRelatedTools('');
    if (toolSelect) {
      toolSelect.addEventListener('change', () => {
        renderRelatedTools(toolSelect.value);
      });
    }
  }
}

const newsletterRoot = document.querySelector('[data-newsletter]');
if (newsletterRoot) {
  const newsletterStorageKey = 'aitoolshubpro-newsletter-v1';
  const form = newsletterRoot.querySelector('[data-newsletter-form]');
  const emailInput = newsletterRoot.querySelector('[data-newsletter-email]');
  const feedback = newsletterRoot.querySelector('[data-newsletter-feedback]');
  const downloadButton = newsletterRoot.querySelector('[data-newsletter-download]');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim());
  }

  function showSubscribedState(email) {
    if (feedback) {
      feedback.textContent = `Thanks${email ? `, ${email}` : ''}. Your toolkit is ready to download.`;
    }
    if (downloadButton) {
      downloadButton.hidden = false;
    }
  }

  try {
    const raw = localStorage.getItem(newsletterStorageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.email) {
        showSubscribedState(parsed.email);
      }
    }
  } catch (error) {
    // Ignore invalid localStorage data.
  }

  if (form && emailInput) {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const email = String(emailInput.value || '').trim().toLowerCase();

      if (!isValidEmail(email)) {
        if (feedback) {
          feedback.textContent = 'Please enter a valid email address.';
        }
        if (downloadButton) {
          downloadButton.hidden = true;
        }
        return;
      }

      const payload = {
        email,
        subscribedAt: new Date().toISOString(),
      };

      try {
        localStorage.setItem(newsletterStorageKey, JSON.stringify(payload));
      } catch (error) {
        // Ignore localStorage write issues.
      }

      showSubscribedState(email);
      form.reset();
    });
  }
}

document.querySelectorAll('[data-copy-trigger]').forEach((button) => {
  button.addEventListener('click', async () => {
    const targetId = String(button.getAttribute('data-copy-target') || '').trim();
    if (!targetId) {
      return;
    }

    const sourceNode = document.getElementById(targetId);
    if (!sourceNode) {
      return;
    }

    const text = 'value' in sourceNode ? String(sourceNode.value || '') : String(sourceNode.textContent || '');
    if (!text.trim()) {
      return;
    }

    const feedbackNode = button.closest('.prompt-shell')?.querySelector('[data-copy-feedback]');

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const tempArea = document.createElement('textarea');
        tempArea.value = text;
        tempArea.setAttribute('readonly', 'true');
        tempArea.style.position = 'fixed';
        tempArea.style.opacity = '0';
        document.body.appendChild(tempArea);
        tempArea.select();
        document.execCommand('copy');
        document.body.removeChild(tempArea);
      }

      if (feedbackNode) {
        feedbackNode.hidden = false;
        feedbackNode.textContent = 'Prompt copied successfully.';
      }
    } catch (error) {
      if (feedbackNode) {
        feedbackNode.hidden = false;
        feedbackNode.textContent = 'Copy failed. Please copy manually from the prompt box.';
      }
    }
  });
});
