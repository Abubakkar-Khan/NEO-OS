import { toolRegistry } from '../registry';
import { useDesktopStore } from '@/stores/desktop-store';

toolRegistry.register({
  name: 'get_time',
  description: 'Get current system time',
  category: 'system',
  parameters: {},
  execute: async () => {
    return { success: true, message: 'Time retrieved', data: { time: new Date().toISOString() } };
  }
});

toolRegistry.register({
  name: 'get_system_info',
  description: 'Get system information',
  category: 'system',
  parameters: {},
  execute: async () => {
    return { 
      success: true, 
      message: 'System info retrieved', 
      data: { 
        name: 'NeedleOS',
        version: '1.0.0',
        toolsCount: toolRegistry.getAll().length
      } 
    };
  }
});

toolRegistry.register({
  name: 'inspect_screen',
  description: 'Inspect what is currently on screen/in front of user: active window, open windows, text editor contents, browser status, and filesystem summary',
  category: 'system',
  parameters: {},
  execute: async () => {
    const state = useDesktopStore.getState();
    const activeWin = state.openWindows.find(w => w.id === state.activeWindowId && !w.minimized);
    const editorFile = state.editor.openFile ? state.filesystem.find(f => f.id === state.editor.openFile) : null;
    const openWins = state.openWindows.filter(w => !w.minimized);
    const filesCount = state.filesystem.filter(f => f.type === 'file').length;
    const foldersCount = state.filesystem.filter(f => f.type === 'folder').length;

    const screenData = {
      activeApp: activeWin ? activeWin.appId : null,
      activeWindowTitle: activeWin ? activeWin.title : 'Desktop Background',
      openWindowsCount: openWins.length,
      openWindows: openWins.map(w => ({ title: w.title, app: w.appId })),
      editor: {
        isOpen: openWins.some(w => w.appId === 'text-editor'),
        file: editorFile ? editorFile.name : (state.editor.content ? 'Untitled Note' : 'No file'),
        content: state.editor.content,
        dirty: state.editor.dirty
      },
      browser: {
        isOpen: openWins.some(w => w.appId === 'browser'),
        url: state.browser.url || 'Home',
        searchResultsCount: state.browser.searchResults?.length || 0
      },
      filesystem: {
        files: filesCount,
        folders: foldersCount
      }
    };

    let summary = `In front of you: ${screenData.activeWindowTitle}`;
    if (screenData.editor.isOpen) {
      summary += ` | Text Editor is open with ${screenData.editor.file} (${screenData.editor.content ? `content: "${screenData.editor.content.substring(0, 80)}..."` : 'empty'})`;
    }
    if (screenData.browser.isOpen) {
      summary += ` | Browser is open at ${screenData.browser.url}`;
    }
    if (openWins.length > 0) {
      summary += ` | Open apps: [${openWins.map(w => w.title).join(', ')}]`;
    }

    return {
      success: true,
      message: summary,
      data: screenData
    };
  }
});

toolRegistry.register({
  name: 'change_setting',
  description: 'Change a system setting',
  category: 'system',
  parameters: {
    setting: { type: 'string', description: 'Setting to change (sound, animations)', required: true },
    value: { type: 'boolean', description: 'Toggle value (not fully supported, acts as toggle)' }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    const setting = String(args.setting).toLowerCase();
    
    if (setting === 'sound') {
      state.toggleSound();
      return { success: true, message: 'Toggled sound setting' };
    }
    
    if (setting === 'animations') {
      state.toggleAnimations();
      return { success: true, message: 'Toggled animations setting' };
    }
    
    return { success: false, message: `Unknown setting: ${args.setting}` };
  }
});

toolRegistry.register({
  name: 'reset_desktop',
  description: 'Reset desktop to default state',
  category: 'system',
  parameters: {},
  execute: async () => {
    const state = useDesktopStore.getState();
    state.resetDesktop();
    return { success: true, message: 'Reset desktop state' };
  }
});
