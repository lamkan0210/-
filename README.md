
# 幻影写真馆 (Phantom Studio) - AI 影像实验室

幻影写真馆是一款基于 Google Gemini 2.5 Flash Image 技术构建的智能人像写真生成工具。只需上传一张个人照片，AI 实验室即可实时为您冲印出六种不同艺术风格的高级写真。

## 🚀 部署到 Cloudflare Pages

### 1. 框架预设选择
在 Cloudflare Pages 控制面板中，请按照以下参数进行配置：

| 配置项 | 设定值 |
| :--- | :--- |
| **Framework preset** | **Vite** |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |
| **Root directory** | `/` (项目根目录) |

### 2. 环境变量设置
在 **Settings -> Environment variables** 中添加：
- `API_KEY`: 您的 Google AI Studio API Key。

### 3. 本地开发
如果您想在本地运行：
```bash
npm install
npm run dev
```

## ✨ 核心主题
- 职业肖像照 / Professional Portrait
- 时尚写真 / Avant-Garde Fashion
- 美术馆迷失的她 / Gallery Silence
- 黑白艺术照 / Chiaroscuro Noir
- 《时代周刊》封面 / TIME Cover (Red Frame)
- 电影肖像 / Cinematic Frame

---
© 2024 AI Vision Laboratory / Created for Aesthetic & Art.
