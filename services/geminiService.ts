
import { GoogleGenAI } from "@google/genai";
import { ThemeType } from "../types";

const getApiKey = () => {
  return process.env.API_KEY || "";
};

const THEME_PROMPTS: Record<string, string> = {
  [ThemeType.Professional]: "高级商务肖像，彩色摄影，伦勃朗光效，精致西装，暖色调背景，肤色自然质感。",
  [ThemeType.Fashion]: "先锋时尚大片，绚丽霓虹光影，高饱和度色彩，高对比度，视觉冲击感极强。",
  [ThemeType.Gallery]: "极简美术馆，柔和自然的彩色光线，艺术剪影与环境融合，呈现高级的低饱和色彩美学。",
  [ThemeType.BlackWhite]: "经典黑白艺术肖像，极强光影对比，细腻的银盐质感，深沉的情绪表达。",
  [ThemeType.Magazine]: "时尚杂志封面风格，红色艺术边框，高清晰度纪实色彩，具有时代感的胶片色调。",
  [ThemeType.Cinematic]: "电影电影感剧照，2.35:1宽银幕效果，丰富的冷暖色调对比，好莱坞大片色彩渲染。"
};

export const generateStudioImage = async (
  base64Image: string,
  theme: string,
  mimeType: string = 'image/jpeg'
): Promise<string> => {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error('API_KEY_MISSING');

  const ai = new GoogleGenAI({ apiKey });
  const prompt = THEME_PROMPTS[theme] || theme;
  // 统一使用稳定且支持图像生成的 nano banana 模型
  const modelName = 'gemini-2.5-flash-image';
  
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          { inlineData: { data: base64Image, mimeType } },
          { text: `人像写真生成：${prompt}。请务必保持面部特征与原图一致。除了明确标注为黑白的风格外，请输出色彩丰富、光影真实的高清彩色图像。` }
        ],
      },
      config: {
        imageConfig: { aspectRatio: "1:1" }
      }
    });

    const part = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
    if (!part?.inlineData?.data) {
      if (response.promptFeedback?.blockReason) throw new Error(`安全拦截: ${response.promptFeedback.blockReason}`);
      throw new Error('未能生成影像数据');
    }

    return `data:image/png;base64,${part.inlineData.data}`;
  } catch (error: any) {
    const errorStr = JSON.stringify(error);
    if (errorStr.includes('429') || errorStr.includes('limit: 0') || errorStr.includes('RESOURCE_EXHAUSTED')) {
      throw new Error('服务器繁忙，请稍后再试');
    }
    throw error;
  }
};
