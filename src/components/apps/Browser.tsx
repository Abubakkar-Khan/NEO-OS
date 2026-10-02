'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { 
  ArrowLeft, 
  ArrowRight, 
  RotateCw, 
  Home, 
  Search, 
  Globe, 
  ExternalLink, 
  Bookmark, 
  BookOpen, 
  ShieldCheck, 
  X,
  Compass
} from 'lucide-react';
import { audioEngine } from '@/lib/audio';

type BrowserViewMode = 'iframe' | 'reader' | 'search';

const DEFAULT_BOOKMARKS = [
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org', mode: 'iframe' as BrowserViewMode },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', mode: 'iframe' as BrowserViewMode },
  { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com', mode: 'iframe' as BrowserViewMode },
  { name: 'MDN Web', url: 'https://developer.mozilla.org/en-US/', mode: 'iframe' as BrowserViewMode },
  { name: 'Next.js Docs', url: 'https://nextjs.org/docs', mode: 'reader' as BrowserViewMode },
];

export default function Browser() {
  const { browser, browserBack, browserNavigate, browserSearch } = useDesktopStore();
  const [urlInput, setUrlInput] = useState(browser.url || 'https://en.m.wikipedia.org');
  const [activeUrl, setActiveUrl] = useState(browser.url || 'https://en.m.wikipedia.org');
  const [mode, setMode] = useState<BrowserViewMode>('iframe');
  const [isLoading, setIsLoading] = useState(false);
  const [iframeKey, setIframeKey] = useState(1);
  const [showEmbedNotice, setShowEmbedNotice] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Sync with store state changes
  useEffect(() => {
    if (browser.url) {
      if (browser.url.startsWith('search:')) {
        setMode('reader');
        setUrlInput(browser.url);
        setActiveUrl(browser.url);
      } else {
        setUrlInput(browser.url);
        setActiveUrl(browser.url);
      }
    }
  }, [browser.url]);

  const normalizeUrl = (input: string): { url: string; isSearch: boolean } => {
    const trimmed = input.trim();
    if (!trimmed) return { url: 'https://en.m.wikipedia.org', isSearch: false };

    if (!trimmed.includes('.') && !trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      return { url: trimmed, isSearch: true };
    }

    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      return { url: trimmed, isSearch: false };
    }

    return { url: `https://${trimmed}`, isSearch: false };
  };

  const handleNavigate = (target: string) => {
    const { url, isSearch } = normalizeUrl(target);
    audioEngine.playClick();
    if (isSearch) {
      browserSearch(url);
      setMode('reader');
    } else {
      setActiveUrl(url);
      setUrlInput(url);
      browserNavigate(url);
      setIsLoading(true);
      setIframeKey(prev => prev + 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleNavigate(urlInput);
  };

  const handleReload = () => {
    audioEngine.playClick();
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleHome = () => {
    audioEngine.playPop();
    handleNavigate('https://en.m.wikipedia.org');
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#111111] font-mono text-xs select-none">
      {/* ─── Nothing OS Utilitarian Navigation Bar ─── */}
      <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[#E8E8E2] bg-[#FAF9F5] shrink-0">
        <button
          onClick={() => { audioEngine.playClick(); browserBack(); }}
          disabled={browser.history.length <= 1}
          className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#E0E0DA] disabled:opacity-30 disabled:hover:border-transparent transition-all"
          title="Back"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          disabled
          className="p-1.5 rounded-full opacity-30 cursor-not-allowed"
          title="Forward"
        >
          <ArrowRight size={14} />
        </button>
        <button
          onClick={handleReload}
          className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#E0E0DA] transition-all"
          title="Reload"
        >
          <RotateCw size={13} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={handleHome}
          className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#E0E0DA] transition-all"
          title="Home"
        >
          <Home size={14} />
        </button>

        {/* Omnibar Pill */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center mx-1">
          <div className="w-full flex items-center bg-white border border-[#E0E0DA] rounded-full px-3 py-1 shadow-2xs focus-within:border-[#111111] transition-all">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] mr-2 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Enter URL or search query..."
              className="flex-1 bg-transparent text-[#111111] outline-none font-mono text-xs"
            />
            {isLoading && (
              <span className="text-[10px] text-[#888882] font-sans uppercase animate-pulse ml-2">Loading</span>
            )}
          </div>
        </form>

        {/* Segmented Mode Pill */}
        <div className="flex items-center p-0.5 rounded-full bg-[#EFEFEA] border border-[#E5E5DE]">
          <button
            onClick={() => { audioEngine.playClick(); setMode('iframe'); }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold tracking-wide transition-all ${
              mode === 'iframe' 
                ? 'bg-white text-[#111111] shadow-2xs' 
                : 'text-[#777772] hover:text-[#111111]'
            }`}
          >
            LIVE
          </button>
          <button
            onClick={() => { audioEngine.playClick(); setMode('reader'); }}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-sans font-semibold tracking-wide transition-all ${
              mode === 'reader' 
                ? 'bg-white text-[#111111] shadow-2xs' 
                : 'text-[#777772] hover:text-[#111111]'
            }`}
          >
            READER
          </button>
        </div>

        {/* External Link */}
        <a
          href={activeUrl.startsWith('http') ? activeUrl : `https://${activeUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#E0E0DA] text-[#555550] transition-all"
          title="Open in new browser tab"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* ─── Bookmarks Pill Bar ─── */}
      <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-[#EFEFEA] bg-[#FAF9F5] text-[11px] overflow-x-auto shrink-0">
        <Bookmark size={11} className="text-[#888882] mr-0.5 shrink-0" />
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => {
              audioEngine.playPop();
              setMode(bm.mode);
              handleNavigate(bm.url);
            }}
            className="px-2.5 py-0.5 bg-white rounded-full border border-[#E5E5DE] hover:border-[#111111] text-[#333330] hover:text-[#111111] font-sans text-[11px] transition-all whitespace-nowrap"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* ─── Security Sandbox Notice ─── */}
      {showEmbedNotice && mode === 'iframe' && (
        <div className="flex items-center justify-between px-3.5 py-1 bg-[#111111] text-[#FFFFFF] text-[10px] shrink-0 font-sans">
          <div className="flex items-center gap-2 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
            <span className="truncate">
              Web Sandbox: Some domains (Google, GitHub) enforce X-Frame headers. Click READER mode or bookmarks for full preview.
            </span>
          </div>
          <button
            onClick={() => setShowEmbedNotice(false)}
            className="text-[#888882] hover:text-[#FFFFFF] ml-2 p-0.5"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {/* ─── Viewport ─── */}
      <div className="flex-1 relative overflow-hidden bg-[#FFFFFF]">
        {mode === 'iframe' ? (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#D71920] animate-pulse z-10" />
            )}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={activeUrl.startsWith('http') ? activeUrl : `https://${activeUrl}`}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              title="Browser Viewport"
            />
          </div>
        ) : (
          /* Reader / Simulated Content Mode */
          <div className="h-full overflow-y-auto p-6 bg-[#FAF9F5] select-text">
            {browser.searchResults && browser.searchResults.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-3">
                <div className="flex items-center justify-between border-b border-[#E0E0DA] pb-2">
                  <h2 className="text-xs font-sans font-bold flex items-center gap-2 text-[#111111]">
                    <Search size={14} className="text-[#D71920]" />
                    Results for &ldquo;{browser.url.replace('search:', '')}&rdquo;
                  </h2>
                  <span className="text-[10px] font-mono text-[#888882]">
                    {browser.searchResults.length} items
                  </span>
                </div>
                {browser.searchResults.map((res, i) => (
                  <div key={i} className="p-3.5 rounded-xl bg-white border border-[#E5E5DE] hover:border-[#111111] transition-all shadow-2xs">
                    <button
                      onClick={() => {
                        audioEngine.playPop();
                        setMode('iframe');
                        handleNavigate(res.url);
                      }}
                      className="text-left w-full"
                    >
                      <h3 className="font-sans font-semibold text-[#111111] text-xs hover:text-[#D71920] transition-colors">{res.title}</h3>
                      <div className="text-[10px] font-mono text-[#888882] my-0.5">{res.url}</div>
                      <p className="text-xs text-[#555550] leading-relaxed font-sans">{res.content}</p>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto">
                <div className="rounded-2xl border border-[#E5E5DE] p-5 bg-white shadow-2xs space-y-4">
                  <div className="flex items-center gap-2 text-xs font-sans font-semibold text-[#111111]">
                    <span className="w-2 h-2 rounded-full bg-[#D71920]" />
                    <span>READER VIEW — {activeUrl}</span>
                  </div>
                  <h1 className="text-sm font-sans font-bold text-[#111111]">Clean Extracted Web Document</h1>
                  <p className="text-xs text-[#666660] font-sans leading-relaxed">
                    Utilitarian offline reader view rendering extracted markdown and text content without ad networks or script restrictions.
                  </p>
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EAEAE4] text-[11px] font-mono space-y-1 text-[#333330]">
                    <div><strong>Target:</strong> {activeUrl}</div>
                    <div><strong>Protocol:</strong> HTTPS / Virtual Sandbox</div>
                    <div><strong>Engine:</strong> NEO-OS Utilitarian Web Core</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Status Bar ─── */}
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#EAEAE4] bg-[#FAF9F5] text-[11px] font-mono text-[#777772] shrink-0">
        <div className="truncate max-w-[70%]">
          {isLoading ? 'Connecting...' : `Ready: ${activeUrl}`}
        </div>
        <div className="flex items-center gap-3">
          <span className="uppercase font-semibold tracking-wider text-[10px] text-[#111111]">{mode}</span>
          <span className="text-[#A0A09A]">UTF-8</span>
        </div>
      </div>
    </div>
  );
}
