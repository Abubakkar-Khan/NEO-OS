import { toolRegistry } from '../registry';
import { useDesktopStore } from '@/stores/desktop-store';

toolRegistry.register({
  name: 'open_browser',
  description: 'Open the browser application',
  category: 'browser',
  parameters: {},
  execute: async () => {
    const state = useDesktopStore.getState();
    state.openApp('browser');
    return { success: true, message: 'Opened browser' };
  }
});

toolRegistry.register({
  name: 'navigate',
  description: 'Navigate the browser to a specific URL',
  category: 'browser',
  parameters: {
    url: { type: 'string', description: 'URL to navigate to', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    state.browserNavigate(String(args.url));
    return { success: true, message: `Navigated to ${args.url}` };
  }
});

toolRegistry.register({
  name: 'search',
  description: 'Perform a web search in the browser',
  category: 'browser',
  parameters: {
    query: { type: 'string', description: 'Search query', required: true }
  },
  execute: async (args) => {
    const state = useDesktopStore.getState();
    state.browserSearch(String(args.query));
    return { success: true, message: `Searched for ${args.query}` };
  }
});

toolRegistry.register({
  name: 'go_back',
  description: 'Navigate back in browser history',
  category: 'browser',
  parameters: {},
  execute: async () => {
    const state = useDesktopStore.getState();
    state.browserBack();
    return { success: true, message: 'Navigated back in browser' };
  }
});
