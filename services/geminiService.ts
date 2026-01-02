
import { GoogleGenAI } from "@google/genai";
import { ThemeType } from "../types";

const getAIClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === "undefined" || apiKey === "") {
    throw new Error('API_KEY_MISSING');
  }
  return new GoogleGenAI({ apiKey });
};

const THEME_PROMPTS: Record<string, string> = {
  [ThemeType.Professional]: "一张极其高级的职业肖像照。人物身着剪裁精良的商务西装，背景是高级的深灰色影棚背景。光效采用伦勃朗布光法，展现出稳重、专业且具有深度的职场精英气质。高清晰度，细节完美。",
  [ThemeType.Fashion]: "高级时装艺术大片。人物穿着充满设计感的先锋时尚服装，在对比强烈的霓虹光影下。构图充满张力，色彩高级且富有冲击力，展现出超模般的时尚表现力。视觉效果震撼，充满未来感。",
  [ThemeType.Gallery]: "极简主义美术馆场景中的艺术剪影。人物身处空旷、纯净的艺术空间，正对一面巨大的白色画作或极简装置。柔和的漫反射光线，人物表情空灵、深邃，呈现出一种在艺术空间中游离与沉思的氛围。",
  [ThemeType.BlackWhite]: "极具戏剧张力的黑白电影感艺术照。利用强烈的光影对比（Chiaroscuro）来刻画人物面部轮廓。细腻的银盐胶片质感，高对比度，情绪深沉而有力。一张能讲故事的艺术作品。",
  [ThemeType.Magazine]: "经典的《时代周刊》(TIME Magazine) 封面风格。画面必须带有标志性的红色粗边框，顶部有醒目的白色‘TIME’艺术字体标题。人物神情坚毅且具有影响力，采用纪实摄影的高级质感，光效严谨，呈现出极具时代感的封面人物视觉效果。",
  [ThemeType.Cinematic]: "电影质感的经典剧照肖像。采用2.35:1的宽银幕构图，背景带有电影感的虚化（Bokeh）。冷暖色调的巧妙融合，人物眼神充满叙事感，仿佛是电影中转瞬即逝的动人瞬间。极具大片氛围。"
};

export const generateStudioImage = async (
  base64Image: string,
  theme: string,
  useHighQuality: boolean = false,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  try {
    const ai = getAIClient();
    const prompt = THEME_PROMPTS[theme] || theme;
    const modelName = useHighQuality ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const config: any = {};
    if (useHighQuality) {
      config.imageConfig = {
        aspectRatio: "1:1",
        imageSize: "1K"
      };
    }

    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Image,
              mimeType: mimeType,
            },
          },
          {
            text: `基于此原图复刻面部，生成风格写真：${prompt}。保持面部一致性，1024x1024高清。`,
          },
        ],
      },
      config
    });

    if (response.promptFeedback?.blockReason) {
      throw new Error(`SAFETY: 内容被系统拦截 (${response.promptFeedback.blockReason})`);
    }

    const candidate = response.candidates?.[0];
    if (!candidate) throw new Error('EMPTY: 未能生成内容');

    let imageUrl = '';
    if (candidate.content?.parts) {
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          imageUrl = `data:image/png;base64,${part.inlineData.data}`;
          break;
        }
      }
    }

    if (!imageUrl) throw new Error('NO_IMAGE: 响应中无图像数据');
    return imageUrl;
  } catch (error: any) {
    const msg = error.message || '';
    if (msg.includes('429')) throw new Error('QUOTA_EXHAUSTED');
    if (msg.includes('403')) throw new Error('PERMISSION_DENIED');
    throw error;
  }
};
