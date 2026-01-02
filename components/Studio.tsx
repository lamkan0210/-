
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

const IndividualLoadingProgress: React.FC<{ theme: string }> = ({ theme }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const i = setInterval(() => setProgress(p => p >= 98 ? 98 : p + 0.5), 100);
    return () => clearInterval(i);
  }, []);
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950">
      <div className="w-12 h-12 border border-zinc-800 rounded-full flex items-center justify-center mb-4">
        <div className="w-8 h-8 border-2 border-t-white border-zinc-900 rounded-full animate-spin" />
      </div>
      <span className="text-[10px] text-zinc-500 tracking-widest uppercase mb-2">{theme}</span>
      <div className="w-24 h-[1px] bg-zinc-900 relative">
        <div className="absolute inset-y-0 left-0 bg-white transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
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
      // 成功后强制刷新并使用 HQ 模式
      setUseHighQuality(true);
      if (lastUpload) {
        startGeneration(lastUpload.base64, lastUpload.type, true);
      } else {
        alert("API Key 已更新，请上传照片开始。");
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
        // 每个请求间隔更长一点，避免 429
        if (i > 0) await new Promise(r => setTimeout(r, 4000));
        
        const url = await generateStudioImage(base64, THEMES[i], isHQ, mimeType);
        setResults(prev => prev.map((item, idx) => idx === i ? { ...item, imageUrl: url, loading: false } : item));
      } catch (err: any) {
        setResults(prev => prev.map((item, idx) => idx === i ? { ...item, loading: false, error: err.message } : item));
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
      <header className="mb-20 text-center space-y-6">
        <h1 className="text-5xl md:text-8xl font-serif-elegant tracking-tighter">幻影写真馆</h1>
        <div className="flex flex-wrap items-center justify-center gap-6 text-[10px] tracking-widest text-zinc-500 uppercase">
          <span className="flex items-center"><div className="w-1 h-1 bg-green-500 rounded-full mr-2" /> 系统状态: 在线</span>
          <div className="h-3 w-px bg-zinc-800 hidden md:block" />
          <button onClick={handleSelectKey} className="hover:text-white transition-colors underline underline-offset-4">更换 API KEY</button>
          <div className="h-3 w-px bg-zinc-800 hidden md:block" />
          <label className="flex items-center cursor-pointer group">
            <input 
              type="checkbox" 
              checked={useHighQuality} 
              onChange={(e) => setUseHighQuality(e.target.checked)}
              className="mr-2 accent-white w-3 h-3"
            />
            <span className={useHighQuality ? 'text-white' : 'group-hover:text-zinc-300'}>高画质模式</span>
          </label>
        </div>
      </header>

      {!isGenerating && !results.length ? (
        <div className="border-y border-zinc-900 py-32 flex flex-col items-center group">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-zinc-800 to-zinc-900 rounded blur opacity-25 group-hover:opacity-100 transition duration-1000"></div>
            <label className="relative px-16 py-6 bg-black border border-zinc-800 cursor-pointer flex flex-col items-center">
              <span className="text-sm tracking-[0.4em] font-bold mb-2">上传影像 / UPLOAD</span>
              <span className="text-[9px] text-zinc-600 tracking-widest">START ARTISTIC TRANSFORMATION</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
          <p className="mt-12 text-[10px] text-zinc-700 tracking-[0.3em] uppercase">Recommended: Portrait photo with clear face</p>
        </div>
      ) : (
        <div className="space-y-12">
          <div className="flex justify-between items-end border-b border-zinc-900 pb-8">
            <div className="space-y-2">
              <h2 className="text-xs tracking-[0.3em] text-zinc-400 uppercase">当前状态 / CURRENT STATUS</h2>
              <p className="text-xl font-serif-elegant italic text-zinc-200">
                {results.every(r => !r.loading) ? '影像冲印已完成' : '实验员正在暗房冲印...'}
              </p>
            </div>
            <button onClick={() => window.location.reload()} className="text-[10px] text-zinc-600 hover:text-white uppercase tracking-widest border border-zinc-800 px-4 py-2 hover:bg-zinc-900 transition-all">重新开始 / RESET</button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {results.map((item) => (
              <div key={item.id} className="group relative aspect-[3/4] bg-zinc-950 border border-zinc-900 overflow-hidden shadow-2xl">
                {item.loading ? (
                  <IndividualLoadingProgress theme={item.theme} />
                ) : item.error ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-6">
                    <div className="w-12 h-12 border border-red-950 rounded-full flex items-center justify-center">
                      <span className="text-red-900 text-lg">!</span>
                    </div>
                    <div>
                      <h4 className="text-[10px] text-zinc-600 uppercase mb-4 tracking-widest">{item.theme}</h4>
                      {item.error === 'QUOTA_0' ? (
                        <div className="space-y-6">
                          <p className="text-[10px] text-zinc-400 leading-relaxed uppercase tracking-tighter">
                            当前项目配额受限 (Limit 0)。<br/>请切换 API KEY 或更换 Google 账号再次尝试。
                          </p>
                          <button 
                            onClick={handleSelectKey}
                            className="w-full py-3 bg-white text-black text-[10px] font-bold tracking-widest hover:bg-zinc-200 transition-colors"
                          >
                            切换个人 API KEY
                          </button>
                        </div>
                      ) : (
                        <p className="text-[9px] text-zinc-500 font-mono leading-relaxed bg-zinc-900/50 p-4 border border-zinc-900">{item.error}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <>
                    <img src={item.imageUrl} className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-105" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 flex flex-col justify-end p-8">
                      <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                        <span className="text-[10px] tracking-widest text-zinc-500 mb-2 block uppercase">Aesthetic Artifact</span>
                        <h3 className="text-2xl font-serif-elegant mb-6">{item.theme}</h3>
                        <a href={item.imageUrl} download={`${item.theme}.png`} className="inline-block px-6 py-2 border border-zinc-700 text-[10px] tracking-widest hover:bg-white hover:text-black transition-all">保存影像 / DOWNLOAD</a>
                      </div>
                    </div>
                    <div className="absolute top-6 left-6 text-[9px] tracking-[0.3em] text-white/40 font-mono">#{item.theme}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      <footer className="mt-32 pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-zinc-800 text-[9px] tracking-[0.4em] uppercase">
        <div className="mb-4 md:mb-0">AESTHETIC COMPUTING LAB / v2.1</div>
        <div className="flex gap-8">
          <span>Processing Unit: Gemini 2.5 Flash</span>
          <span>Optical Engine: Nano Banana</span>
        </div>
      </footer>
    </div>
  );
};
