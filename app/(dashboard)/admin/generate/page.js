'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useGenerate } from '@/src/hooks/useGenerate';
import Image from 'next/image';

const MODEL_OPTIONS = [
  { id: 'seredityfy-v2', name: 'Seredityfy v2', description: 'Precision & Realism', mode: 'HYBRID' },
  { id: 'cinematic-xl', name: 'Cinematic XL', description: 'High-Impact Drama', mode: 'GEMINI_ONLY' },
  { id: 'surrealist-flux', name: 'Surrealist Flux', description: 'Artistic Liberty', mode: 'CHATGPT_ONLY' },
];

const ASPECT_RATIOS = [
  { id: '16:9', width: 1280, height: 720, label: '16:9' },
  { id: '1:1', width: 1024, height: 1024, label: '1:1' },
  { id: '2:3', width: 768, height: 1152, label: '2:3' },
  { id: '9:16', width: 720, height: 1280, label: '9:16' },
  { id: '19:12', width: 1980, height: 1280, label: 'Full HD' },
  { id: 'custom', width: 1024, height: 1024, label: 'Custom', custom: true },
];

const RANDOM_PROMPTS = [
  'A mystical forest with glowing crystals, bioluminescent plants, ethereal light rays, cinematic photography, 8k resolution',
  'Futuristic cyberpunk city at night, neon lights reflecting on wet streets, flying cars, rain, atmospheric fog',
  'An astronaut floating in space surrounded by colorful nebulae, cosmic dust particles, dramatic lighting',
  'Ancient dragon perched on mountain peak, scales glistening in sunset, epic fantasy art style',
  'Steampunk airship fleet sailing through clouds, brass and copper machinery, Victorian aesthetic',
];

