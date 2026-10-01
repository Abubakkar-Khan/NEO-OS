'use client';

import React, { useState } from 'react';
import { useDesktopStore } from '@/stores/desktop-store';
import { 
  FolderIcon, 
  FileIcon, 
  ChevronLeft, 
  FilePlus, 
  FolderPlus, 
  Trash2, 
  Edit2, 
  CornerRightDown 
} from 'lucide-react';
import { FileNode } from '@/lib/types';

export default function FileManager() {
  const [currentFolderId, setCurrentFolderId] = useState('root');
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
  const displayPath = currentFolderId === 'root' ? '/' : getPathForNode(currentFolderId);

  const handleBack = () => {
    if (isRoot) return;
    if (currentNode && currentNode.parentId) {
      setCurrentFolderId(currentNode.parentId);
    } else {
      setCurrentFolderId('root');
    }
  };

  const handleDoubleClick = (file: FileNode) => {
    if (file.type === 'folder') {
      setCurrentFolderId(file.id);
    } else {
      openApp('text-editor', file.name);
      openFileInEditor(file.id);
    }
  };

  const handleCreateFolder = () => {
    const name = prompt('Folder name:');
    if (name) createFolder(name, currentFolderId);
  };

  const handleCreateFile = () => {
    const name = prompt('File name:');
    if (name) createFile(name, currentFolderId, '');
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileNode) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const closeContextMenu = () => setContextMenu(null);

  const handleRename = () => {
    if (!contextMenu?.file) return;
    const newName = prompt('New name:', contextMenu.file.name);
    if (newName) renameNode(contextMenu.file.id, newName);
    closeContextMenu();
  };

  const handleDelete = () => {
    if (!contextMenu?.file) return;
    if (confirm(`Delete ${contextMenu.file.name}?`)) {
      deleteNode(contextMenu.file.id);
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

  return (
    <div className="flex flex-col h-full bg-[#FFFFFF] text-[#000000] text-xs font-mono" onClick={closeContextMenu}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-2 border-b border-[#000000] bg-[#F5F5F2] shrink-0">
        <button 
          onClick={handleBack} 
          disabled={isRoot} 
          className="p-1 disabled:opacity-30 hover:bg-[#D9D9D9] border border-transparent hover:border-[#000000]"
          title="Back to parent folder"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 px-2 py-1 bg-[#FFFFFF] border border-[#000000] truncate text-xs">
          {displayPath}
        </div>
        <button onClick={handleCreateFile} className="p-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#000000]" title="New File">
          <FilePlus size={16} />
        </button>
        <button onClick={handleCreateFolder} className="p-1 hover:bg-[#D9D9D9] border border-transparent hover:border-[#000000]" title="New Folder">
          <FolderPlus size={16} />
        </button>
      </div>

      {/* Column Headers */}
      <div className="flex px-4 py-1.5 border-b border-[#D9D9D9] bg-[#F5F5F2] font-bold text-[11px] text-[#444444] shrink-0 select-none">
        <div className="w-8"></div>
        <div className="flex-1">Name</div>
        <div className="w-20">Type</div>
        <div className="w-28 text-right">Modified</div>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-y-auto">
        {currentFiles.length === 0 ? (
          <div className="p-8 text-[#888888] italic text-center">This folder is empty</div>
        ) : (
          currentFiles.map(file => (
            <div 
              key={file.id}
              onDoubleClick={() => handleDoubleClick(file)}
              onContextMenu={(e) => handleContextMenu(e, file)}
              className="flex items-center px-4 py-1.5 border-b border-[#F5F5F2] hover:bg-[#ECECE8] cursor-default select-none transition-colors"
            >
              <div className="w-8 text-[#222222]">
                {file.type === 'folder' ? <FolderIcon size={15} fill="#CCCCCC" /> : <FileIcon size={15} />}
              </div>
              <div className="flex-1 truncate font-medium">{file.name}</div>
              <div className="w-20 text-[#777777] uppercase text-[10px]">{file.type}</div>
              <div className="w-28 text-right text-[#777777] text-[10px]">
                {new Date(file.updatedAt || file.createdAt || Date.now()).toLocaleDateString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div 
          className="fixed z-[999] bg-[#FFFFFF] border border-[#000000] shadow-xl flex flex-col py-1 min-w-[130px] font-mono text-xs"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={handleOpen} className="px-3 py-1.5 text-left hover:bg-[#000000] hover:text-[#FFFFFF] flex items-center gap-2">
            <FolderIcon size={13} /> Open
          </button>
          <button onClick={handleRename} className="px-3 py-1.5 text-left hover:bg-[#000000] hover:text-[#FFFFFF] flex items-center gap-2">
            <Edit2 size={13} /> Rename
          </button>
          <button onClick={handleMove} className="px-3 py-1.5 text-left hover:bg-[#000000] hover:text-[#FFFFFF] flex items-center gap-2">
            <CornerRightDown size={13} /> Move
          </button>
          <div className="h-px bg-[#D9D9D9] my-1"></div>
          <button onClick={handleDelete} className="px-3 py-1.5 text-left hover:bg-[#FF4444] hover:text-[#FFFFFF] flex items-center gap-2">
            <Trash2 size={13} /> Delete
          </button>
        </div>
      )}
    </div>
  );
}
