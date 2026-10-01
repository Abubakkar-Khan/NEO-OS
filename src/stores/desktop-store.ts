"use client";

import { create } from 'zustand';
import { AppWindow, FileNode, BrowserPage, AppId } from '@/lib/types';
import { generateId } from '@/lib/utils';
import { resolvePathToNode, getFullPath, getChildren } from '@/services/filesystem';
import { generatePageContent, generateSearchResults } from '@/services/browser';

interface EditorState {
  openFile: string | null;
  content: string;
  dirty: boolean;
}

interface BrowserState {
  url: string;
  history: string[];
  searchResults: BrowserPage[];
}

interface SettingsState {
  sound: boolean;
  animations: boolean;
}

interface DesktopStore {
  openWindows: AppWindow[];
  activeWindowId: string | null;
  filesystem: FileNode[];
  editor: EditorState;
  browser: BrowserState;
  settings: SettingsState;
  nextZIndex: number;

  // Window Actions
  openApp: (appId: AppId, title?: string) => void;
  closeApp: (windowId: string) => void;
  focusApp: (windowId: string) => void;
  minimizeApp: (windowId: string) => void;
  moveWindow: (windowId: string, pos: { x: number; y: number }) => void;
  resizeWindow: (windowId: string, size: { width: number; height: number }) => void;
  setActiveWindow: (windowId: string | null) => void;

  // Filesystem Actions
  createFile: (name: string, parentId: string, content?: string) => void;
  createFolder: (name: string, parentId: string) => void;
  deleteNode: (id: string) => void;
  renameNode: (id: string, newName: string) => void;
  moveNode: (id: string, newParentId: string) => void;
  readFile: (id: string) => string | undefined;
  writeFile: (id: string, content: string) => void;
  listDirectory: (parentId: string) => FileNode[];
  getNodeByPath: (path: string) => FileNode | null;
  getPathForNode: (id: string) => string;

  // Editor Actions
  openFileInEditor: (fileId: string) => void;
  setEditorContent: (content: string) => void;
  saveEditorFile: () => void;
  saveEditorFileAs: (name: string, parentId: string) => void;
  closeEditor: () => void;

  // Browser Actions
  setBrowserUrl: (url: string) => void;
  browserSearch: (query: string) => void;
  browserBack: () => void;
  browserNavigate: (url: string) => void;

  // Settings Actions
  toggleSound: () => void;
  toggleAnimations: () => void;
  resetDesktop: () => void;
  syncFromBackend: (backendState: any) => void;
}

const initialFilesystem: FileNode[] = [
  { id: 'root', name: '/', type: 'folder', parentId: null, createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'docs', name: 'Documents', type: 'folder', parentId: 'root', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'proj', name: 'Projects', type: 'folder', parentId: 'root', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'todo', name: 'todo.txt', type: 'file', parentId: 'root', content: 'Buy groceries\nFinish project\nCall dentist', createdAt: Date.now(), updatedAt: Date.now() },
];

