/* ============================================
   BLACK NEWS – App Logic & Gemini Integration
   ============================================ */

(function () {
  'use strict';

  // ─── Constants ───
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const STORAGE_KEYS = {
    apiKey: 'blacknews_api_key',
    theme: 'blacknews_theme',
    history: 'blacknews_history',
  };

  const CATEGORIES = [
    'technology', 'business', 'science', 'health',
    'sports', 'entertainment', 'politics', 'world'
  ];

  // ─── State ───
  let state = {
    apiKey: '',
    selectedCategory: 'technology',
    customTopic: '',
    articleCount: 3,
    isGenerating: false,
    articles: [],
    history: [],
  };

  // ─── DOM References ───
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const dom = {
    // Theme
    themeToggle: $('#themeToggle'),

    // API
    apiSection: $('#apiSection'),
    apiHeader: $('#apiHeader'),
    apiBody: $('#apiBody'),
    apiKeyInput: $('#apiKeyInput'),
    toggleKeyVisibility: $('#toggleKeyVisibility'),
    saveKeyBtn: $('#saveKeyBtn'),
    removeKeyBtn: $('#removeKeyBtn'),
    apiStatus: $('#apiStatus'),
    apiStatusText: $('#apiStatusText'),

    // Generator
    categories: $('#categories'),
    topicInput: $('#topicInput'),
    countSelector: $('#countSelector'),
    generateBtn: $('#generateBtn'),

    // Results
    resultsHeader: $('#resultsHeader'),
    resultsCount: $('#resultsCount'),
    articlesContainer: $('#articlesContainer'),
    emptyState: $('#emptyState'),

    // History
    historyToggle: $('#historyToggle'),
    historyBadge: $('#historyBadge'),
    historyOverlay: $('#historyOverlay'),
    historyPanel: $('#historyPanel'),
    historyBody: $('#historyBody'),
    historyEmpty: $('#historyEmpty'),
    closeHistory: $('#closeHistory'),
    clearHistoryBtn: $('#clearHistoryBtn'),

    // Toast
    toastContainer: $('#toastContainer'),
  };

  // ─── Initialization ───
  function init() {
    loadState();
    setupTheme();
    setupAPISection();
    setupCategories();
    setupCountSelector();
    setupTopicInput();
    setupGenerateButton();
    setupHistory();
    setupKeyboardShortcuts();
  }

  // ─── State Persistence ───
  function loadState() {
    state.apiKey = localStorage.getItem(STORAGE_KEYS.apiKey) || '';
    state.history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
  }

  function saveApiKey(key) {
    state.apiKey = key;
    localStorage.setItem(STORAGE_KEYS.apiKey, key);
  }

  function removeApiKey() {
    state.apiKey = '';
    localStorage.removeItem(STORAGE_KEYS.apiKey);
  }

  function saveHistory() {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
  }

  // ─── Theme ───
  function setupTheme() {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved) {
      document.documentElement.setAttribute('data-theme', saved);
      updateThemeIcon(saved);
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const theme = prefersDark ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      updateThemeIcon(theme);
    }

    dom.themeToggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem(STORAGE_KEYS.theme, next);
      updateThemeIcon(next);
      showToast(next === 'dark' ? '🌙 Dark mode enabled' : '☀️ Light mode enabled', 'info');
    });
  }

  function updateThemeIcon(theme) {
    dom.themeToggle.textContent = theme === 'dark' ? '🌙' : '☀️';
  }

  // ─── API Key Section ───
  function setupAPISection() {
    // Toggle visibility
    dom.toggleKeyVisibility.addEventListener('click', () => {
      const input = dom.apiKeyInput;
      input.type = input.type === 'password' ? 'text' : 'password';
      dom.toggleKeyVisibility.textContent = input.type === 'password' ? '👁️' : '🙈';
    });

    // Save key
    dom.saveKeyBtn.addEventListener('click', () => {
      const key = dom.apiKeyInput.value.trim();
      if (!key) {
        showToast('Please enter an API key', 'error');
        dom.apiKeyInput.focus();
        return;
      }
      saveApiKey(key);
      updateAPIStatus(true);
      showToast('✅ API key saved successfully', 'success');
      // Collapse after short delay
      setTimeout(() => {
        dom.apiBody.classList.add('collapsed');
      }, 600);
    });

    // Remove key
    dom.removeKeyBtn.addEventListener('click', () => {
      removeApiKey();
      dom.apiKeyInput.value = '';
      updateAPIStatus(false);
      dom.apiBody.classList.remove('collapsed');
      dom.removeKeyBtn.classList.add('hidden');
      showToast('API key removed', 'info');
    });

    // Toggle expand/collapse
    dom.apiHeader.addEventListener('click', () => {
      dom.apiBody.classList.toggle('collapsed');
    });

    // Restore state
    if (state.apiKey) {
      dom.apiKeyInput.value = state.apiKey;
      updateAPIStatus(true);
      dom.apiBody.classList.add('collapsed');
    }
  }

  function updateAPIStatus(connected) {
    if (connected) {
      dom.apiStatus.className = 'api-status connected';
      dom.apiStatusText.textContent = 'Connected';
      dom.removeKeyBtn.classList.remove('hidden');
      dom.generateBtn.disabled = false;
    } else {
      dom.apiStatus.className = 'api-status disconnected';
      dom.apiStatusText.textContent = 'Not Connected';
      dom.removeKeyBtn.classList.add('hidden');
      dom.generateBtn.disabled = true;
    }
  }

  // ─── Categories ───
  function setupCategories() {
    dom.categories.addEventListener('click', (e) => {
      const chip = e.target.closest('.category-chip');
      if (!chip) return;

      $$('.category-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedCategory = chip.dataset.category;

      // Clear custom topic when selecting a category
      dom.topicInput.value = '';
      state.customTopic = '';
    });
  }

  // ─── Count Selector ───
  function setupCountSelector() {
    dom.countSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.count-btn');
      if (!btn) return;
      $$('.count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.articleCount = parseInt(btn.dataset.count, 10);
    });
  }

  // ─── Topic Input ───
  function setupTopicInput() {
    dom.topicInput.addEventListener('input', (e) => {
      state.customTopic = e.target.value.trim();
      if (state.customTopic) {
        $$('.category-chip').forEach(c => c.classList.remove('active'));
      }
    });

    dom.topicInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !state.isGenerating && state.apiKey) {
        generateArticles();
      }
    });
  }

  // ─── Generate ───
  function setupGenerateButton() {
    dom.generateBtn.addEventListener('click', () => {
      if (!state.isGenerating) generateArticles();
    });
  }

  async function generateArticles() {
    if (!state.apiKey) {
      showToast('Please add your API key first', 'error');
      return;
    }

    const topic = state.customTopic || state.selectedCategory;
    if (!topic) {
      showToast('Please select a category or enter a topic', 'error');
      return;
    }

    state.isGenerating = true;
    dom.generateBtn.classList.add('loading');
    dom.generateBtn.disabled = true;

    // Show skeletons
    showSkeletons(state.articleCount);

    try {
      const articles = await callGeminiAPI(topic, state.articleCount);
      state.articles = articles;
      renderArticles(articles);

      // Save to history
      articles.forEach(article => {
        state.history.unshift({
          ...article,
          savedAt: new Date().toISOString(),
        });
      });
      // Keep max 50 in history
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
      saveHistory();
      updateHistoryBadge();

      showToast(`✅ Generated ${articles.length} article${articles.length > 1 ? 's' : ''}`, 'success');
    } catch (err) {
      console.error('Generation error:', err);
      showErrorState(err.message);
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      state.isGenerating = false;
      dom.generateBtn.classList.remove('loading');
      dom.generateBtn.disabled = false;
    }
  }

  // ─── Gemini API ───
  async function callGeminiAPI(topic, count) {
    const prompt = buildPrompt(topic, count);

    const response = await fetch(`${GEMINI_API_URL}?key=${state.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 400) {
        throw new Error('Invalid API key. Please check your key and try again.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 403) {
        throw new Error('API key does not have permission. Enable the Generative Language API.');
      }
      throw new Error(errData?.error?.message || `API request failed (${response.status})`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      throw new Error('No content received from the AI. Please try again.');
    }

    return parseArticles(text, topic);
  }

  function buildPrompt(topic, count) {
    const isCategory = CATEGORIES.includes(topic.toLowerCase());
    const topicLabel = isCategory
      ? `the "${topic}" category`
      : `the topic: "${topic}"`;

    return `You are a professional news journalist. Generate exactly ${count} unique, realistic, and well-written news article${count > 1 ? 's' : ''} about ${topicLabel}.

For EACH article, output in this exact JSON format (output only a valid JSON array, no other text):

[
  {
    "headline": "A compelling, journalistic headline",
    "summary": "A 1-2 sentence summary of the article",
    "body": "A well-written 3-4 paragraph article body. Use professional journalistic tone. Include quotes from fictional but realistic sources. Make it feel like a real news article from a major publication.",
    "source": "Name of a fictional but realistic news source",
    "category": "${isCategory ? topic : 'custom'}",
    "readingTime": estimated reading time in minutes (number)
  }
]

Important rules:
- Output ONLY the JSON array, no markdown formatting, no code fences, no extra text
- Make headlines attention-grabbing and newsworthy
- Make the body detailed, informative, and professional
- Each article should be unique and cover a different angle
- Use realistic dates, people, and organizations (fictional but plausible)
- Reading time should be between 2-7 minutes based on body length`;
  }

  function parseArticles(text, topic) {
    // Try to extract JSON from the response
    let cleaned = text.trim();

    // Remove markdown code fences if present
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    try {
      const articles = JSON.parse(cleaned);
      if (Array.isArray(articles) && articles.length > 0) {
        return articles.map(a => ({
          headline: a.headline || 'Untitled Article',
          summary: a.summary || '',
          body: a.body || '',
          source: a.source || 'AI News Service',
          category: a.category || topic,
          readingTime: a.readingTime || 3,
          id: generateId(),
          generatedAt: new Date().toISOString(),
        }));
      }
    } catch (e) {
      // Try to find JSON array in the text
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const articles = JSON.parse(jsonMatch[0]);
          if (Array.isArray(articles)) {
            return articles.map(a => ({
              headline: a.headline || 'Untitled Article',
              summary: a.summary || '',
              body: a.body || '',
              source: a.source || 'AI News Service',
              category: a.category || topic,
              readingTime: a.readingTime || 3,
              id: generateId(),
              generatedAt: new Date().toISOString(),
            }));
          }
        } catch (e2) {
          // Fall through
        }
      }
    }

    // Fallback: create a single article from the raw text
    return [{
      headline: `News on ${topic}`,
      summary: cleaned.substring(0, 200),
      body: cleaned,
      source: 'AI News Service',
      category: topic,
      readingTime: Math.ceil(cleaned.split(/\s+/).length / 200),
      id: generateId(),
      generatedAt: new Date().toISOString(),
    }];
  }

  // ─── Rendering ───
  function showSkeletons(count) {
    dom.emptyState.classList.add('hidden');
    dom.resultsHeader.classList.remove('hidden');
    dom.resultsCount.textContent = 'Generating...';

    let html = '<div class="articles-grid">';
    for (let i = 0; i < count; i++) {
      html += `
        <div class="skeleton-card" style="animation-delay: ${i * 0.1}s">
          <div class="skeleton-line short"></div>
          <div class="skeleton-line title"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
          <div class="skeleton-line long"></div>
          <div class="skeleton-line medium"></div>
        </div>`;
    }
    html += '</div>';
    dom.articlesContainer.innerHTML = html;
  }

  function renderArticles(articles) {
    dom.emptyState.classList.add('hidden');
    dom.resultsHeader.classList.remove('hidden');
    dom.resultsCount.textContent = `${articles.length} article${articles.length > 1 ? 's' : ''} generated`;

    let html = '<div class="articles-grid">';
    articles.forEach((article, index) => {
      const badgeClass = CATEGORIES.includes(article.category)
        ? `badge-${article.category}`
        : 'badge-custom';

      const date = new Date(article.generatedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
      });

      html += `
        <article class="article-card" style="animation-delay: ${index * 0.15}s" data-id="${article.id}">
          <div class="article-meta">
            <span class="article-category-badge ${badgeClass}">${escapeHtml(article.category)}</span>
            <span class="article-reading-time">📖 ${article.readingTime} min read</span>
            <span class="article-date">${date}</span>
          </div>
          <h2 class="article-headline">${escapeHtml(article.headline)}</h2>
          <p class="article-summary">${escapeHtml(article.summary)}</p>
          <div class="article-body" id="body-${article.id}">
            ${formatBody(article.body)}
          </div>
          <div class="article-source">📌 Source: ${escapeHtml(article.source)}</div>
          <div class="article-actions">
            <button class="article-btn" onclick="BlackNews.toggleBody('${article.id}')">
              📖 <span id="toggle-text-${article.id}">Read Full Article</span>
            </button>
            <button class="article-btn" onclick="BlackNews.copyArticle('${article.id}')">
              📋 Copy
            </button>
            <button class="article-btn" onclick="BlackNews.shareArticle('${article.id}')">
              🔗 Share
            </button>
          </div>
        </article>`;
    });
    html += '</div>';
    dom.articlesContainer.innerHTML = html;
  }

  function showErrorState(message) {
    dom.resultsHeader.classList.add('hidden');
    dom.articlesContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <div class="empty-title">Generation Failed</div>
        <div class="empty-subtitle">${escapeHtml(message)}</div>
      </div>`;
  }

  function formatBody(body) {
    if (!body) return '';
    return body.split('\n').filter(p => p.trim()).map(p => `<p>${escapeHtml(p)}</p>`).join('');
  }

  // ─── Article Actions ───
  function toggleBody(id) {
    const bodyEl = document.getElementById(`body-${id}`);
    const toggleText = document.getElementById(`toggle-text-${id}`);
    if (bodyEl) {
      bodyEl.classList.toggle('expanded');
      toggleText.textContent = bodyEl.classList.contains('expanded') ? 'Collapse' : 'Read Full Article';
    }
  }

  function copyArticle(id) {
    const article = findArticleById(id);
    if (!article) return;

    const text = `${article.headline}\n\n${article.summary}\n\n${article.body}\n\nSource: ${article.source}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Article copied to clipboard', 'success');
      // Visual feedback
      const btn = document.querySelector(`[data-id="${id}"] .article-btn:nth-child(2)`);
      if (btn) {
        btn.classList.add('copied');
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = '📋 Copy';
        }, 2000);
      }
    }).catch(() => {
      showToast('Failed to copy. Please try again.', 'error');
    });
  }

  function shareArticle(id) {
    const article = findArticleById(id);
    if (!article) return;

    const text = `${article.headline}\n\n${article.summary}\n\nGenerated by Black News AI`;

    if (navigator.share) {
      navigator.share({
        title: article.headline,
        text: text,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        showToast('🔗 Article text copied for sharing', 'success');
      });
    }
  }

  function findArticleById(id) {
    return state.articles.find(a => a.id === id) ||
           state.history.find(a => a.id === id);
  }

  // ─── History ───
  function setupHistory() {
    dom.historyToggle.addEventListener('click', openHistory);
    dom.closeHistory.addEventListener('click', closeHistory);
    dom.historyOverlay.addEventListener('click', closeHistory);
    dom.clearHistoryBtn.addEventListener('click', () => {
      if (confirm('Clear all article history?')) {
        state.history = [];
        saveHistory();
        renderHistory();
        updateHistoryBadge();
        showToast('History cleared', 'info');
      }
    });

    updateHistoryBadge();
  }

  function openHistory() {
    renderHistory();
    dom.historyOverlay.classList.add('active');
    dom.historyPanel.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeHistory() {
    dom.historyOverlay.classList.remove('active');
    dom.historyPanel.classList.remove('active');
    document.body.style.overflow = '';
  }

  function renderHistory() {
    if (state.history.length === 0) {
      dom.historyEmpty.classList.remove('hidden');
      dom.historyBody.innerHTML = '<div class="history-empty">No saved articles yet.</div>';
      return;
    }

    let html = '';
    state.history.forEach(article => {
      const date = new Date(article.savedAt || article.generatedAt).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });

      const badgeClass = CATEGORIES.includes(article.category)
        ? `badge-${article.category}`
        : 'badge-custom';

      html += `
        <div class="history-item" onclick="BlackNews.viewHistoryArticle('${article.id}')">
          <div class="history-item-title">${escapeHtml(article.headline)}</div>
          <div class="history-item-meta">
            <span class="article-category-badge ${badgeClass}" style="font-size:0.65rem; padding:2px 8px;">${escapeHtml(article.category)}</span>
            <span>${date}</span>
          </div>
        </div>`;
    });
    dom.historyBody.innerHTML = html;
  }

  function viewHistoryArticle(id) {
    const article = state.history.find(a => a.id === id);
    if (article) {
      state.articles = [article];
      renderArticles([article]);
      closeHistory();
      // Scroll to results
      dom.articlesContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  function updateHistoryBadge() {
    const count = state.history.length;
    if (count > 0) {
      dom.historyBadge.textContent = count > 99 ? '99+' : count;
      dom.historyBadge.classList.remove('hidden');
    } else {
      dom.historyBadge.classList.add('hidden');
    }
  }

  // ─── Toast Notifications ───
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    dom.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

  // ─── Keyboard Shortcuts ───
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to generate
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !state.isGenerating && state.apiKey) {
        e.preventDefault();
        generateArticles();
      }
      // Escape to close history
      if (e.key === 'Escape') {
        closeHistory();
      }
    });
  }

  // ─── Utilities ───
  function generateId() {
    return 'art_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ─── Public API (for inline event handlers) ───
  window.BlackNews = {
    toggleBody,
    copyArticle,
    shareArticle,
    viewHistoryArticle,
  };

  // ─── Start ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
