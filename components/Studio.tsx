
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

const LOADING_STEPS = ["分析特征...", "构建构图...", "计算光影...", "注入色调...", "细节渲染...", "胶片冲印..."];

const IndividualLoadingProgress: React.FC<{ theme: string }> = ({ theme }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setProgress(p => p >= 98 ? 98 : p + (p < 50 ? 2 : 0.5)), 200);
    const si = setInterval(() => setStepIndex(p => (p + 1) % LOADING_STEPS.length), 2500);
    return () => { clearInterval(i); clearInterval(si); };
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950">
      <div className="relative w-16 h-16 mb-6">
        <div className="absolute inset-0 border-2 border-zinc-800 rounded-full" />
        <div className="absolute inset-0 border-2 border-t-white rounded-full animate-spin" />
      </div>
      <h4 className="text-[10px] tracking-widest text-zinc-500 uppercase mb-2">{theme}</h4>
      <p className="text-[11px] text-zinc-400 font-serif-elegant italic">{LOADING_STEPS[stepIndex]} {Math.floor(progress)}%</p>
    </div>
  );
};

export const Studio: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [useHighQuality, setUseHighQuality] = useState(false);
  const [lastUpload, setLastUpload] = useState<{base64: string, type: string} | null>(null);

  const handleSelectKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setUseHighQuality(true);
      if (lastUpload) {
        startGeneration(lastUpload.base64, lastUpload.type, true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      const pureBase64 = base64.split(',')[1];
      setLastUpload({ base64: pureBase64, type: file.type });
      await startGeneration(pureBase64, file.type, useHighQuality);
    };
    reader.readAsDataURL(file);
  };

  const startGeneration = async (base64: string, mimeType: string, isHQ: boolean) => {
    setIsGenerating(true);
    setResults(THEMES.map(theme => ({ id: Math.random().toString(36).substr(2, 9), theme, imageUrl: '', loading: true })));

    for (let i = 0; i < THEMES.length; i++) {
      try {
        // 增加延迟，防止并发过高
        if (i > 0) await new Promise(r => setTimeout(r, 2500));
        
        const url = await generateStudioImage(base64, THEMES[i], isHQ, mimeType);
        setResults(prev => prev.map((item, idx) => idx === i ? { ...item, imageUrl: url, loading: false } : item));
      } catch (err: any) {
        setResults(prev => prev.map((item, idx) => idx === i ? { ...item, loading: false, error: err.message } : item));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <header className="mb-16 text-center">
        <h1 className="text-5xl font-serif-elegant tracking-tighter mb-4">幻影写真馆</h1>
        <div className="flex items-center justify-center space-x-6 text-[10px] tracking-widest text-zinc-500 uppercase">
          <span>AI Fine Art Photography</span>
          <div className="h-3 w-px bg-zinc-800" />
          <label className="flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              checked={useHighQuality} 
              onChange={(e) => setUseHighQuality(e.target.checked)}
              className="mr-2 accent-white"
            />
            <span className={useHighQuality ? 'text-white' : 'group-hover:text-zinc-300'}>高画质模式 (需个人 Key)</span>
          </label>
        </div>
      </header>

      {!isGenerating && !results.length ? (
        <div className="border-y border-zinc-900 py-32 flex flex-col items-center">
          <label className="group px-12 py-5 border border-white cursor-pointer hover:bg-white hover:text-black transition-all">
            <span className="text-xs tracking-[0.3em] font-bold">上传照片开启实验 / BEGIN</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <p className="mt-8 text-[10px] text-zinc-600 tracking-widest uppercase">支持 JPG / PNG / WEBP</p>
        </div>
      ) : (
        <>
          <div className="mb-12 flex justify-between items-center border-b border-zinc-900 pb-4">
            <div className="text-[10px] tracking-widest text-zinc-500 uppercase">
              {results.every(r => !r.loading) ? '冲印完成 / FINISHED' : '实验室冲印中 / IN PROGRESS'}
            </div>
            <button onClick={() => window.location.reload()} className="text-[10px] text-zinc-700 hover:text-white uppercase tracking-widest">重置 / RESET</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {results.map((item) => (
              <div key={item.id} className="relative aspect-[3/4] bg-zinc-950 border border-zinc-900 overflow-hidden">
                {item.loading ? (
                  <IndividualLoadingProgress theme={item.theme} />
                ) : item.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <span className="text-red-900 text-xs mb-4">!</span>
                    <h4 className="text-[10px] text-zinc-600 uppercase mb-4">{item.theme}</h4>
                    {item.error === 'QUOTA_EXHAUSTED' ? (
                      <div className="space-y-4">
                        <p className="text-[10px] text-zinc-400">系统配额已耗尽，请使用个人 API Key 以获得无限生成次数和更高画质。</p>
                        <button 
                          onClick={handleSelectKey}
                          className="px-4 py-2 border border-zinc-700 text-[10px] hover:border-white transition-colors"
                        >
                          使用个人 Key (推荐)
                        </button>
                      </div>
                    ) : (
                      <p className="text-[9px] text-zinc-500 font-mono">{item.error}</p>
                    )}
                  </div>
                ) : (
                  <>
                    <img src={item.imageUrl} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                      <h3 className="text-lg font-serif-elegant mb-4">{item.theme}</h3>
                      <a href={item.imageUrl} download={`${item.theme}.png`} className="text-[10px] border-b border-zinc-500 pb-1 w-fit">保存作品</a>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </>
      )}
      
      <div className="mt-24 text-center text-[9px] text-zinc-800 tracking-[0.5em] uppercase">
        Visual Laboratory / Aesthetic Computing
      </div>
    </div>
  );
};
