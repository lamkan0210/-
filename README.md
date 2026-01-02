
# 幻影写真馆 (Phantom Studio) - AI 影像实验室

幻影写真馆是一款基于 Google Gemini 2.5 Flash Image 技术构建的智能人像写真生成工具。只需上传一张个人照片，AI 实验室即可实时为您冲印出六种不同艺术风格的高级写真。

![Aesthetic](https://img.shields.io/badge/Aesthetic-Minimalist-black)
![Model](https://img.shields.io/badge/Model-Gemini%202.5%20Flash-blue)
![Tech](https://img.shields.io/badge/Tech-React%20%2B%20Tailwind-61dafb)

## ✨ 核心功能

- **沉浸式开场动画**：复刻高端设计网站的极简 Loading 动效。
- **六大艺术主题**：
  - **职业肖像照**：精英质感的商务大片。
  - **时尚写真**：充满张力的先锋时装秀。
  - **美术馆迷失的她**：极简艺术空间的氛围感剪影。
  - **黑白艺术照**：戏剧性的光影对比与情绪表达。
  - **《时代周刊》封面**：完美复刻经典的红框杂志视觉。
  - **电影肖像**：宽幅电影质感与叙事化眼神。
- **一键下载**：生成后可直接保存 1024x1024 的高清作品。

## 🛠️ 技术栈

- **Frontend**: React 19 + TypeScript
- **Styling**: Tailwind CSS
- **AI Core**: `@google/genai` (Gemini 2.5 Flash Image)
- **Deployment**: Cloudflare Pages

## 🚀 部署指南

### 1. 准备工作
- 获取 [Google AI Studio API Key](https://aistudio.google.com/app/apikey)。
- 确保您的环境支持 Node.js。

### 2. GitHub 仓库设置
将此项目推送到您的 GitHub 仓库：
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin [您的仓库地址]
git push -u origin main
```

### 3. 部署到 Cloudflare Pages
1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2. 进入 **Workers & Pages** -> **Create application** -> **Pages** -> **Connect to Git**。
3. 选择您刚刚创建的仓库。
4. **Build settings** 设置：
   - **Framework preset**: `Create React App` (或保持 None，手动填写)
   - **Build command**: `npm run build`
   - **Build output directory**: `dist` (根据实际构建结果而定)
5. **Environment Variables (关键)**：
   - 添加变量 `API_KEY`，值为您的 Gemini API Key。
6. 点击 **Save and Deploy**。

## ⚠️ 注意事项
- 本工具调用的是 `gemini-2.5-flash-image` 模型，请确保您的 API Key 有权限访问该模型。
- 生成过程中请保持网络畅通，图片生成通常需要 5-10 秒。

---
© 2024 AI Vision Laboratory / Created for Aesthetic & Art.
