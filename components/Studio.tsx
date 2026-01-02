
import React, { useState, useCallback } from 'react';
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

export const Studio: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
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
    
    // Initialize results with loading state
    const initialResults: GenerationResult[] = THEMES.map(theme => ({
      id: Math.random().toString(36).substr(2, 9),
      theme,
      imageUrl: '',
      loading: true
    }));
    setResults(initialResults);

    // Generate concurrently but update individually for better UX
    THEMES.forEach(async (theme, index) => {
      try {
        const url = await generateStudioImage(base64, theme, mimeType);
        setResults(prev => prev.map((item, i) => 
          i === index ? { ...item, imageUrl: url, loading: false } : item
        ));
      } catch (err) {
        setResults(prev => prev.map((item, i) => 
          i === index ? { ...item, loading: false, error: '生成失败' } : item
        ));
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
      {/* Header */}
      <header className="mb-20 text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-serif-elegant tracking-tighter">幻影写真馆</h1>
        <p className="text-zinc-500 tracking-[0.2em] text-sm uppercase">AI Fine Art Photography Studio</p>
      </header>

      {/* Upload Section */}
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

      {/* Progress / Status */}
      {isGenerating && (
        <div className="mb-12 flex items-center justify-between border-b border-zinc-800 pb-4">
          <div className="flex items-center space-x-4">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs tracking-widest text-zinc-400 uppercase">影像实验室正在冲印中 / DEVELOPING FILM...</span>
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="text-[10px] uppercase tracking-widest text-zinc-600 hover:text-white transition-colors"
          >
            取消并重置 / CANCEL
          </button>
        </div>
      )}

      {/* Results Grid */}
      {results.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {results.map((item) => (
            <div key={item.id} className="group relative aspect-[3/4] bg-zinc-950 overflow-hidden">
              {item.loading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-4">
                  <div className="w-8 h-8 border-t border-white rounded-full animate-spin" />
                  <span className="text-[10px] tracking-widest text-zinc-700 uppercase">{item.theme}</span>
                </div>
              ) : item.error ? (
                <div className="absolute inset-0 flex items-center justify-center text-zinc-700 text-xs">
                  {item.error}
                </div>
              ) : (
                <>
                  <img 
                    src={item.imageUrl} 
                    alt={item.theme} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <span className="text-xs tracking-widest text-zinc-400 mb-2">PHANTOM STUDIO</span>
                    <h3 className="text-xl font-serif-elegant">{item.theme}</h3>
                    <a 
                      href={item.imageUrl} 
                      download={`${item.theme}.png`}
                      className="mt-4 text-[10px] uppercase tracking-widest border-b border-zinc-500 inline-block w-fit"
                    >
                      下载原片 / DOWNLOAD
                    </a>
                  </div>
                  {/* Subtle info label for minimalist vibe */}
                  <div className="absolute top-4 left-4 text-[9px] tracking-[0.2em] text-white/50 bg-black/20 backdrop-blur-md px-2 py-1 uppercase">
                    {item.theme}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Footer Branding */}
      <footer className="mt-32 pt-12 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between text-zinc-700 text-[10px] tracking-[0.3em] uppercase">
        <div className="mb-4 md:mb-0">Powered by Gemini 2.5 Flash</div>
        <div>Visual Aesthetic / Phantom Studio Lab</div>
      </footer>
    </div>
  );
};
