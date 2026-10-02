import { toolRegistry } from '../registry';
import { useDesktopStore } from '@/stores/desktop-store';
import type { AppId } from '@/lib/types';

const resolveAppId = (app: string): AppId | null => {
  const normalized = app.toLowerCase().replace(/[\s-]/g, '');
  if (['filemanager', 'files', 'computer', 'mycomputer', 'folder'].includes(normalized)) return 'file-manager';
  if (['texteditor', 'editor', 'notes', 'notepad'].includes(normalized)) return 'text-editor';
  if (['browser', 'webbrowser', 'web', 'internet'].includes(normalized)) return 'browser';
  if (['settings', 'options', 'preferences'].includes(normalized)) return 'settings';
  return null;
};

toolRegistry.register({
  name: 'open_app',
  description: 'Opens an application on the desktop',
  category: 'desktop',
  parameters: {
    app: { type: 'string', description: 'The app to open (file-manager, text-editor, browser, settings)', required: true }
  },
  execute: async (args) => {
    const appId = resolveAppId(String(args.app));
    if (!appId) return { success: false, message: `Unknown app: ${args.app}` };
    
    useDesktopStore.getState().openApp(appId);
    return { success: true, message: `Opened app ${appId}` };
  }
});

toolRegistry.register({
  name: 'close_app',
  description: 'Closes an application',
  category: 'desktop',
  parameters: {
    app: { type: 'string', description: 'The app or windowId to close', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    const appArg = String(args.app);
    const appId = resolveAppId(appArg);
    
    const windowToClose = state.openWindows.find(w => w.id === appArg || w.appId === appId);
    if (!windowToClose) return { success: false, message: `App or window not found: ${args.app}` };
    
    state.closeApp(windowToClose.id);
    return { success: true, message: `Closed ${windowToClose.title}` };
  }
});

toolRegistry.register({
  name: 'focus_app',
  description: 'Focuses or switches to an app window',
  category: 'desktop',
  parameters: {
    app: { type: 'string', description: 'The app or windowId to focus', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    const appArg = String(args.app);
    const appId = resolveAppId(appArg);
    
    const windowToFocus = state.openWindows.find(w => w.id === appArg || w.appId === appId);
    if (!windowToFocus) return { success: false, message: `App or window not found: ${args.app}` };
    
    state.focusApp(windowToFocus.id);
    return { success: true, message: `Focused ${windowToFocus.title}` };
  }
});

toolRegistry.register({
  name: 'minimize_app',
  description: 'Minimizes a window',
  category: 'desktop',
  parameters: {
    app: { type: 'string', description: 'The app or windowId to minimize', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    const appArg = String(args.app);
    const appId = resolveAppId(appArg);
    
    const windowToMinimize = state.openWindows.find(w => w.id === appArg || w.appId === appId);
    if (!windowToMinimize) return { success: false, message: `App or window not found: ${args.app}` };
    
    state.minimizeApp(windowToMinimize.id);
    return { success: true, message: `Minimized ${windowToMinimize.title}` };
  }
});
