import { toolRegistry } from '../registry';
import { useDesktopStore } from '@/stores/desktop-store';

toolRegistry.register({
  name: 'open_editor',
  description: 'Open the text editor, optionally with a file',
  category: 'editor',
  parameters: {
    path: { type: 'string', description: 'Path to file to open' }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    state.openApp('text-editor');
    
    if (args.path) {
      const node = state.getNodeByPath(String(args.path));
      if (!node) return { success: false, message: `File not found: ${args.path}` };
      if (node.type !== 'file') return { success: false, message: `Not a file: ${args.path}` };
      
      state.openFileInEditor(node.id);
      return { success: true, message: `Opened ${args.path} in editor` };
    }
    
    return { success: true, message: 'Opened editor' };
  }
});

toolRegistry.register({
  name: 'get_editor_content',
  description: 'Get the current content and file details of the active editor',
  category: 'editor',
  parameters: {},
  execute: async () => {
    const state = useDesktopStore.getState();
    const file = state.editor?.openFile ? state.filesystem.find(f => f.id === state.editor.openFile) : null;
    const content = state.editor?.content || '';
    return {
      success: true,
      message: `Active file: ${file?.name || 'Untitled'}, Content length: ${content.length} chars`,
      data: {
        file: file?.name || 'Untitled',
        content,
        dirty: state.editor?.dirty || false
      }
    };
  }
});

toolRegistry.register({
  name: 'insert_text',
  description: 'Insert or append text in the active editor',
  category: 'editor',
  parameters: {
    text: { type: 'string', description: 'Text to insert', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    const currentContent = state.editor?.content || '';
    state.setEditorContent(currentContent + String(args.text));
    return { success: true, message: 'Inserted text' };
  }
});

toolRegistry.register({
  name: 'replace_text',
  description: 'Replace all content in the active editor',
  category: 'editor',
  parameters: {
    text: { type: 'string', description: 'New text content', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    state.setEditorContent(String(args.text));
    return { success: true, message: 'Replaced text in editor' };
  }
});

toolRegistry.register({
  name: 'save_file',
  description: 'Save the current file in the editor',
  category: 'editor',
  parameters: {},
  execute: async () => {
    const state = useDesktopStore.getState();
    if (!state.editor?.openFile) return { success: false, message: 'No file currently open in editor to save' };
    
    state.saveEditorFile();
    return { success: true, message: 'Saved file' };
  }
});

toolRegistry.register({
  name: 'save_as',
  description: 'Save the current editor content as a new file',
  category: 'editor',
  parameters: {
    path: { type: 'string', description: 'Full path to save as', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    const path = String(args.path);
    const parts = path.split('/').filter(Boolean);
    const name = parts.pop();
    const parentPath = '/' + parts.join('/');
    
    if (!name) return { success: false, message: `Invalid path: ${path}` };
    
    const parent = state.getNodeByPath(parentPath);
    if (!parent) return { success: false, message: `Parent directory not found: ${parentPath}` };
    
    state.saveEditorFileAs(name, parent.id);
    return { success: true, message: `Saved file as ${path}` };
  }
});
