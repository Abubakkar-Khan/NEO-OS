'use client';

import React, { useState, useMemo } from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { 
  FolderIcon, 
  FileText, 
  ChevronLeft, 
  FilePlus, 
  FolderPlus, 
  Trash2, 
  Edit2, 
  CornerRightDown,
  Search,
  HardDrive
} from 'lucide-react';
import { FileNode } from '@/lib/types';
import { audioEngine } from '@/lib/audio';

export default function FileManager() {
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [searchFilter, setSearchFilter] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileNode | null } | null>(null);
  
  const { 
    filesystem,
    listDirectory, 
    createFile, 
    createFolder, 
    deleteNode, 
    renameNode, 
    moveNode,
    openApp,
    openFileInEditor,
    getPathForNode
  } = useDesktopStore();

  const currentFiles = listDirectory(currentFolderId);
  const currentNode = filesystem.find(n => n.id === currentFolderId);
  const isRoot = currentFolderId === 'root';
  const displayPath = currentFolderId === 'root' ? 'Computer' : `Computer${getPathForNode(currentFolderId)}`;

  // Filter files by search string
  const filteredFiles = useMemo(() => {
    if (!searchFilter.trim()) return currentFiles;
    return currentFiles.filter(f => f.name.toLowerCase().includes(searchFilter.toLowerCase().trim()));
  }, [currentFiles, searchFilter]);

  const handleBack = () => {
    if (isRoot) return;
    audioEngine.playClick();
    if (currentNode && currentNode.parentId) {
      setCurrentFolderId(currentNode.parentId);
    } else {
      setCurrentFolderId('root');
    }
  };

  const handleDoubleClick = (file: FileNode) => {
    audioEngine.playPop();
    if (file.type === 'folder') {
      setCurrentFolderId(file.id);
    } else {
      openApp('text-editor', file.name);
      openFileInEditor(file.id);
    }
  };

  const handleCreateFolder = () => {
    audioEngine.playClick();
    const name = prompt('Folder name:');
    if (name) {
      createFolder(name, currentFolderId);
      audioEngine.playSuccess();
    }
  };

  const handleCreateFile = () => {
    audioEngine.playClick();
    const name = prompt('File name:');
    if (name) {
      createFile(name, currentFolderId, '');
      audioEngine.playSuccess();
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    audioEngine.playClick();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleRename = () => {
    if (!contextMenu?.file) return;
    const newName = prompt('New name:', contextMenu.file.name);
    if (newName) {
      renameNode(contextMenu.file.id, newName);
      audioEngine.playSuccess();
    }
    closeContextMenu();
  };

  const handleDelete = () => {
    if (!contextMenu?.file) return;
    if (confirm(`Delete ${contextMenu.file.name}?`)) {
      deleteNode(contextMenu.file.id);
      audioEngine.playAlert();
    }
    closeContextMenu();
  };

  const handleMove = () => {
    if (!contextMenu?.file) return;
    const destName = prompt('Destination folder path (e.g. /Projects or /):');
    if (destName) {
      const dest = destName === '/' 
        ? filesystem.find(n => n.id === 'root')
        : filesystem.find(n => n.type === 'folder' && (n.name === destName.replace('/', '') || n.id === destName));
      if (dest) {
        moveNode(contextMenu.file.id, dest.id);
        audioEngine.playSuccess();
      } else {
        alert('Destination folder not found.');
      }
    }
    closeContextMenu();
  };

  const handleOpen = () => {
    if (!contextMenu?.file) return;
    handleDoubleClick(contextMenu.file);
    closeContextMenu();
  };

  // Breadcrumb segments
  const pathSegments = displayPath === '/' ? ['/'] : displayPath.split('/').filter(Boolean);

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#111111] text-xs font-mono select-none" onClick={closeContextMenu}>
      {/* ─── Nothing OS Utilitarian Toolbar ─── */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[#E8E8E2] bg-[#FAF9F5] shrink-0">
        <button 
          onClick={handleBack} 
          disabled={isRoot} 
          className="p-1.5 rounded-full hover:bg-white border border-transparent hover:border-[#E0E0DA] disabled:opacity-30 disabled:hover:border-transparent transition-all"
          title="Back to parent"
        >
          <ChevronLeft size={16} />
        </button>

        {/* Path Breadcrumbs */}
        <div className="flex items-center gap-1 px-3 py-1 bg-white rounded-full border border-[#E0E0DA] text-[11px] font-mono text-[#333333] shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#D71920]" />
          <span className="font-semibold text-[#111111]">{displayPath}</span>
        </div>

        {/* Search Quick Filter */}
        <div className="flex-1 max-w-xs flex items-center px-2.5 py-1 bg-white rounded-full border border-[#E0E0DA] text-[#666666] focus-within:border-[#111111] transition-all">
          <Search size={12} className="mr-1.5 text-[#999992] shrink-0" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Filter files..."
            className="w-full bg-transparent outline-none text-[11px] font-mono text-[#111111]"
          />
        </div>

        <div className="flex-1" />

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={handleCreateFile} 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E0E0DA] hover:border-[#111111] hover:shadow-xs transition-all font-sans font-medium text-[11px] text-[#222222]"
            title="New File"
          >
            <FilePlus size={13} className="text-[#666666]" /> File
          </button>
          <button 
            onClick={handleCreateFolder} 
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#E0E0DA] hover:border-[#111111] hover:shadow-xs transition-all font-sans font-medium text-[11px] text-[#222222]"
            title="New Folder"
          >
            <FolderPlus size={13} className="text-[#666666]" /> Folder
          </button>
        </div>
      </div>

      {/* ─── Column Headers ─── */}
      <div className="flex px-4 py-1.5 border-b border-[#EFEFEA] bg-[#FAF9F5] font-sans font-semibold text-[11px] text-[#888882] uppercase tracking-wider shrink-0 select-none">
        <div className="w-8"></div>
        <div className="flex-1">Name</div>
        <div className="w-24">Type</div>
        <div className="w-32 text-right">Modified</div>
      </div>

      {/* ─── File List ─── */}
      <div className="flex-1 overflow-y-auto bg-white divide-y divide-[#F6F6F2]">
        {filteredFiles.length === 0 ? (
          <div className="py-16 text-center text-[#999992] font-sans text-xs">
            <div className="w-10 h-10 rounded-2xl bg-[#F6F6F2] flex items-center justify-center mx-auto mb-2 text-[#BBBBB4]">
              <HardDrive size={18} />
            </div>
            {searchFilter ? 'No files match your search' : 'Empty directory'}
          </div>
        ) : (
          filteredFiles.map(file => (
            <div 
              key={file.id}
              onDoubleClick={() => handleDoubleClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className="flex items-center px-4 py-2 hover:bg-[#F7F7F2] cursor-pointer select-none transition-colors group"
            >
              <div className="w-8 shrink-0 flex items-center">
                {file.type === 'folder' ? (
                  <div className="w-6 h-6 rounded-lg bg-[#EFEFEA] flex items-center justify-center text-[#555550] group-hover:bg-[#E5E5DE] transition-colors">
                    <FolderIcon size={14} fill="#888882" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-lg bg-[#FAF9F5] border border-[#EAEAE4] flex items-center justify-center text-[#666660]">
                    <FileText size={13} />
                  </div>
                )}
              </div>
              <div className="flex-1 truncate font-mono text-xs font-medium text-[#222222] pl-1">
                {file.name}
              </div>
              <div className="w-24 text-[#888882] font-sans uppercase text-[10px] tracking-wide">
                {file.type}
              </div>
              <div className="w-32 text-right text-[#999992] font-mono text-[11px] tabular-nums">
                {new Date(file.updatedAt || file.createdAt || Date.now()).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ─── Status Bar ─── */}
      <div className="flex items-center justify-between px-4 py-1.5 border-t border-[#EAEAE4] bg-[#FAF9F5] text-[#888882] text-[11px] font-mono shrink-0">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
          <span>{filteredFiles.length} item{filteredFiles.length === 1 ? '' : 's'}</span>
        </div>
        <div className="text-[10px] text-[#A0A09A] font-sans uppercase tracking-wider">
          Virtual In-Memory Storage
        </div>
      </div>

      {/* ─── Nothing OS Context Menu ─── */}
      {contextMenu && (
        <div 
          className="fixed z-[999] bg-white border border-[#E5E5DE] rounded-xl shadow-xl flex flex-col py-1.5 min-w-[150px] font-sans text-xs animate-in fade-in zoom-in-95 duration-100"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleOpen} className="px-3.5 py-1.5 text-left hover:bg-[#F4F4F0] text-[#111111] flex items-center gap-2.5 transition-colors">
            <FolderIcon size={14} className="text-[#666660]" /> Open
          </button>
          <button onClick={handleRename} className="px-3.5 py-1.5 text-left hover:bg-[#F4F4F0] text-[#111111] flex items-center gap-2.5 transition-colors">
            <Edit2 size={14} className="text-[#666660]" /> Rename
          </button>
          <button onClick={handleMove} className="px-3.5 py-1.5 text-left hover:bg-[#F4F4F0] text-[#111111] flex items-center gap-2.5 transition-colors">
            <CornerRightDown size={14} className="text-[#666660]" /> Move...
          </button>
          <div className="h-px bg-[#EFEFEA] my-1" />
          <button onClick={handleDelete} className="px-3.5 py-1.5 text-left hover:bg-[#FFF1F1] text-[#D71920] flex items-center gap-2.5 transition-colors font-medium">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
