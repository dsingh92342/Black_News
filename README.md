# ⚡ Black News — Premium AI News Generator

> Generate professional, AI-written news articles on any topic instantly. Supports **multiple AI providers** with a high-end, glassmorphic UI.

![Black News](https://img.shields.io/badge/Black_News-Premium_Redesign-6c5ce7?style=for-the-badge&logo=google&logoColor=white)
![Status](https://img.shields.io/badge/Status-Premium_V2.0-3b82f6?style=for-the-badge)

---

## 🌟 Premium Features

- 🔊 **Voice Narration**: Listen to any article with a single click.
- 🌐 **Instant Translation**: Translate articles to Hindi, Spanish, French, and German in real-time.
- 📲 **PWA Ready**: Install as a native app on your mobile home screen.
- 🎭 **Narrative Controls**: Set the **Tone** (Serious, Funny, Breaking, Sarcastic) and **Length** (Short, Medium, Long).
- 🧊 **Glassmorphic Design**: Modern, high-end aesthetics with vibrant HSL color palettes and micro-animations.
- 🤖 **Multi-Provider AI**: Switch between Gemini, OpenAI, OpenRouter, Cohere, and Mistral.

---

## 🤖 Supported AI Providers

| Provider | Model | Free Tier | Get API Key |
|---|---|---|---|
| **Google Gemini** | gemini-2.0-flash | ✅ Yes | [aistudio.google.com](https://aistudio.google.com/apikey) |
| **OpenRouter** | gemini-2.0-flash (free) | ✅ Yes | [openrouter.ai](https://openrouter.ai/keys) |
| **Cohere** | command-r-plus | ✅ Trial | [dashboard.cohere.com](https://dashboard.cohere.com/api-keys) |
| **Mistral** | mistral-small-latest | ✅ Free tier | [console.mistral.ai](https://console.mistral.ai/api-keys) |
| **OpenAI** | gpt-4o-mini | ❌ Paid | [platform.openai.com](https://platform.openai.com/api-keys) |

---

## 🚀 1-2-3 Workflow

1.  **Configure Engine**: Select your provider and paste your key. It auto-saves as you type!
2.  **Define Content**: Pick a category or enter a custom topic.
3.  **Style & Generate**: Choose your narrative tone and length, then hit **⚡ Generate Intelligence**.

---

## 🛠️ Tech Stack

- **Vanilla JavaScript**: Zero dependencies, reactive state management.
- **Modern CSS**: Glassmorphism, HSL variables, CSS animations, Flexbox/Grid.
- **Web APIs**: Web Speech API (TTS), Cache API (PWA), Service Workers.
- **Privacy**: All keys are stored locally in `localStorage`.

---

## 📂 Project Structure

```
Black_News/
├── index.html    # Premium 1-2-3 UI structure
├── style.css     # Glassmorphic design system
├── app.js        # Core AI/TTS/Translation logic
├── sw.js         # Service worker for PWA support
└── manifest.json # PWA configuration
```

---

<p align="center">
  Made with ❤️ · The Future of Intelligence is here.
</p>