export const useDesktopStore = create<DesktopStore>((set, get) => ({
  openWindows: [],
  activeWindowId: null,
  filesystem: initialFilesystem,
  editor: { openFile: null, content: '', dirty: false },
  browser: { url: '', history: [], searchResults: [] },
  settings: { sound: true, animations: true },
  nextZIndex: 1,

  openApp: (appId, title) => {
    set((state) => {
      const existingWindow = state.openWindows.find(w => w.appId === appId);
      const zIndex = state.nextZIndex;
      
      if (existingWindow) {
        return {
          openWindows: state.openWindows.map(w => 
            w.id === existingWindow.id ? { ...w, minimized: false, zIndex } : w
          ),
          activeWindowId: existingWindow.id,
          nextZIndex: zIndex + 1,
        };
      }

      const id = generateId();
      const offset = (state.openWindows.length % 6) * 28 + 40;
      const newWindow: AppWindow = {
        id,
        appId,
        title: title || appId,
        minimized: false,
        zIndex,
        position: { x: offset, y: offset },
        size: { width: 720, height: 500 },
      };

      return {
        openWindows: [...state.openWindows, newWindow],
        activeWindowId: id,
        nextZIndex: zIndex + 1,
      };
    });
  },

  closeApp: (windowId) => {
    set((state) => ({
      openWindows: state.openWindows.filter(w => w.id !== windowId),
      activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
    }));
  },

  focusApp: (windowId) => {
    set((state) => {
      const zIndex = state.nextZIndex;
      return {
        openWindows: state.openWindows.map(w => 
          w.id === windowId ? { ...w, zIndex, minimized: false } : w
        ),
        activeWindowId: windowId,
        nextZIndex: zIndex + 1,
      };
    });
  },

  minimizeApp: (windowId) => {
    set((state) => ({
      openWindows: state.openWindows.map(w => 
        w.id === windowId ? { ...w, minimized: true } : w
      ),
      activeWindowId: state.activeWindowId === windowId ? null : state.activeWindowId,
    }));
  },

  moveWindow: (windowId, pos) => {
    set((state) => ({
      openWindows: state.openWindows.map(w => 
        w.id === windowId ? { ...w, position: pos } : w
      ),
    }));
  },

  resizeWindow: (windowId, size) => {
    set((state) => ({
      openWindows: state.openWindows.map(w => 
        w.id === windowId ? { ...w, size } : w
      ),
    }));
  },

  setActiveWindow: (windowId) => {
    set({ activeWindowId: windowId });
  },

  // Filesystem
  createFile: (name, parentId, content = '') => {
    set((state) => {
      const newNode: FileNode = {
        id: generateId(),
        name,
        type: 'file',
        parentId,
        content,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return { filesystem: [...state.filesystem, newNode] };
    });
  },

  createFolder: (name, parentId) => {
    set((state) => {
      const newNode: FileNode = {
        id: generateId(),
        name,
        type: 'folder',
        parentId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return { filesystem: [...state.filesystem, newNode] };
    });
  },

  deleteNode: (id) => {
    set((state) => {
      const getAllChildrenIds = (nodeId: string, allNodes: FileNode[]): string[] => {
        const children = allNodes.filter(n => n.parentId === nodeId);
        return children.reduce((acc, child) => {
          return [...acc, child.id, ...getAllChildrenIds(child.id, allNodes)];
        }, [] as string[]);
      };

      const idsToDelete = [id, ...getAllChildrenIds(id, state.filesystem)];
      
      return {
        filesystem: state.filesystem.filter(n => !idsToDelete.includes(n.id))
      };
    });
  },

  renameNode: (id, newName) => {
    set((state) => ({
      filesystem: state.filesystem.map(n => 
        n.id === id ? { ...n, name: newName, updatedAt: Date.now() } : n
      )
    }));
  },

  moveNode: (id, newParentId) => {
    set((state) => ({
      filesystem: state.filesystem.map(n => 
        n.id === id ? { ...n, parentId: newParentId, updatedAt: Date.now() } : n
      )
    }));
  },

  readFile: (id) => {
    const node = get().filesystem.find(n => n.id === id);
    return node?.type === 'file' ? node.content : undefined;
  },

  writeFile: (id, content) => {
    set((state) => ({
      filesystem: state.filesystem.map(n => 
        n.id === id ? { ...n, content, updatedAt: Date.now() } : n
      )
    }));
  },

  listDirectory: (parentId) => {
    return getChildren(parentId, get().filesystem);
  },

  getNodeByPath: (path) => {
    return resolvePathToNode(path, get().filesystem);
  },

  getPathForNode: (id) => {
    return getFullPath(id, get().filesystem);
  },

  // Editor
  openFileInEditor: (fileId) => {
    const file = get().filesystem.find(n => n.id === fileId);
    if (file && file.type === 'file') {
      set({
        editor: { openFile: file.id, content: file.content || '', dirty: false }
      });
      get().openApp('text-editor', file.name);
    }
  },

  setEditorContent: (content) => {
    set((state) => ({
      editor: { ...state.editor, content, dirty: true }
    }));
  },

  saveEditorFile: () => {
    const { editor } = get();
    if (editor.openFile) {
      get().writeFile(editor.openFile, editor.content);
      set({ editor: { ...editor, dirty: false } });
    }
  },

  saveEditorFileAs: (name, parentId) => {
    const { editor, createFile, filesystem } = get();
    const existing = filesystem.find(n => n.name === name && n.parentId === parentId);
    
    let newFileId;
    if (existing && existing.type === 'file') {
      get().writeFile(existing.id, editor.content);
      newFileId = existing.id;
    } else {
      const newId = generateId();
      set((state) => {
        const newNode: FileNode = {
          id: newId,
          name,
          type: 'file',
          parentId,
          content: editor.content,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        };
        return { filesystem: [...state.filesystem, newNode] };
      });
      newFileId = newId;
    }

    set((state) => ({
      editor: { ...state.editor, openFile: newFileId, dirty: false }
    }));
  },

  closeEditor: () => {
    set({ editor: { openFile: null, content: '', dirty: false } });
  },

  // Browser
  setBrowserUrl: (url) => {
    set((state) => ({ browser: { ...state.browser, url } }));
  },

  browserSearch: (query) => {
    const results = generateSearchResults(query);
    set((state) => ({
      browser: { ...state.browser, searchResults: results, url: `search:${query}` }
    }));
    get().openApp('browser', `Search: ${query}`);
  },

  browserBack: () => {
    set((state) => {
      const history = [...state.browser.history];
      if (history.length > 1) {
        history.pop();
        const prevUrl = history[history.length - 1];
        return { browser: { ...state.browser, url: prevUrl, history } };
      }
      return state;
    });
  },

  browserNavigate: (url) => {
    set((state) => ({
      browser: {
        ...state.browser,
        url,
        history: [...state.browser.history, url]
      }
    }));
    get().openApp('browser', url);
  },

  // Settings
  toggleSound: () => {
    set((state) => ({ settings: { ...state.settings, sound: !state.settings.sound } }));
  },

  toggleAnimations: () => {
    set((state) => ({ settings: { ...state.settings, animations: !state.settings.animations } }));
  },

  resetDesktop: () => {
    set({
      openWindows: [],
      activeWindowId: null,
      filesystem: initialFilesystem,
      editor: { openFile: null, content: '', dirty: false },
      browser: { url: '', history: [], searchResults: [] },
      settings: { sound: true, animations: true },
      nextZIndex: 1,
    });
  },

  syncFromBackend: (backendState: any) => {
    if (!backendState) return;
    set((state) => {
      let openWindows = state.openWindows;
      if (Array.isArray(backendState.openWindows) && backendState.openWindows.length > 0) {
        openWindows = backendState.openWindows;
      } else if (Array.isArray(backendState.openApps)) {
        for (const appId of backendState.openApps) {
          if (!openWindows.some((w) => w.appId === appId)) {
            const id = generateId();
            openWindows = [
              ...openWindows,
              {
                id,
                appId,
                title: appId === 'text-editor' ? 'Text Editor' : appId === 'file-manager' ? 'File Manager' : appId === 'browser' ? 'Browser' : 'Settings',
                minimized: false,
                zIndex: state.nextZIndex + 1,
                position: { x: (openWindows.length % 5) * 28 + 40, y: (openWindows.length % 5) * 28 + 40 },
                size: { width: 720, height: 500 },
              },
            ];
          }
        }
      }

      const fs = Array.isArray(backendState.filesystem) && backendState.filesystem.length > 0
        ? backendState.filesystem
        : state.filesystem;

      return {
        openWindows,
        activeWindowId: backendState.activeWindowId ?? state.activeWindowId,
        filesystem: fs,
        editor: {
          openFile: backendState.editor?.openFile ?? state.editor.openFile,
          content: backendState.editor?.content ?? state.editor.content,
          dirty: backendState.editor?.dirty ?? state.editor.dirty,
        },
        browser: {
          url: backendState.browser?.url ?? state.browser.url,
          history: backendState.browser?.history ?? state.browser.history,
          searchResults: backendState.browser?.searchResults ?? state.browser.searchResults,
        },
        settings: {
          sound: backendState.settings?.sound ?? state.settings.sound,
          animations: backendState.settings?.animations ?? state.settings.animations,
        },
      };
    });
  },
}));
