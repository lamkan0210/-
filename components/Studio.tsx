
import React, { useState, useEffect } from 'react';
import { ThemeType, GenerationResult } from '../types';
import { generateStudioImage } from '../services/geminiService';

const THEMES = [
  ThemeType.Professional,
  ThemeType.Fashion,
  ThemeType.Gallery,
  ThemeType.BlackWhite,
  ThemeType.Magazine,
  ThemeType.Cinematic
];

const LOADING_STEPS = [
  "正在分析面部特征...",
  "构建艺术构图...",
  "计算环境光影...",
  "注入风格化色调...",
  "细节纹理渲染...",
  "最后的胶片冲印..."
];

const IndividualLoadingProgress: React.FC<{ theme: string }> = ({ theme }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // 模拟进度条增长，越往后越慢
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 98) return 98;
        const increment = prev < 50 ? 2 : prev < 80 ? 1 : 0.5;
        return prev + increment;
      });
    }, 200);

    // 状态文字轮播
    const stepInterval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 2500);

    return () => {
      clearInterval(interval);
      clearInterval(stepInterval);
    };
  }, []);

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-6 bg-zinc-950">
      <div className="relative w-20 h-20">
        {/* 外圈旋转动画 */}
        <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
        <div 
          className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" 
          style={{ animationDuration: '1.5s' }}
        />
        {/* 中间百分比 */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-mono tracking-tighter text-white">
            {Math.floor(progress)}%
          </span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h4 className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">{theme}</h4>
        <p className="text-[11px] text-zinc-400 font-serif-elegant italic animate-pulse transition-all duration-500">
          {LOADING_STEPS[stepIndex]}
        </p>
      </div>

      {/* 底部进度条 */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-zinc-900 overflow-hidden">
        <div 
          className="h-full bg-zinc-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const Studio: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      setUploadPreview(base64);
      const pureBase64 = base64.split(',')[1];
      
      await startGeneration(pureBase64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const startGeneration = async (base64: string, mimeType: string) => {
    setIsGenerating(true);
    
    const initialResults: GenerationResult[] = THEMES.map(theme => ({
      id: Math.random().toString(36).substr(2, 9),
      theme,
      imageUrl: '',
      loading: true
    }));
    setResults(initialResults);

    THEMES.forEach(async (theme, index) => {
      try {
        const url = await generateStudioImage(base64, theme, mimeType);
        setResults(prev => prev.map((item, i) => 
          i === index ? { ...item, imageUrl: url, loading: false } : item
        ));
      } catch (err) {
        setResults(prev => prev.map((item, i) => 
          i === index ? { ...item, loading: false, error: '生成失败，请重试' } : item
        ));
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
      <header className="mb-20 text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-serif-elegant tracking-tighter">幻影写真馆</h1>
        <p className="text-zinc-500 tracking-[0.2em] text-sm uppercase">AI Fine Art Photography Studio</p>
      </header>

      {!isGenerating && !results.length && (
        <div className="flex flex-col items-center justify-center border-y border-zinc-800 py-32 space-y-12">
          <div className="max-w-xl text-center space-y-6">
            <h2 className="text-2xl font-serif-elegant italic">上传一张照片，开启您的AI艺术之旅</h2>
            <p className="text-zinc-400 leading-relaxed text-sm">
              我们的 AI 实验室将基于您的容貌特征，完美复刻并生成六种不同维度的艺术写真。从职业肖像到电影大片，每一张都由顶级视觉模型精雕细琢。
            </p>
          </div>
          
          <label className="group relative inline-flex items-center justify-center px-10 py-4 cursor-pointer overflow-hidden border border-white transition-all hover:bg-white hover:text-black">
            <span className="text-sm tracking-widest font-medium">开始创作 / UPLOAD PHOTO</span>
            <input 
              type="file" 
              className="hidden" 
              accept="image/*" 
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}

      {(isGenerating || results.length > 0) && (
        <div className="mb-12 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs tracking-widest text-zinc-400 uppercase">
              {results.every(r => !r.loading) ? '冲印完成 / FINISHED' : '影像实验室正在冲印中 / DEVELOPING FILM...'}
            </span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
          >
            重置实验室 / RESET
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {results.map((item) => (
            <div key={item.id} className="group relative aspect-[3/4] bg-zinc-950 overflow-hidden border border-zinc-900">
              {item.loading ? (
                <IndividualLoadingProgress theme={item.theme} />
              ) : item.error ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 p-4 text-center">
                  <span className="text-xs uppercase tracking-widest mb-2">{item.error}</span>
                  <p className="text-[10px] text-zinc-800">请刷新页面或检查 API 配置</p>
                </div>
              ) : (
                <>
                  <img 
                    src={item.imageUrl} 
                    alt={item.theme} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <span className="text-xs tracking-widest text-zinc-400 mb-2">PHANTOM STUDIO</span>
                    <h3 className="text-xl font-serif-elegant">{item.theme}</h3>
                    <a 
                      href={item.imageUrl} 
                      download={`${item.theme}.png`}
                      className="mt-4 text-[10px] uppercase tracking-widest border-b border-zinc-500 inline-block w-fit hover:text-white transition-colors"
                    >
                      保存作品 / SAVE ARTWORK
                    </a>
                  </div>
                  <div className="absolute top-4 left-4 text-[9px] tracking-[0.2em] text-white/50 bg-black/40 backdrop-blur-md px-2 py-1 uppercase border border-white/10">
                    {item.theme}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <footer className="mt-32 pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-zinc-700 text-[10px] tracking-[0.3em] uppercase">
        <div className="mb-4 md:mb-0">Powered by Gemini 2.5 Flash / Image Lab 1.0</div>
        <div>Visual Aesthetic / Phantom Studio Lab</div>
      </footer>
    </div>
  );
};
