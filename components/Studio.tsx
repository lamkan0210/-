
import React, { useState } from 'react';
import { ThemeType, GenerationResult } from '../types';
import { generateStudioImage } from '../services/geminiService';

const THEMES = [
  ThemeType.Professional, ThemeType.Fashion, ThemeType.Gallery,
  ThemeType.BlackWhite, ThemeType.Magazine, ThemeType.Cinematic
];

export const Studio: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);

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
    setIsGenerating(true);
    setResults(THEMES.map(theme => ({ id: Math.random().toString(), theme, imageUrl: '', loading: true })));

    for (let i = 0; i < THEMES.length; i++) {
      try {
        // 串行请求并保留合理间隔以确保稳定性
        if (i > 0) await new Promise(r => setTimeout(r, 4500));
        const url = await generateStudioImage(base64, THEMES[i], mimeType);
        setResults(prev => prev.map((item, idx) => idx === i ? { ...item, imageUrl: url, loading: false } : item));
      } catch (err: any) {
        setResults(prev => prev.map((item, idx) => idx === i ? { ...item, loading: false, error: err.message } : item));
      }
    }
  };

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
          <div className="flex justify-between items-end border-b border-zinc-900 pb-8">
            <div className="space-y-1">
              <h2 className="text-[10px] tracking-[0.3em] text-zinc-500 uppercase">暗房进度 / PROGRESS</h2>
              <p className="text-xl font-serif-elegant italic text-zinc-200">
                {results.every(r => !r.loading) ? '影像已全部冲印完成' : '实验员正在精细处理中...'}
              </p>
            </div>
            <button onClick={() => window.location.reload()} className="text-[10px] text-zinc-500 hover:text-white uppercase tracking-widest border border-zinc-800 px-6 py-2 transition-all">重置 / RESET</button>
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
