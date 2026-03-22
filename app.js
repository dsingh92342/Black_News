/* ============================================
   BLACK NEWS – App Logic & Multi-Provider AI
   Supports: Gemini, OpenAI, OpenRouter, Cohere, Mistral
   ============================================ */

(function () {
  'use strict';

  // ─── Provider Configurations ───
  const PROVIDERS = {
    gemini: {
      name: 'Google Gemini',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      helpUrl: 'https://aistudio.google.com/apikey',
      helpText: 'aistudio.google.com',
      placeholder: 'Paste your Gemini API key here...',
      authType: 'query', // key goes in ?key= query param
    },
    openai: {
      name: 'OpenAI',
      url: 'https://api.openai.com/v1/chat/completions',
      helpUrl: 'https://platform.openai.com/api-keys',
      helpText: 'platform.openai.com',
      placeholder: 'Paste your OpenAI API key (sk-...)...',
      authType: 'bearer',
      model: 'gpt-4o-mini',
    },
    openrouter: {
      name: 'OpenRouter',
      url: 'https://openrouter.ai/api/v1/chat/completions',
      helpUrl: 'https://openrouter.ai/keys',
      helpText: 'openrouter.ai',
      placeholder: 'Paste your OpenRouter API key (sk-or-...)...',
      authType: 'bearer',
      model: 'google/gemini-2.0-flash-exp:free',
    },
    cohere: {
      name: 'Cohere',
      url: 'https://api.cohere.com/v2/chat',
      helpUrl: 'https://dashboard.cohere.com/api-keys',
      helpText: 'dashboard.cohere.com',
      placeholder: 'Paste your Cohere API key here...',
      authType: 'bearer',
      model: 'command-r-plus',
    },
    mistral: {
      name: 'Mistral',
      url: 'https://api.mistral.ai/v1/chat/completions',
      helpUrl: 'https://console.mistral.ai/api-keys',
      helpText: 'console.mistral.ai',
      placeholder: 'Paste your Mistral API key here...',
      authType: 'bearer',
      model: 'mistral-small-latest',
    },
  };

  const STORAGE_KEYS = {
    provider: 'blacknews_provider',
    apiKeys: 'blacknews_api_keys', // stores keys per provider
    theme: 'blacknews_theme',
    history: 'blacknews_history',
  };

  const CATEGORIES = [
    'technology', 'business', 'science', 'health',
    'sports', 'entertainment', 'politics', 'world'
  ];

  // ─── State ───
  let state = {
    provider: 'gemini',
    apiKeys: {}, // { gemini: 'key', openai: 'key', ... }
    selectedCategory: 'technology',
    selectedTone: 'Serious',
    selectedLength: 'Medium',
    customTopic: '',
    articleCount: 3,
    isGenerating: false,
    speakingArticleId: null,
    articles: [],
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
    providerChips: $('#providerChips'),
    apiHelp: $('#apiHelp'),
    apiHelpLink: $('#apiHelpLink'),

    // Generator
    categories: $('#categories'),
    topicInput: $('#topicInput'),
    toneSelector: $('#toneSelector'),
    lengthSelector: $('#lengthSelector'),
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
    setupProviderSelector();
    setupAPISection();
    setupCategories();
    setupTopicInput();
    setupToneSelector();
    setupLengthSelector();
    setupCountSelector();
    setupGenerateButton();
    setupHistory();
    setupKeyboardShortcuts();
    registerServiceWorker();
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
          .then(reg => console.log('SW Registered', reg))
          .catch(err => console.log('SW Registration failed', err));
      });
    }
  }

  // ─── State Persistence ───
  function loadState() {
    state.provider = localStorage.getItem(STORAGE_KEYS.provider) || 'gemini';
    state.apiKeys = JSON.parse(localStorage.getItem(STORAGE_KEYS.apiKeys) || '{}');
    state.history = JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || '[]');
  }

  function saveApiKey(provider, key) {
    state.apiKeys[provider] = key;
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(state.apiKeys));
  }

  function removeApiKey(provider) {
    delete state.apiKeys[provider];
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(state.apiKeys));
  }

  function saveProvider(provider) {
    state.provider = provider;
    localStorage.setItem(STORAGE_KEYS.provider, provider);
  }

  function getCurrentKey() {
    return state.apiKeys[state.provider] || '';
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

  // ─── Provider Selector ───
  function setupProviderSelector() {
    // Set active chip from saved provider
    $$('.provider-chip').forEach(chip => {
      chip.classList.toggle('active', chip.dataset.provider === state.provider);
    });

    // Update UI for current provider
    updateProviderUI();

    dom.providerChips.addEventListener('click', (e) => {
      const chip = e.target.closest('.provider-chip');
      if (!chip) return;

      const provider = chip.dataset.provider;
      $$('.provider-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      saveProvider(provider);
      updateProviderUI();

      // Load saved key for this provider into input
      dom.apiKeyInput.value = getCurrentKey();
      updateAPIStatus(!!getCurrentKey());
    });
  }

  function updateProviderUI() {
    const config = PROVIDERS[state.provider];
    dom.apiKeyInput.placeholder = config.placeholder;
    dom.apiHelpLink.href = config.helpUrl;
    dom.apiHelpLink.textContent = config.helpText;
  }

  // ─── API Key Section ───
  function setupAPISection() {
    // Toggle visibility
    dom.toggleKeyVisibility.addEventListener('click', () => {
      const input = dom.apiKeyInput;
      input.type = input.type === 'password' ? 'text' : 'password';
      dom.toggleKeyVisibility.textContent = input.type === 'password' ? '👁️' : '🙈';
    });

    // Key input detection
    dom.apiKeyInput.addEventListener('input', (e) => {
      const hasKey = e.target.value.trim().length > 0;
      dom.generateBtn.disabled = !hasKey;
    });

    // Save key
    dom.saveKeyBtn.addEventListener('click', () => {
      const key = dom.apiKeyInput.value.trim();
      if (!key) {
        showToast('Please enter an API key', 'error');
        dom.apiKeyInput.focus();
        return;
      }
      saveApiKey(state.provider, key);
      updateAPIStatus(true);
      const providerName = PROVIDERS[state.provider].name;
      showToast(`✅ ${providerName} API key saved`, 'success');
      dom.generateBtn.disabled = false; // Ensure enabled
      // Collapse after short delay
      setTimeout(() => {
        dom.apiBody.classList.add('collapsed');
      }, 600);
    });

    // Remove key
    dom.removeKeyBtn.addEventListener('click', () => {
      removeApiKey(state.provider);
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
    const currentKey = getCurrentKey();
    if (currentKey) {
      dom.apiKeyInput.value = currentKey;
      updateAPIStatus(true);
      dom.generateBtn.disabled = false;
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
      const chip = e.target.closest('.pill-chip');
      if (!chip) return;

      $$('#categories .pill-chip').forEach(c => c.classList.remove('active'));
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
        $$('#categories .pill-chip').forEach(c => c.classList.remove('active'));
      }
    });

    dom.topicInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !state.isGenerating && getCurrentKey()) {
        generateArticles();
      }
    });
  }

  // ─── Tone Selector ───
  function setupToneSelector() {
    dom.toneSelector.addEventListener('click', (e) => {
      const chip = e.target.closest('.pill-chip');
      if (!chip) return;

      $$('#toneSelector .pill-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedTone = chip.dataset.tone;
    });
  }

  // ─── Length Selector ───
  function setupLengthSelector() {
    dom.lengthSelector.addEventListener('click', (e) => {
      const chip = e.target.closest('.pill-chip');
      if (!chip) return;

      $$('#lengthSelector .pill-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedLength = chip.dataset.length;
    });
  }

  // ─── Generate ───
  function setupGenerateButton() {
    dom.generateBtn.addEventListener('click', () => {
      if (!state.isGenerating) generateArticles();
    });
  }

  async function generateArticles() {
    let apiKey = getCurrentKey();
    const inputKey = dom.apiKeyInput.value.trim();

    // If input has a key but state doesn't, auto-save and use it
    if (inputKey && inputKey !== apiKey) {
      apiKey = inputKey;
      saveApiKey(state.provider, inputKey);
      updateAPIStatus(true);
    }

    if (!apiKey) {
      showToast('Please enter an API key first', 'error');
      dom.apiBody.classList.remove('collapsed');
      dom.apiKeyInput.focus();
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
      const articles = await callAI(state.provider, apiKey, topic, state.articleCount);
      state.articles = articles;
      renderArticles(articles);

      // Save to history
      articles.forEach(article => {
        state.history.unshift({
          ...article,
          savedAt: new Date().toISOString(),
          provider: state.provider,
          tone: state.selectedTone,
          length: state.selectedLength
        });
      });
      // Keep max 50 in history
      if (state.history.length > 50) {
        state.history = state.history.slice(0, 50);
      }
      saveHistory();
      updateHistoryBadge();

      showToast(`✅ Generated ${articles.length} article${articles.length > 1 ? 's' : ''} via ${PROVIDERS[state.provider].name}`, 'success');
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

  // ─── Multi-Provider AI Calls ───
  async function callAI(provider, apiKey, topic, count) {
    const prompt = buildPrompt(topic, count);
    const config = PROVIDERS[provider];

    let response;

    if (provider === 'gemini') {
      response = await callGemini(config, apiKey, prompt);
    } else if (provider === 'cohere') {
      response = await callCohere(config, apiKey, prompt);
    } else {
      // OpenAI-compatible: openai, openrouter, mistral
      response = await callOpenAICompatible(config, apiKey, prompt);
    }

    return response;
  }

  // --- Gemini ---
  async function callGemini(config, apiKey, prompt) {
    const response = await fetch(`${config.url}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.9,
          topP: 0.95,
          maxOutputTokens: 8192,
        }
      })
    });

    await handleHTTPError(response);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No content received from Gemini. Please try again.');
    return parseArticles(text);
  }

  // --- OpenAI-compatible (OpenAI, OpenRouter, Mistral) ---
  async function callOpenAICompatible(config, apiKey, prompt) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    };
    // OpenRouter recommends these headers
    if (config === PROVIDERS.openrouter) {
      headers['HTTP-Referer'] = window.location.href;
      headers['X-Title'] = 'Black News';
    }

    const response = await fetch(config.url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a professional news journalist. Always respond with valid JSON only, no markdown or extra text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 8192,
      })
    });

    await handleHTTPError(response);
    const data = await response.json();
    const text = data?.choices?.[0]?.message?.content;
    if (!text) throw new Error(`No content received from ${config.name}. Please try again.`);
    return parseArticles(text);
  }

  // --- Cohere ---
  async function callCohere(config, apiKey, prompt) {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: 'system', content: 'You are a professional news journalist. Always respond with valid JSON only, no markdown or extra text.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 8192,
      })
    });

    await handleHTTPError(response);
    const data = await response.json();
    const text = data?.message?.content?.[0]?.text;
    if (!text) throw new Error('No content received from Cohere. Please try again.');
    return parseArticles(text);
  }

  // --- Error Handling ---
  async function handleHTTPError(response) {
    if (!response.ok) {
      // Use clone to avoid 'body stream already read' if handled elsewhere
      const clone = response.clone();
      const errData = await clone.json().catch(() => ({}));
      if (response.status === 400 || response.status === 401) {
        throw new Error('Invalid API key. Please check your key and try again.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else if (response.status === 403) {
        throw new Error('API key does not have permission. Check your API dashboard.');
      }
      const msg = errData?.error?.message || errData?.message || `API request failed (${response.status})`;
      throw new Error(msg);
    }
  }

  // ─── Prompt Builder ───
  function buildPrompt(topic, count) {
    const isCategory = CATEGORIES.includes(topic.toLowerCase());
    const topicLabel = isCategory
      ? `the "${topic}" category`
      : `the topic: "${topic}"`;

    const lengthDesc = {
      'Short': '1-2 concise paragraphs',
      'Medium': '3-4 professional paragraphs',
      'Long': 'a comprehensive deep-dive with 5-6 informative paragraphs'
    }[state.selectedLength] || '3-4 professional paragraphs';

    return `You are a professional news journalist. Generate exactly ${count} unique, realistic, and well-written news article${count > 1 ? 's' : ''} about ${topicLabel}.

Use a **${state.selectedTone}** tone for all articles.

For EACH article, output in this exact JSON format (output only a valid JSON array, no other text):

[
  {
    "headline": "A compelling, journalistic headline reflecting the ${state.selectedTone} tone",
    "summary": "A 1-2 sentence summary of the article",
    "body": "A well-written article body with approximately ${lengthDesc}. Use a ${state.selectedTone} journalistic tone. Include quotes from fictional but realistic sources. Make it feel like a real news article from a major publication.",
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

  // ─── Article Parser ───
  function parseArticles(text) {
    let cleaned = text.trim();
    // Remove markdown code fences if present
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    cleaned = cleaned.trim();

    try {
      const articles = JSON.parse(cleaned);
      if (Array.isArray(articles) && articles.length > 0) {
        return articles.map(normalizeArticle);
      }
    } catch (e) {
      // Try to extract JSON array from text
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        try {
          const articles = JSON.parse(jsonMatch[0]);
          if (Array.isArray(articles)) {
            return articles.map(normalizeArticle);
          }
        } catch (e2) { /* fall through */ }
      }
    }

    // Fallback: wrap raw text into single article
    return [{
      headline: 'Generated News',
      summary: cleaned.substring(0, 200),
      body: cleaned,
      source: 'AI News Service',
      category: 'custom',
      readingTime: Math.ceil(cleaned.split(/\s+/).length / 200),
      id: generateId(),
      generatedAt: new Date().toISOString(),
    }];
  }

  function normalizeArticle(a) {
    return {
      headline: a.headline || 'Untitled Article',
      summary: a.summary || '',
      body: a.body || '',
      source: a.source || 'AI News Service',
      category: a.category || 'custom',
      readingTime: a.readingTime || 3,
      id: generateId(),
      generatedAt: new Date().toISOString(),
    };
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
        <article class="card article-card" style="animation-delay: ${index * 0.15}s" data-id="${article.id}">
          <div class="article-meta" style="display:flex; gap:12px; margin-bottom:20px; font-size:0.8rem; color:var(--text-muted); font-weight:700;">
            <span class="article-category-badge ${badgeClass}" style="padding:4px 12px; border-radius:100px; color:var(--text-main); background:var(--bg-glass-heavy);">${escapeHtml(article.category).toUpperCase()}</span>
            <span>⏱️ ${article.readingTime} MIN READ</span>
          </div>
          <h2 class="article-headline" style="font-family:var(--font-display); font-size:1.8rem; line-height:1.2; margin-bottom:16px;">${escapeHtml(article.headline)}</h2>
          <p class="article-summary" style="color:var(--text-dim); margin-bottom:24px;">${escapeHtml(article.summary)}</p>
          <div class="article-body" id="body-${article.id}" style="display:none; border-top:1px solid var(--border-glass); padding-top:20px; margin-top:20px;">
            ${formatBody(article.body)}
          </div>
          <div class="article-actions" style="display:flex; gap:10px; margin-top:24px; flex-wrap:wrap;">
            <button class="action-btn" onclick="BlackNews.toggleBody('${article.id}')">
              📖 <span id="toggle-text-${article.id}">Full Article</span>
            </button>
            <button class="action-btn" id="listen-btn-${article.id}" onclick="BlackNews.speakArticle('${article.id}')">
              🔊 Listen
            </button>
            <div class="article-translate-group" style="display:flex; align-items:center; gap:4px;">
              <button class="action-btn" id="translate-btn-${article.id}" onclick="BlackNews.translateArticle('${article.id}')">
                🌐 Translate
              </button>
              <select class="lang-select" id="lang-select-${article.id}" style="padding:8px; border-radius:8px; background:var(--bg-glass); color:var(--text-dim); border:1px solid var(--border-glass); font-size:0.75rem;">
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
            <button class="action-btn" onclick="BlackNews.copyArticle('${article.id}')">📋 Copy</button>
            <button class="action-btn" onclick="BlackNews.shareArticle('${article.id}')">🔗 Share</button>
          </div>
          <div style="margin-top:20px; font-size:0.75rem; color:var(--text-muted); font-weight:600;">
            SOURCE: ${escapeHtml(article.source).toUpperCase()} · ${date}
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
      const isExpanded = bodyEl.classList.toggle('expanded');
      toggleText.textContent = isExpanded ? 'Collapse' : 'Full Article';
      bodyEl.style.display = isExpanded ? 'block' : 'none';
    }
  }

  function copyArticle(id) {
    const article = findArticleById(id);
    if (!article) return;

    const text = `${article.headline}\n\n${article.summary}\n\n${article.body}\n\nSource: ${article.source}`;
    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 Article copied to clipboard', 'success');
      const btn = document.querySelector(`[data-id="${id}"] .action-btn:nth-child(4)`);
      if (btn) {
        btn.classList.add('copied');
        const oldText = btn.innerHTML;
        btn.innerHTML = '✅ Copied!';
        setTimeout(() => {
          btn.classList.remove('copied');
          btn.innerHTML = oldText;
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
      }).catch(() => { });
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

  // ─── Voice Narration (TTS) ───
  function speakArticle(id) {
    // If already speaking this article, stop it
    if (state.speakingArticleId === id) {
      stopSpeaking();
      return;
    }

    // Stop any current speech
    stopSpeaking();

    const article = findArticleById(id);
    if (!article) return;

    const textToSpeak = `${article.headline}. Published by ${article.source}. ${article.summary}. ${article.body}`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    utterance.onstart = () => {
      state.speakingArticleId = id;
      const btn = document.getElementById(`listen-btn-${id}`);
      if (btn) {
        btn.innerHTML = '🛑 Stop';
        btn.classList.add('speaking');
      }
    };

    utterance.onend = () => {
      state.speakingArticleId = null;
      const btn = document.getElementById(`listen-btn-${id}`);
      if (btn) {
        btn.innerHTML = '🔊 Listen';
        btn.classList.remove('speaking');
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      state.speakingArticleId = null;
      const btn = document.getElementById(`listen-btn-${id}`);
      if (btn) {
        btn.innerHTML = '🔊 Listen';
        btn.classList.remove('speaking');
      }
      showToast('Speech synthesis failed', 'error');
    };

    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel();
    if (state.speakingArticleId) {
      const btn = document.getElementById(`listen-btn-${state.speakingArticleId}`);
      if (btn) {
        btn.innerHTML = '🔊 Listen';
        btn.classList.remove('speaking');
      }
      state.speakingArticleId = null;
    }
  }

  // ─── Instant Translation ───
  async function translateArticle(id) {
    const article = findArticleById(id);
    const langSelect = document.getElementById(`lang-select-${id}`);
    const targetLang = langSelect ? langSelect.value : 'Hindi';
    const btn = document.getElementById(`translate-btn-${id}`);

    if (!article || !getCurrentKey() || state.isGenerating) return;

    btn.disabled = true;
    btn.innerHTML = `🌐 Translating...`;
    
    const prompt = `Translate the following news article into ${targetLang}. 
Keep the SAME JSON structure. Do not change the headline context, just translate the text.
Output ONLY the valid JSON object for this single article.

${JSON.stringify({
      headline: article.headline,
      summary: article.summary,
      body: article.body,
      source: article.source,
      category: article.category,
      readingTime: article.readingTime
    })}`;

    try {
      const response = await callAI(state.provider, getCurrentKey(), prompt, 1);
      const translated = response[0];
      
      if (translated) {
        // Update the UI directly
        const card = document.querySelector(`[data-id="${id}"]`);
        if (card) {
          card.querySelector('.article-headline').textContent = translated.headline;
          card.querySelector('.article-summary').textContent = translated.summary;
          card.querySelector('.article-body').innerHTML = formatBody(translated.body);
          card.querySelector('.article-source').textContent = `SOURCE: ${translated.source.toUpperCase()} (TRANSLATED)`;
          showToast(`✅ Translated to ${targetLang}`, 'success');
        }
      }
    } catch (err) {
      console.error('Translation error:', err);
      showToast(`❌ Translation failed: ${err.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `🌐 Translate`;
    }
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

      const providerLabel = article.provider ? ` · ${PROVIDERS[article.provider]?.name || article.provider}` : '';

      html += `
        <div class="history-item" onclick="BlackNews.viewHistoryArticle('${article.id}')">
          <div class="history-item-title">${escapeHtml(article.headline)}</div>
          <div class="history-item-meta">
            <span class="article-category-badge ${badgeClass}" style="font-size:0.65rem; padding:2px 8px;">${escapeHtml(article.category)}</span>
            <span>${date}${providerLabel}</span>
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
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !state.isGenerating && getCurrentKey()) {
        e.preventDefault();
        generateArticles();
      }
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

  // ─── Public API ───
  window.BlackNews = {
    toggleBody,
    copyArticle,
    shareArticle,
    viewHistoryArticle,
    speakArticle,
    stopSpeaking,
    translateArticle,
  };

  // ─── Start ───
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
