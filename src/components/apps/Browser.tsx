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
  AlertCircle 
} from 'lucide-react';

type BrowserViewMode = 'iframe' | 'reader' | 'search';

const DEFAULT_BOOKMARKS = [
  { name: 'Wikipedia', url: 'https://en.m.wikipedia.org', mode: 'iframe' as BrowserViewMode },
  { name: 'Hacker News', url: 'https://news.ycombinator.com', mode: 'iframe' as BrowserViewMode },
  { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com', mode: 'iframe' as BrowserViewMode },
  { name: 'Example.com', url: 'https://example.com', mode: 'iframe' as BrowserViewMode },
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
    if (!trimmed) return { url: 'https://example.com', isSearch: false };

    // Check if input is a search query
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
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleHome = () => {
    handleNavigate('https://en.m.wikipedia.org');
  };

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#000000] font-mono text-xs select-none">
      {/* ─── Top Control Toolbar ─── */}
      <div className="flex items-center gap-1 p-1.5 border-b border-[#333333] bg-[#F5F5F2] shrink-0">
        <button
          onClick={browserBack}
          disabled={browser.history.length <= 1}
          className="p-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#888888] disabled:opacity-30 disabled:hover:border-transparent"
          title="Back"
        >
          <ArrowLeft size={14} />
        </button>
        <button
          disabled
          className="p-1 opacity-30 cursor-not-allowed"
          title="Forward"
        >
          <ArrowRight size={14} />
        </button>
        <button
          onClick={handleReload}
          className="p-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#888888]"
          title="Reload"
        >
          <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
        </button>
        <button
          onClick={handleHome}
          className="p-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#888888]"
          title="Home"
        >
          <Home size={14} />
        </button>

        {/* Omnibar (URL / Search input) */}
        <form onSubmit={handleSubmit} className="flex-1 flex items-center mx-1">
          <div className="flex-1 flex items-center bg-[#FFFFFF] border border-[#333333] px-2 py-0.5 shadow-inner">
            <Globe size={12} className="text-[#888888] mr-1.5 shrink-0" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="Search or enter URL (e.g. en.wikipedia.org)..."
              className="flex-1 bg-transparent text-[#111111] outline-none font-mono text-xs"
            />
          </div>
        </form>

        {/* Mode Switcher */}
        <div className="flex items-center border border-[#333333] overflow-hidden bg-[#E5E5E0]">
          <button
            onClick={() => setMode('iframe')}
            className={`px-2 py-1 text-[11px] font-bold ${
              mode === 'iframe' ? 'bg-[#111111] text-[#FFFFFF]' : 'hover:bg-[#D9D9D9] text-[#333333]'
            }`}
            title="Live Web Iframe"
          >
            LIVE
          </button>
          <button
            onClick={() => setMode('reader')}
            className={`px-2 py-1 text-[11px] font-bold ${
              mode === 'reader' ? 'bg-[#111111] text-[#FFFFFF]' : 'hover:bg-[#D9D9D9] text-[#333333]'
            }`}
            title="Simulated / Reader View"
          >
            READER
          </button>
        </div>

        {/* External Link Launcher */}
        <a
          href={activeUrl.startsWith('http') ? activeUrl : `https://${activeUrl}`}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#888888] text-[#333333]"
          title="Open in Host Browser Tab"
        >
          <ExternalLink size={14} />
        </a>
      </div>

      {/* ─── Bookmarks Bar ─── */}
      <div className="flex items-center gap-1 px-2 py-1 border-b border-[#D9D9D9] bg-[#EFEFEA] text-[11px] overflow-x-auto shrink-0">
        <Bookmark size={11} className="text-[#888888] mr-1 shrink-0" />
        {DEFAULT_BOOKMARKS.map((bm) => (
          <button
            key={bm.name}
            onClick={() => {
              setMode(bm.mode);
              handleNavigate(bm.url);
            }}
            className="px-1.5 py-0.5 hover:bg-[#FFFFFF] hover:border hover:border-[#333333] rounded-sm truncate text-[#222222]"
          >
            {bm.name}
          </button>
        ))}
      </div>

      {/* ─── Security & X-Frame Embed Banner ─── */}
      {showEmbedNotice && mode === 'iframe' && (
        <div className="flex items-center justify-between px-3 py-1 bg-[#111111] text-[#FFFFFF] text-[10px] shrink-0 border-b border-[#333333]">
          <div className="flex items-center gap-2 truncate">
            <ShieldCheck size={12} className="text-[#D9D9D9] shrink-0" />
            <span className="truncate">
              Live Web Sandbox: Some domains (Google, GitHub) block iframes via X-Frame-Options. Use Reader Mode or Bookmarks for full preview.
            </span>
          </div>
          <button
            onClick={() => setShowEmbedNotice(false)}
            className="text-[#888888] hover:text-[#FFFFFF] ml-2 px-1"
          >
            ×
          </button>
        </div>
      )}

      {/* ─── Main Viewport ─── */}
      <div className="flex-1 relative overflow-hidden bg-[#FFFFFF]">
        {mode === 'iframe' ? (
          <div className="w-full h-full relative">
            {isLoading && (
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#111111] animate-pulse z-10" />
            )}
            <iframe
              key={iframeKey}
              ref={iframeRef}
              src={activeUrl.startsWith('http') ? activeUrl : `https://${activeUrl}`}
              className="w-full h-full border-0 bg-white"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
              title="NeedleOS Browser Viewport"
            />
          </div>
        ) : (
          /* Reader / Simulated Search Mode */
          <div className="h-full overflow-y-auto p-6 bg-[#FAFAF8]">
            {browser.searchResults && browser.searchResults.length > 0 ? (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="flex items-center justify-between border-b border-[#111111] pb-2">
                  <h2 className="text-sm font-bold flex items-center gap-2">
                    <Search size={14} /> Search Results for: &ldquo;{browser.url.replace('search:', '')}&rdquo;
                  </h2>
                  <span className="text-[10px] text-[#888888]">
                    {browser.searchResults.length} results
                  </span>
                </div>
                {browser.searchResults.map((res, i) => (
                  <div key={i} className="p-3 border border-[#D9D9D9] bg-[#FFFFFF] hover:border-[#111111] transition-colors">
                    <button
                      onClick={() => {
                        setMode('iframe');
                        handleNavigate(res.url);
                      }}
                      className="text-left w-full"
                    >
                      <h3 className="font-bold underline text-[#111111] hover:text-[#000000]">{res.title}</h3>
                      <div className="text-[10px] text-[#888888] mb-1">{res.url}</div>
                      <p className="text-xs text-[#444444] leading-relaxed">{res.content}</p>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-4">
                <div className="border border-[#111111] p-4 bg-[#FFFFFF]">
                  <div className="flex items-center gap-2 text-xs font-bold border-b border-[#D9D9D9] pb-2 mb-3">
                    <BookOpen size={14} /> READER VIEW: {activeUrl}
                  </div>
                  <h1 className="text-base font-bold mb-2">Simulated Documentation & Web Viewer</h1>
                  <p className="text-xs text-[#555555] leading-relaxed mb-4">
                    This simulated view displays extracted readable content from the web and simulated desktop runtime queries without third-party network blocking.
                  </p>
                  <div className="p-3 bg-[#F5F5F2] border border-[#D9D9D9] text-xs font-mono space-y-2">
                    <div><strong>Current URL:</strong> {activeUrl}</div>
                    <div><strong>Protocol:</strong> HTTPS / Virtual Sandbox</div>
                    <div><strong>Rendering Engine:</strong> NeedleOS Web Core v1.0</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Status Bar ─── */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-[#D9D9D9] bg-[#F5F5F2] text-[10px] text-[#555555] shrink-0">
        <div className="truncate max-w-[70%]">
          {isLoading ? 'Connecting...' : `Loaded: ${activeUrl}`}
        </div>
        <div className="flex items-center gap-3">
          <span className="uppercase font-bold">{mode} MODE</span>
          <span>UTF-8</span>
        </div>
      </div>
    </div>
  );
}
