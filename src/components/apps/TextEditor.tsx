'use client';

import React, { useMemo } from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { Save, FolderOpen, FilePlus, X, Check, CircleDot } from 'lucide-react';
import { audioEngine } from '@/lib/audio';

export default function TextEditor() {
  const { editor, filesystem, setEditorContent, saveEditorFile, closeEditor } = useDesktopStore();

  const fileNode = editor.openFile ? filesystem.find(n => n.id === editor.openFile) : null;
  const fileName = fileNode ? fileNode.name : 'untitled.txt';
  
  const content = editor.content;
  const linesCount = content.split('\n').length;
  const charCount = content.length;
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;

  const handleSave = () => {
    audioEngine.playSuccess();
    saveEditorFile();
  };

  const handleClose = () => {
    audioEngine.playClick();
    closeEditor();
  };

  const lines = useMemo(() => {
    return Array.from({ length: Math.max(12, linesCount) }, (_, i) => i + 1);
  }, [linesCount]);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#111111] font-mono text-xs select-none">
      {/* ─── Nothing OS Utilitarian Action Bar ─── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#E8E8E2] bg-[#FAF9F5] shrink-0">
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => { audioEngine.playClick(); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E0E0DA] hover:border-[#111111] hover:shadow-xs transition-all text-[#222222] font-sans font-medium text-[11px]"
          >
            <FilePlus size={13} className="text-[#666666]" /> New
          </button>
          <button 
            onClick={() => { audioEngine.playClick(); }}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E0E0DA] hover:border-[#111111] hover:shadow-xs transition-all text-[#222222] font-sans font-medium text-[11px]"
          >
            <FolderOpen size={13} className="text-[#666666]" /> Open
          </button>
          <button 
            onClick={handleSave} 
            disabled={!editor.dirty}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-full transition-all font-sans font-medium text-[11px] ${
              editor.dirty 
                ? 'bg-[#111111] text-white hover:bg-[#222222] shadow-xs cursor-pointer' 
                : 'bg-[#F0EFEB] text-[#999995] border border-transparent cursor-not-allowed opacity-60'
            }`}
          >
            <Save size={13} />
            <span>Save</span>
            {editor.dirty && <span className="w-1.5 h-1.5 rounded-full bg-[#D71920] animate-pulse ml-0.5" />}
          </button>
        </div>

        {/* Tab / File Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#F0EFEB] border border-[#E5E5DE] text-[11px]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
          <span className="font-mono text-[#111111] font-semibold">{fileName}</span>
          {editor.dirty ? (
            <span className="text-[10px] text-[#D71920] font-sans uppercase tracking-wider font-bold">Unsaved</span>
          ) : (
            <span className="text-[10px] text-[#777772] font-sans uppercase tracking-wider">Synced</span>
          )}
        </div>

        <button 
          onClick={handleClose} 
          className="p-1 rounded-full hover:bg-[#EAEAE5] text-[#666666] hover:text-[#111111] transition-colors"
          title="Close editor"
        >
          <X size={15} />
        </button>
      </div>

      {/* ─── Main Workspace & Line Gutter ─── */}
      <div className="flex flex-1 min-h-0 bg-[#FFFFFF] overflow-hidden select-text">
        {/* Dot Matrix Gutter */}
        <div 
          className="w-12 bg-[#FAF9F5] border-r border-[#EFEFEA] text-right pr-3 py-3 text-[#A8A8A2] select-none overflow-hidden font-mono text-[11px] leading-[22px]"
          aria-hidden="true"
        >
          {lines.map(n => (
            <div key={n} className="tabular-nums font-mono opacity-70 hover:opacity-100 transition-opacity">
              {n.toString().padStart(2, '0')}
            </div>
          ))}
        </div>

        {/* Utilitarian Textarea Canvas */}
        <textarea
          value={content}
          onChange={(e) => setEditorContent(e.target.value)}
          placeholder="// Type your document or code here..."
          className="flex-1 p-3 bg-transparent outline-none resize-none whitespace-pre font-mono text-[13px] leading-[22px] text-[#111111] selection:bg-[#111111] selection:text-[#FFFFFF]"
          spellCheck={false}
        />
      </div>

      {/* ─── Status Footer (Nothing OS Dot Style) ─── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#EAEAE4] bg-[#FAF9F5] text-[#777772] text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <CircleDot size={10} className={editor.dirty ? "text-[#D71920]" : "text-[#10B981]"} />
            <span className="text-[#333333] font-medium">{fileName}</span>
          </span>
          <span className="text-[#D0D0CA]">/</span>
          <span className="text-[#888882]">UTF-8</span>
        </div>
        <div className="flex items-center gap-4 tabular-nums">
          <span>{linesCount} <span className="text-[#999990]">lines</span></span>
          <span>{wordCount} <span className="text-[#999990]">words</span></span>
          <span>{charCount} <span className="text-[#999990]">chars</span></span>
        </div>
      </div>
    </div>
  );
}
