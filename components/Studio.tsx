
import React, { useState, useRef } from 'react';
import { ThemeType, GenerationResult } from '../types';
import { generateStudioImage } from '../services/geminiService';

const THEMES = [
  ThemeType.Professional, ThemeType.Fashion, ThemeType.Gallery,
  ThemeType.BlackWhite, ThemeType.Magazine, ThemeType.Cinematic
];

export const Studio: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  // 使用 ref 记录当前生成任务的 ID，用于在重置后终止旧的任务回调
  const activeGenerationId = useRef(0);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = (e.target?.result as string).split(',')[1];
      await startGeneration(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const startGeneration = async (base64: string, mimeType: string) => {
    // 每次开始生成，ID 加 1
    const currentId = ++activeGenerationId.current;
    setIsGenerating(true);
    setResults(THEMES.map(theme => ({ id: Math.random().toString(), theme, imageUrl: '', loading: true })));

    // 并行触发所有生成请求，不再进行串行等待
    const tasks = THEMES.map(async (theme, i) => {
      try {
        if (currentId !== activeGenerationId.current) return;

        const url = await generateStudioImage(base64, theme, mimeType);
        
        // 最终检查并更新状态
        if (currentId === activeGenerationId.current) {
          setResults(prev => prev.map((item, idx) => idx === i ? { ...item, imageUrl: url, loading: false } : item));
        }
      } catch (err: any) {
        if (currentId === activeGenerationId.current) {
          setResults(prev => prev.map((item, idx) => idx === i ? { ...item, loading: false, error: err.message } : item));
        }
      }
    });

    // 等待所有任务（无论成功失败）结束
    await Promise.allSettled(tasks);
    
    if (currentId === activeGenerationId.current) {
      setIsGenerating(false);
    }
  };

  const handleReset = () => {
    // 自增 ID 使得之前的循环任务失效
    activeGenerationId.current++;
    setIsGenerating(false);
    setResults([]);
  };

  const handleDownloadAll = () => {
    results.forEach((result, index) => {
      if (result.imageUrl) {
        // 使用 setTimeout 稍微错开下载请求，减少浏览器拦截风险
        setTimeout(() => {
          const link = document.createElement('a');
          link.href = result.imageUrl;
          link.download = `PhantomStudio_${result.theme}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }, index * 200);
      }
    });
  };

  const hasAnyResult = results.some(r => r.imageUrl);
  const isAllComplete = results.length > 0 && results.every(r => !r.loading);

  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <header className="mb-20 text-center space-y-4">
        <h1 className="text-6xl md:text-8xl font-serif-elegant tracking-tighter">幻影写真馆</h1>
        <p className="text-[10px] tracking-[0.5em] text-zinc-500 uppercase">Aesthetic AI Portrait Laboratory</p>
      </header>

      {!isGenerating && !results.length ? (
        <div className="border border-zinc-900 aspect-video flex flex-col items-center justify-center space-y-8 bg-zinc-950/50">
          <label className="group relative px-16 py-6 bg-white text-black cursor-pointer hover:bg-zinc-200 transition-all shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <span className="text-sm font-bold tracking-[0.4em]">开启冲印 / START</span>
            <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
          </label>
          <div className="text-center space-y-2">
            <p className="text-[10px] text-zinc-500 tracking-widest uppercase italic">※ 建议使用光线充足的正脸照片</p>
          </div>
        </div>
      ) : (
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-zinc-900 pb-8 gap-6">
            <div className="space-y-1">
              <h2 className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">暗房进度 / PROGRESS</h2>
              <p className="text-xl font-serif-elegant italic text-zinc-200">
                {isAllComplete ? '影像已全部冲印完成' : '实验员正在全速冲印中...'}
              </p>
            </div>
            <div className="flex gap-4">
              {hasAnyResult && (
                <button 
                  onClick={handleDownloadAll} 
                  className="text-[10px] text-white bg-zinc-900 hover:bg-white hover:text-black uppercase tracking-widest border border-zinc-700 px-6 py-2 transition-all"
                >
                  下载全部 / DOWNLOAD ALL
                </button>
              )}
              <button 
                onClick={handleReset} 
                className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest border border-zinc-800 px-6 py-2 transition-all"
              >
                重置 / RESET
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {results.map((item) => (
              <div key={item.id} className="relative aspect-[3/4] bg-zinc-950 border border-zinc-900 group overflow-hidden shadow-2xl">
                {item.loading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center space-y-6">
                    <div className="w-12 h-12 border-t-2 border-white/50 rounded-full animate-spin" />
                    <span className="text-[10px] text-zinc-600 tracking-widest uppercase">{item.theme}</span>
                  </div>
                ) : item.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center bg-zinc-950">
                    <h4 className="text-[10px] text-zinc-700 uppercase mb-4 tracking-widest">{item.theme}</h4>
                    <p className="text-[10px] text-zinc-500 leading-relaxed uppercase">{item.error}</p>
                  </div>
                ) : (
                  <>
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-[3000ms] group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-8">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <h3 className="text-2xl font-serif-elegant mb-6">{item.theme}</h3>
                        <a 
                          href={item.imageUrl} 
                          download={`${item.theme}.png`} 
                          className="inline-block w-full py-3 bg-white text-black text-[10px] font-bold tracking-[0.3em] text-center hover:bg-zinc-200 transition-colors uppercase"
                        >
                          一键保存 / DOWNLOAD
                        </a>
                      </div>
                    </div>
                    <div className="absolute top-6 left-6 text-[9px] tracking-[0.3em] text-white/40 font-mono bg-black/40 px-2 py-1 backdrop-blur-sm">#{item.theme}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <footer className="mt-32 pt-12 border-t border-zinc-900 flex justify-center text-zinc-800 text-[9px] tracking-[0.5em] uppercase">
        © PHANTOM STUDIO ART LABORATORY
      </footer>
    </div>
  );
};
