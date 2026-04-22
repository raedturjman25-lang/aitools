const googleAnalyticsMeasurementId = 'G-8LLLL9YY7H';

function initGoogleAnalytics() {
  if (!googleAnalyticsMeasurementId) {
    return;
  }

  if (window.location.pathname.startsWith('/admin/')) {
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

if (navToggle && navMenu) {
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(navMenu.classList.contains('open')));
  });
}

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

const compareTable = document.querySelector('[data-compare-table]');

if (compareTable) {
  const body = compareTable.querySelector('[data-compare-body]');
  const emptyState = compareTable.querySelector('[data-compare-empty]');
  const categorySelect = compareTable.querySelector('[data-compare-category]');
  const pricingSelect = compareTable.querySelector('[data-compare-pricing]');
  const sortSelect = compareTable.querySelector('[data-compare-sort]');
  const runCompareButton = compareTable.querySelector('[data-compare-run]');
  const clearCompareButton = compareTable.querySelector('[data-compare-clear]');
  const compareResult = compareTable.querySelector('[data-compare-result]');
  const selectedRows = new Set();
  const compareStorageKey = 'aitoolshubpro-compare-filters-v1';

  function toSlug(value) {
    return String(value || '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function updateCompareButtonLabel() {
    if (runCompareButton) {
      runCompareButton.textContent = `Compare Selected (${selectedRows.size}/3)`;
    }
  }

  function persistCompareFilters() {
    try {
      const payload = {
        category: categorySelect ? categorySelect.value : 'all',
        pricing: pricingSelect ? pricingSelect.value : 'all',
        sort: sortSelect ? sortSelect.value : 'rating',
      };
      localStorage.setItem(compareStorageKey, JSON.stringify(payload));
    } catch (error) {
      // Ignore localStorage write issues.
    }
  }

  function restoreCompareFilters() {
    try {
      const raw = localStorage.getItem(compareStorageKey);
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
      const slug = toSlug(name);
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
            if (selectedRows.size >= 3) {
              selectBox.checked = false;
              return;
            }
            selectedRows.add(row);
            row.classList.add('is-selected');
          } else {
            selectedRows.delete(row);
            row.classList.remove('is-selected');
          }

          updateCompareButtonLabel();
        });
      }

      const cells = row.querySelectorAll('td');
      if (cells.length > 1 && !cells[1].querySelector('a')) {
        const toolName = cells[1].textContent.trim();
        cells[1].innerHTML = `<a class="compare-link" href="#${slug}">${toolName}</a>`;
      }
    });

    document.querySelectorAll('section[data-search-scope] .tool-card').forEach((card) => {
      const titleNode = card.querySelector('[data-search-title]');
      if (!titleNode || card.id) {
        return;
      }

      card.id = toSlug(titleNode.textContent.trim());
    });
  }

  function renderComparisonCards() {
    if (!compareResult) {
      return;
    }

    if (selectedRows.size < 2) {
      compareResult.hidden = false;
      compareResult.innerHTML = '<p class="compare-note">Choose at least 2 tools to compare.</p>';
      return;
    }

    const cards = Array.from(selectedRows).map((row) => {
      const cells = row.querySelectorAll('td');
      const tool = cells[1] ? cells[1].textContent.trim() : '';
      const category = cells[2] ? cells[2].textContent.trim() : '';
      const price = cells[3] ? cells[3].textContent.trim() : '';
      const free = cells[4] ? cells[4].textContent.trim() : '';
      const platforms = cells[5] ? cells[5].textContent.trim() : '';
      const bestFor = cells[6] ? cells[6].textContent.trim() : '';
      const rating = cells[7] ? cells[7].textContent.trim() : '';

      return `
        <article class="card compare-result-card">
          <h3>${tool}</h3>
          <p><strong>Category:</strong> ${category}</p>
          <p><strong>Price:</strong> ${price}</p>
          <p><strong>Free Plan:</strong> ${free}</p>
          <p><strong>Platforms:</strong> ${platforms}</p>
          <p><strong>Best For:</strong> ${bestFor}</p>
          <p><strong>Rating:</strong> ${rating}</p>
        </article>
      `;
    });

    compareResult.hidden = false;
    compareResult.innerHTML = `<div class="compare-result-grid">${cards.join('')}</div>`;
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
      selectedRows.clear();
      if (body) {
        body.querySelectorAll('[data-compare-pick]').forEach((node) => {
          node.checked = false;
        });
        body.querySelectorAll('tr').forEach((row) => row.classList.remove('is-selected'));
      }
      if (compareResult) {
        compareResult.hidden = true;
        compareResult.innerHTML = '';
      }
      updateCompareButtonLabel();
    });
  }

  restoreCompareFilters();
  enrichRows();
  updateCompareButtonLabel();
  applyComparisonFilters();
}
