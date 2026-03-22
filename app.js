(function() {
  'use strict';

  // ─── Configuration ───
  const STORAGE_KEYS = {
    apiKeys: 'blacknews_api_keys',
    theme: 'blacknews_theme',
    history: 'blacknews_history',
  };

  const PROVIDERS = {
    gemini: { 
      name: 'Google Gemini', 
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
      link: 'https://aistudio.google.com/apikey'
    },
    openai: { 
      name: 'OpenAI', 
      url: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-4o-mini',
      link: 'https://platform.openai.com/api-keys'
    },
    openrouter: { 
      name: 'OpenRouter', 
      url: 'https://openrouter.ai/api/v1/chat/completions',
      model: 'google/gemini-2.0-flash-001',
      link: 'https://openrouter.ai/keys'
    },
    cohere: { 
      name: 'Cohere', 
      url: 'https://api.cohere.com/v2/chat',
      model: 'command-r-plus',
      link: 'https://dashboard.cohere.com/api-keys'
    },
    mistral: { 
      name: 'Mistral', 
      url: 'https://api.mistral.ai/v1/chat/completions',
      model: 'mistral-small-latest',
      link: 'https://console.mistral.ai/api-keys'
    }
  };

  const CATEGORIES = ['all', 'technology', 'business', 'science', 'health', 'sports', 'entertainment', 'politics', 'world'];

  // ─── State ───
  let state = {
    provider: 'gemini',
    apiKeys: {},
    selectedCategory: 'all',
    customTopic: '',
    selectedTone: 'Serious',
    selectedLength: 'Medium',
    articleCount: 3,
    articles: [],
    history: [],
    isGenerating: false,
    speakingArticleId: null
  };

  // ─── Selectors ───
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  const dom = {
    themeToggle: $('#themeToggle'),
    historyToggle: $('#historyToggle'),
    historyBadge: $('#historyBadge'),
    providerSelector: $('#providerSelector'),
    apiKeyInput: $('#apiKeyInput'),
    saveKeyBtn: $('#saveKeyBtn'),
    toggleKeyVisibility: $('#toggleKeyVisibility'),
    apiBody: $('#apiBody'),
    apiStatus: $('#apiStatus'),
    apiStatusText: $('#apiStatusText'),
    apiKeyLink: $('#apiKeyLink'),
    categories: $('#categories'),
    topicInput: $('#topicInput'),
    toneSelector: $('#toneSelector'),
    lengthSelector: $('#lengthSelector'),
    countSelector: $('#countSelector'),
    generateBtn: $('#generateBtn'),
    articlesContainer: $('#articlesContainer'),
    resultsSection: $('#resultsSection'),
    resultsHeader: $('#resultsHeader'),
    resultsCount: $('#resultsCount'),
    emptyState: $('#emptyState'),
    historyPanel: $('#historyPanel'),
    historyOverlay: $('#historyOverlay'),
    closeHistory: $('#closeHistory'),
    historyBody: $('#historyBody'),
    clearHistoryBtn: $('#clearHistoryBtn'),
    toastContainer: $('#toastContainer')
  };

  // ─── Initialization ───
  function init() {
    loadState();
    setupTheme();
    setupAPISection();
    setupCategoryChips();
    setupTopicInput();
    setupToneSelector();
    setupLengthSelector();
    setupCountSelector();
    setupGenerateButton();
    setupHistory();
    setupKeyboardShortcuts();
    registerServiceWorker();
  }

  function loadState() {
    try {
      const savedKeys = localStorage.getItem(STORAGE_KEYS.apiKeys);
      if (savedKeys) state.apiKeys = JSON.parse(savedKeys);

      const savedHistory = localStorage.getItem(STORAGE_KEYS.history);
      if (savedHistory) state.history = JSON.parse(savedHistory);

      const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
      if (savedTheme) document.body.className = savedTheme;
    } catch (e) {
      console.warn('Could not load saved state:', e);
    }
  }

  // ─── Theme ───
  function setupTheme() {
    dom.themeToggle.addEventListener('click', () => {
      const isDark = document.body.classList.toggle('dark');
      localStorage.setItem(STORAGE_KEYS.theme, isDark ? 'dark' : 'light');
      showToast(isDark ? '🌙 Dark Mode' : '☀️ Light Mode', 'info');
    });
  }

  // ─── API Section ───
  function setupAPISection() {
    dom.providerSelector.addEventListener('click', (e) => {
      const chip = e.target.closest('.provider-chip');
      if (!chip) return;

      $$('.provider-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.provider = chip.dataset.provider;

      const config = PROVIDERS[state.provider];
      dom.apiKeyLink.href = config.link;
      dom.apiKeyLink.textContent = new URL(config.link).hostname;
      dom.apiKeyInput.placeholder = `Paste your ${config.name} API key here...`;
      
      const key = state.apiKeys[state.provider] || '';
      dom.apiKeyInput.value = key;
      updateAPIStatus(!!key);
      
      if (key) {
        dom.apiBody.classList.add('collapsed');
      } else {
        dom.apiBody.classList.remove('collapsed');
      }
    });

    dom.toggleKeyVisibility.addEventListener('click', () => {
      const type = dom.apiKeyInput.type === 'password' ? 'text' : 'password';
      dom.apiKeyInput.type = type;
      dom.toggleKeyVisibility.textContent = type === 'password' ? '👁️' : '🙈';
    });

    dom.apiKeyInput.addEventListener('input', (e) => {
      const hasKey = e.target.value.trim().length > 0;
      dom.generateBtn.disabled = !hasKey;
    });

    dom.saveKeyBtn.addEventListener('click', () => {
      const key = dom.apiKeyInput.value.trim();
      if (key) {
        saveApiKey(state.provider, key);
        showToast('🔑 API Key Saved Securely', 'success');
        dom.apiBody.classList.add('collapsed');
      } else {
        showToast('Please enter a key first', 'warning');
      }
    });

    // Restore initial state
    const currentKey = state.apiKeys[state.provider];
    if (currentKey) {
      dom.apiKeyInput.value = currentKey;
      updateAPIStatus(true);
      dom.generateBtn.disabled = false;
      dom.apiBody.classList.add('collapsed');
    }
  }

  function saveApiKey(provider, key) {
    state.apiKeys[provider] = key;
    localStorage.setItem(STORAGE_KEYS.apiKeys, JSON.stringify(state.apiKeys));
    updateAPIStatus(true);
  }

  function updateAPIStatus(connected) {
    if (connected) {
      dom.apiStatus.className = 'api-status connected';
      dom.apiStatusText.textContent = 'Connected';
      dom.generateBtn.disabled = false;
    } else {
      dom.apiStatus.className = 'api-status disconnected';
      dom.apiStatusText.textContent = 'Ready to connect';
    }
  }

  function getCurrentKey() {
    return state.apiKeys[state.provider] || dom.apiKeyInput.value.trim();
  }

  // ─── Controls ───
  function setupCategoryChips() {
    dom.categories.addEventListener('click', (e) => {
      const chip = e.target.closest('.pill-chip');
      if (!chip) return;

      $$('#categories .pill-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedCategory = chip.dataset.category;
      
      if (state.selectedCategory !== 'all') {
        dom.topicInput.value = '';
        state.customTopic = '';
      }
    });
  }

  function setupTopicInput() {
    dom.topicInput.addEventListener('input', (e) => {
      state.customTopic = e.target.value.trim();
      if (state.customTopic) {
        $$('#categories .pill-chip').forEach(c => c.classList.remove('active'));
      }
    });
  }

  function setupToneSelector() {
    dom.toneSelector.addEventListener('click', (e) => {
      const chip = e.target.closest('.pill-chip');
      if (!chip) return;
      $$('#toneSelector .pill-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedTone = chip.dataset.tone;
    });
  }

  function setupLengthSelector() {
    dom.lengthSelector.addEventListener('click', (e) => {
      const chip = e.target.closest('.pill-chip');
      if (!chip) return;
      $$('#lengthSelector .pill-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.selectedLength = chip.dataset.length;
    });
  }

  function setupCountSelector() {
    dom.countSelector.addEventListener('click', (e) => {
      const btn = e.target.closest('.count-btn');
      if (!btn) return;
      $$('.count-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.articleCount = parseInt(btn.dataset.count);
    });
  }

  function setupGenerateButton() {
    dom.generateBtn.addEventListener('click', () => {
      if (!state.isGenerating) generateArticles();
    });
  }

  // ─── Generation Logic ───
  async function generateArticles() {
    let apiKey = getCurrentKey();
    const inputKey = dom.apiKeyInput.value.trim();

    if (inputKey && inputKey !== state.apiKeys[state.provider]) {
      apiKey = inputKey;
      saveApiKey(state.provider, inputKey);
    }

    if (!apiKey) {
      showToast('Please enter an API key first', 'error');
      dom.apiBody.classList.remove('collapsed');
      dom.apiKeyInput.focus();
      return;
    }

    const topic = state.customTopic || state.selectedCategory;
    
    state.isGenerating = true;
    dom.generateBtn.classList.add('loading');
    dom.generateBtn.disabled = true;
    showSkeletons(state.articleCount);

    try {
      const articles = await callAI(state.provider, apiKey, topic, state.articleCount);
      state.articles = articles;
      renderArticles(articles);
      
      articles.forEach(a => {
        state.history.unshift({ ...a, savedAt: new Date().toISOString(), provider: state.provider });
      });
      state.history = state.history.slice(0, 50);
      saveHistory();

      showToast(`✅ Generated ${articles.length} Artices`, 'success');
    } catch (err) {
      console.error(err);
      showErrorState(err.message);
      showToast(`❌ ${err.message}`, 'error');
    } finally {
      state.isGenerating = false;
      dom.generateBtn.classList.remove('loading');
      dom.generateBtn.disabled = false;
    }
  }

  function showSkeletons(count) {
    dom.emptyState.classList.add('hidden');
    dom.resultsHeader.classList.add('hidden');
    let html = '';
    for (let i = 0; i < count; i++) {
        html += `<div class="card article-card skeleton" style="height:300px; margin-bottom:24px;"></div>`;
    }
    dom.articlesContainer.innerHTML = html;
  }

  async function callAI(provider, apiKey, topic, count) {
    const prompt = buildPrompt(topic, count);
    const config = PROVIDERS[provider];
    
    if (provider === 'gemini') return callGemini(config, apiKey, prompt);
    if (provider === 'cohere') return callCohere(config, apiKey, prompt);
    return callOpenAICompatible(config, apiKey, prompt);
  }

  async function callGemini(config, apiKey, prompt) {
    const response = await fetch(`${config.url}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });
    await handleHTTPError(response);
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No content from Gemini');
    return parseArticles(text);
  }

  async function callOpenAICompatible(config, apiKey, prompt) {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: config.model,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.9
      })
    });
    await handleHTTPError(response);
    const data = await response.json();
    return parseArticles(data?.choices?.[0]?.message?.content);
  }

  async function callCohere(config, apiKey, prompt) {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ model: config.model, messages: [{ role: 'user', content: prompt }] })
    });
    await handleHTTPError(response);
    const data = await response.json();
    return parseArticles(data?.message?.content?.[0]?.text);
  }

  async function handleHTTPError(response) {
    if (!response.ok) {
      const clone = response.clone();
      const err = await clone.json().catch(() => ({}));
      throw new Error(err?.error?.message || err?.message || `Error ${response.status}`);
    }
  }

  function buildPrompt(topic, count) {
    const tone = state.selectedTone || 'Serious';
    const length = state.selectedLength || 'Medium';
    const topicText = topic === 'all' ? 'various general news topics' : `the category/topic: ${topic}`;

    return `Generate exactly ${count} highly professional news articles about ${topicText}.
    TONE: ${tone}
    LENGTH: ${length}
    FORMAT: JSON array only.
    [{"headline": "...", "summary": "...", "body": "...", "source": "...", "category": "...", "readingTime": number}]`;
  }

  function parseArticles(text) {
    if (!text) throw new Error('Empty response');
    const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
    try {
      const result = JSON.parse(cleaned);
      return Array.isArray(result) ? result : [result];
    } catch (e) {
        const match = cleaned.match(/\[.*\]/s);
        if (match) return JSON.parse(match[0]);
        throw new Error('Failed to parse articles JSON');
    }
  }

  // ─── Rendering ───
  function renderArticles(articles) {
    dom.articlesContainer.innerHTML = '';
    dom.resultsHeader.classList.remove('hidden');
    dom.resultsCount.textContent = `${articles.length} Articles Generated`;

    articles.forEach((article, index) => {
      article.id = article.id || generateId();
      const card = document.createElement('article');
      card.className = 'card article-card';
      card.style.animationDelay = `${index * 0.1}s`;
      card.dataset.id = article.id;
      
      card.innerHTML = `
        <div class="article-meta">
          <span class="badge ${article.category}">${article.category.toUpperCase()}</span>
          <span>⏱️ ${article.readingTime} MIN READ</span>
        </div>
        <h2 class="article-headline">${escapeHtml(article.headline)}</h2>
        <p class="article-summary">${escapeHtml(article.summary)}</p>
        <div class="article-body hidden" id="body-${article.id}">${formatBody(article.body)}</div>
        <div class="article-actions">
          <button class="action-btn" onclick="BlackNews.toggleBody('${article.id}')">📖 Read Full</button>
          <button class="action-btn" onclick="BlackNews.speakArticle('${article.id}')">🔊 Listen</button>
          <button class="action-btn" onclick="BlackNews.copyArticle('${article.id}')">📋 Copy</button>
          <button class="action-btn" onclick="BlackNews.shareArticle('${article.id}')">🔗 Share</button>
        </div>
        <div style="margin-top:20px; font-size:0.75rem; color:var(--text-muted);">SOURCE: ${article.source.toUpperCase()}</div>
      `;
      dom.articlesContainer.appendChild(card);
    });
  }

  function formatBody(text) {
    return text.split('\n').map(p => p.trim() ? `<p>${p}</p>` : '').join('');
  }

  function toggleBody(id) {
    const el = document.getElementById(`body-${id}`);
    if (el) el.classList.toggle('hidden');
  }

  async function speakArticle(id) {
    const article = state.articles.find(a => a.id === id) || state.history.find(a => a.id === id);
    if (!article) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(`${article.headline}. ${article.summary}. ${article.body}`);
    window.speechSynthesis.speak(u);
  }

  function copyArticle(id) {
    const a = state.articles.find(a => a.id === id) || state.history.find(a => a.id === id);
    if (!a) return;
    navigator.clipboard.writeText(`${a.headline}\n\n${a.summary}\n\n${a.body}`);
    showToast('Copied to clipboard', 'success');
  }

  function shareArticle(id) {
    const a = state.articles.find(a => a.id === id) || state.history.find(a => a.id === id);
    if (navigator.share && a) {
      navigator.share({ title: a.headline, text: a.summary });
    }
  }

  // ─── History ───
  function setupHistory() {
    dom.historyToggle.addEventListener('click', () => {
      dom.historyPanel.classList.toggle('active');
      dom.historyOverlay.classList.toggle('active');
      renderHistory();
    });
    dom.closeHistory.addEventListener('click', closeHistory);
    dom.historyOverlay.addEventListener('click', closeHistory);
    dom.clearHistoryBtn.addEventListener('click', () => {
      state.history = [];
      saveHistory();
      renderHistory();
    });
  }

  function closeHistory() {
    dom.historyPanel.classList.remove('active');
    dom.historyOverlay.classList.remove('active');
  }

  function renderHistory() {
    dom.historyBody.innerHTML = state.history.map(a => `
      <div class="history-item" onclick="BlackNews.viewHistoryArticle('${a.id}')">
        <div style="font-weight:600; font-size:0.9rem;">${escapeHtml(a.headline)}</div>
        <div style="font-size:0.7rem; opacity:0.6;">${a.category}</div>
      </div>
    `).join('') || '<p style="text-align:center; opacity:0.5;">No history</p>';
    updateHistoryBadge();
  }

  function viewHistoryArticle(id) {
    const a = state.history.find(a => a.id === id);
    if (a) { renderArticles([a]); closeHistory(); }
  }

  function saveHistory() {
    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(state.history));
  }

  function updateHistoryBadge() {
    dom.historyBadge.textContent = state.history.length;
    dom.historyBadge.classList.toggle('hidden', state.history.length === 0);
  }

  // ─── Misc ───
  function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generateArticles();
    });
  }

  function showToast(msg, type) {
    const t = document.createElement('div');
    t.className = `toast ${type}`;
    t.textContent = msg;
    dom.toastContainer.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
  }

  window.BlackNews = { toggleBody, speakArticle, copyArticle, shareArticle, viewHistoryArticle };

  init();
})();
