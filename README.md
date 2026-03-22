# ⚡ Black News — AI-Powered News Generator

> Generate professional, AI-written news articles on any topic instantly. Powered by **Google Gemini AI**.

![Black News](https://img.shields.io/badge/Black_News-AI_Powered-6c5ce7?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-10b981?style=for-the-badge)
![Status](https://img.shields.io/badge/Status-Live-3b82f6?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🤖 **AI Article Generation** | Generate realistic, professional news articles using Google Gemini |
| 📂 **8 News Categories** | Technology, Business, Science, Health, Sports, Entertainment, Politics, World |
| ✏️ **Custom Topics** | Enter any topic and get tailored articles |
| 📰 **Multi-Article Generation** | Generate 1–5 articles at once |
| 📋 **Article History** | All generated articles are saved locally |
| 🌗 **Dark & Light Theme** | Beautiful dark mode by default with a light mode toggle |
| 📱 **Fully Responsive** | Works on desktop, tablet, and mobile |
| 🔒 **Privacy First** | API key stored only in your browser — never sent to any third party |
| ⌨️ **Keyboard Shortcuts** | `Ctrl+Enter` to generate, `Esc` to close panels |
| 📤 **Share & Copy** | Easily copy or share generated articles |

---

## 🚀 Quick Start

### 1. Get a Free API Key
- Visit [Google AI Studio](https://aistudio.google.com/apikey)
- Sign in with your Google account
- Click **"Create API Key"**
- Copy the key

### 2. Use Black News
- Open the app: **[Live Demo →](https://yourusername.github.io/Black_News/)**
- Paste your API key in the configuration section
- Click **Save Key**
- Pick a category or type a custom topic
- Hit **⚡ Generate News**

That's it! Your articles will appear instantly.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **HTML5** | Semantic page structure |
| **CSS3** | Custom properties, glassmorphism, dark/light theming, animations |
| **Vanilla JavaScript** | All logic — no frameworks, no dependencies |
| **Google Gemini API** | AI-powered article generation |
| **localStorage** | Client-side persistence for API key, theme, and history |

**Zero dependencies. No build step. Just open and use.**

---

## 📂 Project Structure

```
Black_News/
├── index.html    # Single-page app
├── style.css     # Design system & styles
├── app.js        # Application logic & API integration
└── README.md     # This file
```

---

## 🔒 Privacy & Security

- Your API key is stored **only** in your browser's `localStorage`
- It is **never** sent to any server other than Google's Gemini API
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
  Made with ❤️ and Google Gemini AI
</p>
