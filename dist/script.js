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

const yearNode = document.querySelector('[data-current-year]');
if (yearNode) {
  yearNode.textContent = String(new Date().getFullYear());
}
