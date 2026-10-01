'use client';

import React, { useMemo } from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { Save, FolderOpen, FilePlus, X } from 'lucide-react';

export default function TextEditor() {
  const { editor, filesystem, setEditorContent, saveEditorFile, closeEditor } = useDesktopStore();

  const fileNode = editor.openFile ? filesystem.find(n => n.id === editor.openFile) : null;
  const fileName = fileNode ? fileNode.name : 'Untitled';
  
  const content = editor.content;
  const lineCount = content.split('\n').length;
  const charCount = content.length;

  const handleSave = () => saveEditorFile();
  const handleClose = () => closeEditor();

  const lines = useMemo(() => {
    return Array.from({ length: Math.max(10, lineCount) }, (_, i) => i + 1);
  }, [lineCount]);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#000000] font-mono text-sm border border-[#000000]">
      {/* Menu Bar */}
      <div className="flex items-center gap-2 p-1 border-b border-[#000000] bg-[#F5F5F2]">
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#000000]">
          <FilePlus size={14} /> New
        </button>
        <button className="flex items-center gap-1 px-2 py-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#000000]">
          <FolderOpen size={14} /> Open
        </button>
        <button 
          onClick={handleSave} 
          disabled={!editor.dirty}
          className="flex items-center gap-1 px-2 py-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#000000] disabled:opacity-50"
        >
          <Save size={14} /> Save
        </button>
        <div className="flex-1"></div>
        <button onClick={handleClose} className="px-2 py-1 hover:bg-[#000000] hover:text-[#FFFFFF] border border-transparent hover:border-[#000000]">
          <X size={14} /> Close
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-[#000000] bg-[#D9D9D9]">
        <div className="px-4 py-1 bg-[#FFFFFF] border-r border-[#000000] font-bold">
          {fileName} {editor.dirty && '*'}
        </div>
      </div>

      {/* Main Editing Area */}
      <div className="flex flex-1 min-h-0 bg-[#FFFFFF] overflow-hidden relative">
        <div className="w-10 bg-[#F5F5F2] border-r border-[#D9D9D9] text-right pr-2 py-2 text-[#888888] select-none overflow-hidden"
             style={{ paddingTop: '8px' }}>
          {lines.map(n => <div key={n}>{n}</div>)}
        </div>
        <textarea
          value={content}
          onChange={(e) => setEditorContent(e.target.value)}
          className="flex-1 p-2 bg-transparent outline-none resize-none whitespace-pre font-inherit"
          spellCheck={false}
        />
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between px-2 py-1 border-t border-[#000000] bg-[#F5F5F2] text-[#333333] text-xs">
        <div>{fileName}</div>
        <div className="flex gap-4">
          <span>Ln {lineCount}</span>
          <span>Ch {charCount}</span>
        </div>
      </div>
    </div>
  );
}