export default function GeneratorPage() {
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [selectedAspect, setSelectedAspect] = useState(ASPECT_RATIOS[0]);
  const [customSize, setCustomSize] = useState({ width: 1024, height: 1024 });
  const [guidanceScale, setGuidanceScale] = useState(8.5);
  const [showNegativePrompt, setShowNegativePrompt] = useState(false);
  const [seed, setSeed] = useState(null);
  const [fixSeed, setFixSeed] = useState(false);
  const [visibility, setVisibility] = useState('PUBLIC');
  
  const [referenceImage, setReferenceImage] = useState(null);
  const [referencePreview, setReferencePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [strength, setStrength] = useState(0.7);
  const [credits, setCredits] = useState({ used: 0, remaining: 10, cost: 3 });
  const fileInputRef = useRef(null);
  
  const { 
    generate, 
    isGenerating, 
    currentImage, 
    error, 
    progress,
    history,
    clearError 
  } = useGenerate();

  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch('/api/subscriptions?current=true');
        const data = await res.json();
        if (data?.subscription) {
          setCredits({
            used: data.usedCredits || 0,
            remaining: data.availableCredits || 0,
            cost: 3,
          });
        }
      } catch (e) {
        console.error('Failed to fetch credits:', e);
      }
    }
    fetchCredits();
  }, []);

  const handleSurpriseMe = useCallback(() => {
    const randomPrompt = RANDOM_PROMPTS[Math.floor(Math.random() * RANDOM_PROMPTS.length)];
    setPrompt(randomPrompt);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) return;

    const generateData = {
      prompt: prompt.trim(),
      model: selectedModel.id,
      generationMode: selectedModel.mode,
      width: selectedAspect.width,
      height: selectedAspect.height,
      guidanceScale,
      negativePrompt: negativePrompt.trim() || null,
      seed: fixSeed ? seed : null,
      visibility,
    };

    if (referenceImage) {
      generateData.referenceImage = referenceImage;
      generateData.strength = strength;
    }

    try {
      const result = await generate(generateData);
      
      // Update credits after successful generation
      const res = await fetch('/api/subscriptions?current=true');
      const data = await res.json();
      if (data?.subscription) {
        setCredits(prev => ({
          ...prev,
          used: data.usedCredits || 0,
          remaining: data.availableCredits || 0,
        }));
      }
    } catch (err) {
      console.error('Generation failed:', err);
    }
  }, [prompt, selectedModel, selectedAspect, guidanceScale, negativePrompt, fixSeed, seed, visibility, referenceImage, strength, generate]);

  const handleFileSelect = useCallback((file) => {
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setReferencePreview(e.target.result);
      
      const formData = new FormData();
      formData.append('file', file);
      
fetch('/api/upload/reference', {
          method: 'POST',
          body: formData,
        })
        .then(res => res.json())
        .then(data => {
          if (data.url) {
            setReferenceImage(data.url);
          } else {
            alert('Failed to upload reference image. Generation will continue without it.');
            setReferenceImage(null);
            setReferencePreview(null);
          }
        })
        .catch((err) => {
          console.error('Reference upload failed:', err);
          alert('Failed to upload reference image. Generation will continue without it.');
          setReferenceImage(null);
          setReferencePreview(null);
        });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const removeReferenceImage = useCallback(() => {
    setReferenceImage(null);
    setReferencePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const handleAspectChange = useCallback((ratio) => {
    if (ratio.custom) {
      setSelectedAspect({ ...ratio, width: customSize.width, height: customSize.height });
    } else {
      setSelectedAspect(ratio);
    }
  }, [customSize]);

  const handleModelChange = useCallback((model) => {
    setSelectedModel(model);
  }, []);

  const handleSliderChange = useCallback((e) => {
    setGuidanceScale(parseFloat(e.target.value));
  }, []);

  useEffect(() => {
    if (fixSeed && !seed) {
      setSeed(Math.floor(Math.random() * 999999999));
    }
  }, [fixSeed, seed]);

  return (
    <main className="p-8 flex flex-col min-h-[calc(100vh-5rem)]">
      {/* Credits Display */}
      <div className="mb-6 flex items-center justify-between bg-surface-container-low rounded-xl p-4 border border-white/5">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary">account_balance_wallet</span>
          <div>
            <span className="text-xs font-label text-purple-300/60 uppercase">Available Credits</span>
            <span className="ml-3 text-xl font-headline font-bold text-on-surface">{credits.remaining}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-purple-300/60">Used: <span className="text-on-surface font-bold">{credits.used}</span></span>
          <span className="text-purple-300/60">|</span>
          <span className="text-purple-300/60">Cost: <span className="text-on-surface font-bold">~{credits.cost} CR</span></span>
        </div>
      </div>
      
      {error && (
        <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 flex items-center justify-between">
          <span>{error}</span>
          <button onClick={clearError} className="text-red-200 hover:text-white">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      )}
      
      <div className="flex gap-8 h-full">
        {/* Generation Canvas */}
        <div className="flex-1 flex flex-col gap-8 min-w-0">
          {/* Prompt Section */}
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/30 to-secondary/30 rounded-2xl blur opacity-20 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative bg-surface-container-low rounded-2xl p-6 transition-all">
              <label className="block text-[10px] font-label uppercase tracking-widest text-purple-300/50 mb-3 ml-1">Describe your masterpiece</label>
              <textarea
                className="w-full bg-transparent border-none focus:ring-0 text-xl font-headline font-medium placeholder:text-purple-300/20 text-on-surface leading-relaxed resize-none h-40 no-scrollbar"
                placeholder="An ethereal cityscape submerged in neon violet water, floating bioluminescent jellyfish, cinematic hyper-realistic photography, 8k..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <div className="flex justify-between items-center mt-4">
                <div className="flex gap-2">
                  <button 
                    onClick={handleSurpriseMe}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-label text-purple-200/80 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">stars</span>
                    Surprise Me
                  </button>
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high text-xs font-label text-purple-200/80 hover:bg-surface-container-highest transition-colors disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">image</span>
                    Init Image
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files[0])}
                    className="hidden"
                  />
                </div>
                <button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim()}
                  className="bg-gradient-to-r from-primary to-[#ffabf3] text-on-primary font-headline font-extrabold px-10 py-3 rounded-xl shadow-[0_0_30px_rgba(213,186,255,0.3)] active:scale-95 transition-all duration-300 neon-glow disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      Generating...
                    </>
                  ) : (
                    'GENERATE'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Reference Image Drop Zone */}
          <div 
            className={`relative rounded-2xl border-2 border-dashed transition-all ${
              isDragging 
                ? 'border-primary bg-primary/10' 
                : referencePreview 
                  ? 'border-green-500/50 bg-green-500/5' 
                  : 'border-white/10 bg-surface-container-low hover:border-white/20'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {referencePreview ? (
              <div className="relative p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-green-400">image</span>
                    <span className="text-xs font-label text-green-400/80">Reference Image</span>
                  </div>
                  <button 
                    onClick={removeReferenceImage}
                    className="p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm text-purple-300/60">close</span>
                  </button>
                </div>
                <div className="relative w-full h-32 rounded-xl overflow-hidden">
                  <img 
                    src={referencePreview} 
                    alt="Reference" 
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-label uppercase tracking-widest text-purple-300/40">Influence Strength</span>
                    <span className="text-xs font-label text-primary">{(strength * 100).toFixed(0)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={strength}
                    onChange={(e) => setStrength(parseFloat(e.target.value))}
                    className="w-full h-1 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full"
                    style={{
                      background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${strength * 100}%, rgb(255 255 255 / 0.1) ${strength * 100}%, rgb(255 255 255 / 0.1) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-[10px] font-label text-purple-300/30 mt-1">
                    <span>Prompt</span>
                    <span>Reference</span>
                  </div>
                </div>
              </div>
            ) : (
              <div 
                className="flex flex-col items-center justify-center p-8 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`w-16 h-16 mb-4 rounded-full flex items-center justify-center ${
                  isDragging ? 'bg-primary/20' : 'bg-white/5'
                }`}>
                  <span className={`material-symbols-outlined text-3xl ${isDragging ? 'text-primary' : 'text-purple-300/40'}`}>
                    cloud_upload
                  </span>
                </div>
                <p className="text-sm font-label text-purple-200/60 mb-1">
                  {isDragging ? 'Drop your image here' : 'Drag & drop an image'}
                </p>
                <p className="text-[10px] text-purple-300/30">
                  or click to browse • PNG, JPG up to 10MB
                </p>
              </div>
            )}
          </div>

          {/* Results Grid */}
          <div className="flex-1 overflow-y-auto no-scrollbar pb-8">
            <div className="grid grid-cols-12 grid-rows-2 gap-6 h-full min-h-[400px]">
              {/* Main Preview */}
              <div className="col-span-8 row-span-2 bg-surface-container-low rounded-[2rem] flex flex-col items-center justify-center text-center p-12 border border-white/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5"></div>
                
                {isGenerating ? (
                  <div className="relative z-10">
                    <div className="w-24 h-24 mb-6 mx-auto relative">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                      </div>
                    </div>
                    <h3 className="text-3xl font-headline font-bold text-on-surface mb-2 tracking-tight">Creating your masterpiece...</h3>
                    <p className="text-purple-300/40 font-body max-w-sm mx-auto mb-4">{progress}% complete</p>
                    <div className="w-64 mx-auto h-1 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                ) : currentImage?.imageUrl ? (
                  <div className="relative z-10 w-full h-full flex items-center justify-center">
                    <img 
                      src={currentImage.imageUrl} 
                      alt="Generated" 
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                    <div className="absolute bottom-4 right-4 flex gap-2">
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <span className="material-symbols-outlined">download</span>
                      </button>
                      <button className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                        <span className="material-symbols-outlined">share</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="w-24 h-24 mb-6 mx-auto relative">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl animate-pulse rounded-full"></div>
                      <span className="material-symbols-outlined text-6xl text-primary font-thin" style={{ fontVariationSettings: "'wght' 200" }}>electric_bolt</span>
                    </div>
                    <h3 className="text-3xl font-headline font-bold text-on-surface mb-2 tracking-tight">Waiting for your electric imagination...</h3>
                    <p className="text-purple-300/40 font-body max-w-sm mx-auto">
                      {referenceImage 
                        ? 'Your reference image is ready. Click generate to create!' 
                        : 'Input your prompt and click generate to breathe life into the digital void.'}
                    </p>
                  </div>
                )}
              </div>

              {/* Recent Results */}
              {history.slice(0, 2).map((img, idx) => (
                <div key={img.id || idx} className="col-span-4 row-span-1 group relative rounded-3xl overflow-hidden cursor-pointer">
                  <img
                    className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 transition-all duration-700 scale-105 group-hover:scale-100"
                    alt={img.prompt}
                    src={img.imageUrl || '/assets/card1.png'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-6 flex flex-col justify-end">
                    <span className="text-[10px] font-label text-secondary uppercase tracking-widest mb-1">{img.model}</span>
                    <p className="text-xs text-white/80 line-clamp-2">{img.prompt}</p>
                  </div>
                </div>
              ))}
              
              {history.length < 2 && (
                <>
                  <div className="col-span-4 row-span-1 bg-surface-container-low rounded-3xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-4xl text-purple-300/20">image</span>
                  </div>
                  {history.length === 0 && (
                    <div className="col-span-4 row-span-1 bg-surface-container-low rounded-3xl flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-purple-300/20">image</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Controls Sidebar */}
        <aside className="w-80 flex flex-col gap-6 h-full overflow-y-auto no-scrollbar">
          {/* Model Selection */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <h4 className="text-xs font-label uppercase tracking-widest text-purple-300/40 mb-6">Model Engine</h4>
            <div className="space-y-3">
              {MODEL_OPTIONS.map((model) => (
                <button
                  key={model.id}
                  onClick={() => handleModelChange(model)}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${
                    selectedModel.id === model.id
                      ? 'bg-primary/10 border border-primary/20 text-primary'
                      : 'bg-white/5 border border-transparent hover:border-white/10 text-purple-200/60'
                  }`}
                >
                  <div className="text-left">
                    <div className="text-sm font-headline font-bold">{model.name}</div>
                    <div className={`text-[10px] ${selectedModel.id === model.id ? 'text-primary/60' : 'text-purple-400'} font-label`}>
                      {model.description}
                    </div>
                  </div>
                  {selectedModel.id === model.id && (
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Aspect Ratio */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <h4 className="text-xs font-label uppercase tracking-widest text-purple-300/40 mb-6">Canvas Aspect</h4>
            <div className="grid grid-cols-3 gap-3">
              {ASPECT_RATIOS.filter(r => !r.custom).map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => handleAspectChange(ratio)}
                  className={`aspect-square flex flex-col items-center justify-center gap-2 rounded-2xl transition-all ${
                    selectedAspect.id === ratio.id
                      ? 'bg-primary/10 border border-primary/20 text-primary'
                      : 'bg-white/5 border border-transparent hover:bg-white/10'
                  }`}
                >
                  <div className={`border-2 rounded-sm ${
                    selectedAspect.id === ratio.id ? 'border-primary' : 'border-purple-300/40'
                  }`}
                    style={{
                      width: ratio.id === '2:3' ? '16px' : ratio.id === '1:1' ? '20px' : '28px',
                      height: ratio.id === '2:3' ? '24px' : ratio.id === '1:1' ? '20px' : '16px',
                    }}
                  ></div>
                  <span className={`text-[10px] font-label ${selectedAspect.id === ratio.id ? 'text-primary' : 'text-purple-300/60'}`}>
                    {ratio.label}
                  </span>
                </button>
              ))}
            </div>
            
            {/* Custom Size Option */}
            <div className="mt-4 pt-4 border-t border-white/5">
              <button
                onClick={() => setSelectedAspect({ id: 'custom', ...customSize })}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  selectedAspect.id === 'custom'
                    ? 'bg-primary/10 border border-primary/20 text-primary'
                    : 'bg-white/5 border border-transparent hover:bg-white/10 text-purple-300/60'
                }`}
              >
                <span className="material-symbols-outlined text-sm">tune</span>
                Custom Size: {customSize.width} × {customSize.height}
              </button>
              {selectedAspect.id === 'custom' && (
                <div className="mt-4 flex gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] font-label text-purple-400 uppercase">Width</label>
                    <input
                      type="number"
                      value={customSize.width}
                      onChange={(e) => {
                        const w = parseInt(e.target.value) || 512;
                        setCustomSize({ ...customSize, width: Math.min(2048, Math.max(256, w)) });
                        setSelectedAspect({ id: 'custom', width: Math.min(2048, Math.max(256, w)), height: customSize.height });
                      }}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-on-surface"
                      min={256}
                      max={2048}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] font-label text-purple-400 uppercase">Height</label>
                    <input
                      type="number"
                      value={customSize.height}
                      onChange={(e) => {
                        const h = parseInt(e.target.value) || 512;
                        setCustomSize({ ...customSize, height: Math.min(2048, Math.max(256, h)) });
                        setSelectedAspect({ id: 'custom', width: customSize.width, height: Math.min(2048, Math.max(256, h)) });
                      }}
                      className="w-full mt-1 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-on-surface"
                      min={256}
                      max={2048}
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Guidance Scale */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-6">
              <h4 className="text-xs font-label uppercase tracking-widest text-purple-300/40">Creative Freedom</h4>
              <span className="text-xs font-label text-primary">{guidanceScale.toFixed(1)}</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="0.5"
              value={guidanceScale}
              onChange={handleSliderChange}
              className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${((guidanceScale - 1) / 14) * 100}%, rgb(255 255 255 / 0.05) ${((guidanceScale - 1) / 14) * 100}%, rgb(255 255 255 / 0.05) 100%)`
              }}
            />
            <div className="flex justify-between text-[10px] font-label text-purple-300/30 uppercase mt-2">
              <span>Literal</span>
              <span>Abstract</span>
            </div>
          </section>

          {/* Visibility Toggle */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <h4 className="text-xs font-label uppercase tracking-widest text-purple-300/40 mb-6">Sharing</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === 'PUBLIC'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-4 h-4 accent-primary"
                />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-purple-300">public</span>
                  <span className="text-sm text-purple-200/80">Share to Community</span>
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === 'PRIVATE'}
                  onChange={(e) => setVisibility(e.target.value)}
                  className="w-4 h-4 accent-primary"
                />
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-purple-300">lock</span>
                  <span className="text-sm text-purple-200/80">Keep Private</span>
                </div>
              </label>
            </div>
          </section>

          {/* Advanced Toggles */}
          <section className="bg-surface-container-low rounded-3xl p-6 border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-label text-purple-200/80">Negative Prompt</span>
              <button
                onClick={() => setShowNegativePrompt(!showNegativePrompt)}
                className={`w-10 h-5 rounded-full relative p-1 transition-colors ${showNegativePrompt ? 'bg-primary/20' : 'bg-white/10'}`}
              >
                <div className={`w-3 h-3 rounded-full transition-transform ${showNegativePrompt ? 'translate-x-5 bg-primary' : 'bg-purple-300/40'}`}></div>
              </button>
            </div>
            
            {showNegativePrompt && (
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-purple-200/80 placeholder:text-purple-300/30 resize-none h-20"
                placeholder="ugly, blurry, low quality..."
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
              />
            )}

            <div className="flex items-center justify-between">
              <span className="text-sm font-label text-purple-200/80">Seed Fix</span>
              <button
                onClick={() => setFixSeed(!fixSeed)}
                className={`w-10 h-5 rounded-full relative p-1 transition-colors ${fixSeed ? 'bg-primary/20' : 'bg-white/10'}`}
              >
                <div className={`w-3 h-3 rounded-full transition-transform ${fixSeed ? 'translate-x-5 bg-primary' : 'bg-purple-300/40'}`}></div>
              </button>
            </div>

            {fixSeed && seed && (
              <div className="text-xs text-purple-300/60 font-mono">
                Seed: {seed}
              </div>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
}
