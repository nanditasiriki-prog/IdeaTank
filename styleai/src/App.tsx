/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  ChevronRight, 
  User, 
  ShoppingBag, 
  Palette, 
  Scissors,
  ArrowLeft,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import Markdown from 'react-markdown';
import { analyzeStyle } from './services/gemini';
import { cn } from './lib/utils';

type Gender = 'Male' | 'Female' | 'Non-binary';

export default function App() {
  const [step, setStep] = useState<'landing' | 'upload' | 'analyzing' | 'results'>('landing');
  const [image, setImage] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender>('Female');
  const [results, setResults] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasApiKey, setHasApiKey] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startAnalysis = async () => {
    if (!image) return;
    setStep('analyzing');
    setError(null);
    try {
      const response = await analyzeStyle(image, gender);
      if (response) {
        setResults(response);
        setStep('results');
      } else {
        throw new Error("No response from AI");
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage = err.message || String(err);
      
      if (errorMessage.includes("Requested entity was not found")) {
        setError("API Key issue detected. Please select a valid paid API key.");
        setHasApiKey(false);
      } else {
        setError("Analysis failed. Please try again with a clearer photo.");
      }
      setStep('upload');
    }
  };

  const reset = () => {
    setImage(null);
    setResults(null);
    setStep('landing');
  };

  return (
    <div className="min-h-screen fashion-gradient overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 px-6 py-8 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer" onClick={reset}>
          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <span className="font-serif text-2xl tracking-tight">StyleAI</span>
        </div>
        <div className="hidden md:flex gap-8 text-sm uppercase tracking-widest font-medium text-white/60">
          <a href="#" className="hover:text-white transition-colors">Trends</a>
          <a href="#" className="hover:text-white transition-colors">Collections</a>
          <a href="#" className="hover:text-white transition-colors">About</a>
        </div>
        <button className="px-6 py-2 border border-white/20 rounded-full text-xs uppercase tracking-widest hover:bg-white hover:text-black transition-all">
          Sign In
        </button>
      </nav>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <AnimatePresence mode="wait">
          {step === 'landing' && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center space-y-12 py-20"
            >
              <div className="space-y-6">
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.6 }}
                  className="text-xs uppercase tracking-[0.3em] font-semibold"
                >
                  Your Personal AI Stylist
                </motion.span>
                <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tighter">
                  ELEVATE YOUR <br />
                  <span className="italic text-white/40">ESSENCE</span>
                </h1>
                <p className="max-w-xl mx-auto text-lg text-white/60 font-light leading-relaxed">
                  Discover the colors, cuts, and styles that harmonize with your unique features. 
                  Upload a photo and let our AI curate your perfect wardrobe.
                </p>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setStep('upload')}
                className="group relative flex items-center gap-4 bg-white text-black px-10 py-5 rounded-full font-medium overflow-hidden"
              >
                <span className="relative z-10">Start Your Transformation</span>
                <ChevronRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-emerald-400 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </motion.button>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-20 w-full opacity-40 grayscale">
                <img src="https://picsum.photos/seed/fashion1/400/600" alt="Fashion" className="rounded-2xl aspect-[3/4] object-cover" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/fashion2/400/600" alt="Fashion" className="rounded-2xl aspect-[3/4] object-cover mt-12" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/fashion3/400/600" alt="Fashion" className="rounded-2xl aspect-[3/4] object-cover" referrerPolicy="no-referrer" />
                <img src="https://picsum.photos/seed/fashion4/400/600" alt="Fashion" className="rounded-2xl aspect-[3/4] object-cover mt-12" referrerPolicy="no-referrer" />
              </div>
            </motion.div>
          )}

          {step === 'upload' && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="max-w-2xl mx-auto space-y-12"
            >
              <div className="flex items-center gap-4 mb-8">
                <button onClick={() => setStep('landing')} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <h2 className="font-serif text-4xl">Upload Your Portrait</h2>
              </div>

              <div className="space-y-8">
                {/* Gender Selection */}
                <div className="space-y-4">
                  <label className="text-xs uppercase tracking-widest text-white/40 font-semibold">Select Gender Preference</label>
                  <div className="flex gap-4">
                    {(['Female', 'Male', 'Non-binary'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setGender(g)}
                        className={cn(
                          "flex-1 py-4 rounded-2xl border transition-all text-sm font-medium",
                          gender === g 
                            ? "bg-white text-black border-white" 
                            : "bg-transparent text-white border-white/10 hover:border-white/30"
                        )}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Upload Area */}
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "relative aspect-video glass-card flex flex-col items-center justify-center cursor-pointer group transition-all overflow-hidden",
                    image ? "border-emerald-500/50" : "hover:border-white/30"
                  )}
                >
                  {image ? (
                    <>
                      <img src={image} alt="Preview" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                      <div className="relative z-10 flex flex-col items-center gap-2 bg-black/40 p-6 rounded-2xl backdrop-blur-md">
                        <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        <span className="text-sm font-medium">Photo Selected</span>
                        <span className="text-xs text-white/60">Click to change</span>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-8 h-8 text-white/40" />
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-medium">Drop your photo here</p>
                        <p className="text-sm text-white/40">or click to browse files</p>
                      </div>
                    </div>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm text-center bg-red-400/10 py-3 rounded-xl border border-red-400/20">
                    {error}
                  </p>
                )}

                <button
                  disabled={!image}
                  onClick={startAnalysis}
                  className={cn(
                    "w-full py-5 rounded-full font-semibold text-lg transition-all flex items-center justify-center gap-3",
                    image 
                      ? "bg-white text-black hover:bg-emerald-400" 
                      : "bg-white/5 text-white/20 cursor-not-allowed"
                  )}
                >
                  <Sparkles className="w-5 h-5" />
                  Analyze My Style
                </button>

                {!hasApiKey && (
                  <div className="p-6 glass-card border-amber-500/30 bg-amber-500/5 space-y-4">
                    <p className="text-sm text-amber-200/80 text-center">
                      A paid Gemini API key may be required for high-quality analysis.
                    </p>
                    <button
                      onClick={handleSelectKey}
                      className="w-full py-3 bg-amber-500 text-black rounded-full text-sm font-bold hover:bg-amber-400 transition-colors"
                    >
                      Select API Key
                    </button>
                    <p className="text-[10px] text-center text-white/20">
                      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline">Learn about Gemini API billing</a>
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'analyzing' && (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-40 space-y-8"
            >
              <div className="relative">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="w-32 h-32 border-t-2 border-r-2 border-white rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-white/40" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h3 className="font-serif text-3xl italic">Curating Your Look...</h3>
                <p className="text-white/40 text-sm tracking-widest uppercase">Analyzing skin tone & features</p>
              </div>
            </motion.div>
          )}

          {step === 'results' && results && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-12"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/10 pb-8">
                <div className="space-y-2">
                  <button onClick={() => setStep('upload')} className="flex items-center gap-2 text-xs uppercase tracking-widest text-white/40 hover:text-white transition-colors mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to Upload
                  </button>
                  <h2 className="font-serif text-5xl md:text-7xl">Your Style <span className="italic text-white/40">Blueprint</span></h2>
                </div>
                <div className="flex gap-4">
                   <button className="px-6 py-3 bg-white text-black rounded-full text-sm font-medium hover:bg-emerald-400 transition-colors">
                    Save Profile
                   </button>
                   <button onClick={reset} className="px-6 py-3 border border-white/20 rounded-full text-sm font-medium hover:bg-white/10 transition-colors">
                    New Analysis
                   </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Image & Quick Stats */}
                <div className="space-y-8">
                  <div className="aspect-[3/4] rounded-3xl overflow-hidden glass-card">
                    <img src={image!} alt="Analyzed" className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="glass-card p-8 space-y-6">
                    <h4 className="text-xs uppercase tracking-[0.2em] font-bold text-white/40">Quick Insights</h4>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Palette className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase font-bold">Best Palette</p>
                          <p className="text-sm font-medium">Warm Earth Tones</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <ShoppingBag className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase font-bold">Style Vibe</p>
                          <p className="text-sm font-medium">Quiet Luxury</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                          <Scissors className="w-5 h-5 text-white/60" />
                        </div>
                        <div>
                          <p className="text-xs text-white/40 uppercase font-bold">Grooming</p>
                          <p className="text-sm font-medium">Soft Layers</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: AI Content */}
                <div className="lg:col-span-2 space-y-12">
                  <div className="prose prose-invert max-w-none prose-headings:font-serif prose-headings:font-normal prose-h1:text-5xl prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-p:text-white/70 prose-p:leading-relaxed prose-li:text-white/70">
                    <Markdown>{results}</Markdown>
                  </div>

                  {/* Mock Product Grid */}
                  <div className="space-y-8 pt-12 border-t border-white/10">
                    <div className="flex justify-between items-center">
                      <h3 className="font-serif text-3xl">Curated <span className="italic text-white/40">Essentials</span></h3>
                      <button className="text-xs uppercase tracking-widest text-white/40 hover:text-white flex items-center gap-2">
                        View All <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="group cursor-pointer space-y-4">
                          <div className="aspect-[4/5] rounded-2xl overflow-hidden glass-card relative">
                            <img 
                              src={`https://picsum.photos/seed/item${i + 10}/400/500`} 
                              alt="Product" 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute top-4 right-4 w-8 h-8 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <ShoppingBag className="w-4 h-4" />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-widest text-white/40 font-bold">Essential Item {i}</p>
                            <p className="text-sm font-medium">Premium Selection</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-white/40" />
            <span className="font-serif text-xl">StyleAI</span>
          </div>
          <p className="text-xs text-white/20 uppercase tracking-widest">
            © 2026 StyleAI. Powered by Gemini Vision.
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-white/40 hover:text-white transition-colors"><User className="w-5 h-5" /></a>
            <a href="#" className="text-white/40 hover:text-white transition-colors"><ShoppingBag className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>
    </div>
  );
}
