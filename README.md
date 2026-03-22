# ⚡ Black News — AI-Powered News Generator

> Generate professional, AI-written news articles on any topic instantly. Supports **multiple AI providers** — use your favorite.

![Black News](https://img.shields.io/badge/Black_News-AI_Powered-6c5ce7?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-3b82f6?style=for-the-badge)

---

## 🤖 Supported AI Providers

| Provider | Model | Free Tier | Get API Key |
|---|---|---|---|
| **Google Gemini** | gemini-2.0-flash | ✅ Yes | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **OpenAI** | gpt-4o-mini | ❌ Paid | [platform.openai.com](https://platform.openai.com/api-keys) |
| **OpenRouter** | gemini-2.0-flash (free) | ✅ Yes | [openrouter.ai](https://openrouter.ai/keys) |
| **Cohere** | command-r-plus | ✅ Trial | [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) |
| **Mistral** | mistral-small-latest | ✅ Free tier | [console.mistral.ai](https://console.mistral.ai/api-keys) |

> 💡 **Recommended:** Google Gemini or OpenRouter — both offer free API keys.

---

## ✨ Features

| Feature | Details |
|---|---|
| 🤖 **Multi-Provider AI** | Switch between Gemini, OpenAI, OpenRouter, Cohere, and Mistral |
| 📂 **8 News Categories** | Technology, Business, Science, Health, Sports, Entertainment, Politics, World |
| ✏️ **Custom Topics** | Enter any topic and get tailored articles |
| 📰 **Multi-Article Generation** | Generate 1–5 articles at once |
| 📋 **Article History** | All generated articles saved locally |
| 🌗 **Dark & Light Theme** | Beautiful dark mode by default with light mode toggle |
| 📱 **Fully Responsive** | Desktop, tablet, and mobile |
| 🔒 **Privacy First** | API keys stored only in your browser — never shared |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+Enter` to generate, `Esc` to close panels |
| 📤 **Share & Copy** | One-click copy or share articles |
| 🔑 **Per-Provider Keys** | Save different keys for each provider |

---

## 🚀 Quick Start

### 1. Get a Free API Key
Pick any provider from the table above. **Recommended:** [Google Gemini](https://aistudio.google.com/apikey) (free).

### 2. Use Black News
- Open the app: **[Live Demo →](https://yourusername.github.io/Black_News/)**
- Select your AI provider (Gemini, OpenAI, etc.)
- Paste your API key → click **Save Key**
- Pick a news category or type a custom topic
- Hit **⚡ Generate News**

That's it! Articles appear instantly.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic structure |
| **CSS3** | Custom properties, glassmorphism, dark/light theming, animations |
| **Vanilla JavaScript** | All logic — zero dependencies, zero frameworks |
| **Multiple AI APIs** | Gemini, OpenAI, OpenRouter, Cohere, Mistral |
| **localStorage** | Client-side persistence for keys, theme, history |

**Zero dependencies. No build step. Just open and use.**

---

## 📂 Project Structure

```
Black_News/
├── index.html    # Single-page app
├── style.css     # Design system & styles
├── app.js        # Multi-provider AI logic
└── README.md     # This file
```

---

## 🔒 Privacy & Security

- API keys are stored **only** in your browser's `localStorage`
- Keys are sent **only** to their respective AI provider's API
- No analytics, no tracking, no cookies
- Fully open-source — inspect the code yourself

---

## 🏗️ Deploy Your Own

### GitHub Pages

1. **Fork** this repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from a branch** → `main` → `/ (root)`
4. Your site will be live at `https://yourusername.github.io/Black_News/`

### Local Development

```bash
# Clone the repo
git clone https://github.com/yourusername/Black_News.git

# Open directly (no build step needed)
open index.html
# or use any local server:
npx serve .
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Generate articles |
| `Escape` | Close history panel |

---

## 📝 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

<p align="center">
  Made with ❤️ · Supports Gemini, OpenAI, OpenRouter, Cohere & Mistral
</p>
