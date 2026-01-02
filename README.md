
# 幻影写真馆 | Phantom Studio

[简体中文](#简体中文) | [English](#english)

---

<a name="简体中文"></a>
## 简体中文

幻影写真馆是一款基于 Google Gemini 2.5 Flash Image 技术构建的智能人像写真生成工具。只需上传一张个人照片，即可快速为您冲印出六种不同艺术风格的高级写真。

### 🚀 部署到 Cloudflare Pages

#### 1. 框架预设选择
在 Cloudflare Pages 控制面板中，请按照以下参数进行配置：

| 配置项 | 设定值 |
| :--- | :--- |
| **Framework preset** | **Vite** |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

#### 2. 环境变量设置 (至关重要)
1. 在 Pages 项目详情页，点击 **Settings -> Environment variables**。
2. 在 **Production** 和 **Preview** 环境下分别添加变量：
   - `API_KEY`: 您的 Google AI Studio API Key。
3. **关键：** 添加完变量后，必须转到 **Deployments** 选项卡，点击最新的部署右侧的三个点，选择 **Retry deployment**。

### 🔍 常见问题排查

- **显示 "API_KEY_MISSING"**：说明环境变量没有注入成功。请检查 Cloudflare 后台设置并重新构建。
- **显示 "网络连接失败"**：如果您在中国大陆访问，需要确保您的设备可以正常连接到 `generativelanguage.googleapis.com`。
- **显示 "SAFETY_ERROR"**：由于 Gemini 的安全政策，部分人像照片可能会被拦截。
- **生成速度**：已优化为并行生成，通常在 5-10 秒内完成。

---

<a name="english"></a>
## English

Phantom Studio is an AI-powered portrait laboratory built with Google Gemini 2.5 Flash Image technology. Upload a single photo to instantly "develop" six high-end artistic portrait styles.

### 🚀 Deploy to Cloudflare Pages

#### 1. Framework Presets
In the Cloudflare Pages dashboard, use the following settings:

| Setting | Value |
| :--- | :--- |
| **Framework preset** | **Vite** |
| **Build command** | `npm run build` |
| **Build output directory** | `dist` |

#### 2. Environment Variables (Critical)
1. In your Pages project, go to **Settings -> Environment variables**.
2. Add the following variable for both **Production** and **Preview**:
   - `API_KEY`: Your Google AI Studio API Key.
3. **Crucial:** After adding the variable, go to the **Deployments** tab, click the three dots on your latest deployment, and select **Retry deployment**.

### 🔍 Troubleshooting

- **"API_KEY_MISSING"**: The environment variable was not injected correctly. Check your Cloudflare settings and rebuild.
- **"Network Connection Failed"**: If accessing from mainland China, ensure your network can reach `generativelanguage.googleapis.com`.
- **"SAFETY_ERROR"**: Due to Gemini's safety policies, some portraits may be blocked by filters.
- **Generation Speed**: Optimized for parallel processing, usually completing within 5-10 seconds.

---
© 2024 幻影写真馆 / Phantom Studio Art Laboratory
