import { expect } from 'chai';
import { LocalNeedleAdapter } from '../src/agent/needle-adapter';
import { DesktopContext } from '../src/lib/types';

describe('LocalNeedleAdapter Agent Parser (Mocha & Chai)', () => {
  const adapter = new LocalNeedleAdapter();

  it('parses a single app open instruction into open_app tool call', async () => {
    const calls = await adapter.parseCommand('Open the text editor', []);
    expect(calls).to.be.an('array').with.lengthOf(1);
    expect(calls[0].name).to.equal('open_app');
    expect(calls[0].arguments).to.deep.equal({ app: 'text-editor' });
  });

  it('parses file creation with clean path and filename', async () => {
    const calls = await adapter.parseCommand('Create a file called hello.txt', []);
    expect(calls).to.be.an('array').with.lengthOf(1);
    expect(calls[0].name).to.equal('create_file');
    expect(calls[0].arguments.path).to.equal('/hello.txt');
  });

  it('preserves exact quoted content for text editor writing', async () => {
    const calls = await adapter.parseCommand('Write "Hello from NEO-OS agent!" into the file', []);
    expect(calls).to.be.an('array').with.lengthOf(1);
    expect(calls[0].name).to.equal('insert_text');
    expect(calls[0].arguments.text).to.equal('Hello from NEO-OS agent!');
  });

  it('parses web search query accurately', async () => {
    const calls = await adapter.parseCommand('search for Next.js documentation', []);
    expect(calls).to.be.an('array').with.lengthOf(1);
    expect(calls[0].name).to.equal('search');
    expect(calls[0].arguments.query).to.include('Next.js');
  });

  it('decomposes the full 5-step benchmark compound instruction', async () => {
    const cmd = 'Open the text editor, create a file called hello.txt, write "Hello World", save it, then open the browser and search for Next.js';
    const calls = await adapter.parseCommand(cmd, []);

    expect(calls.length).to.be.at.least(5);
    const names = calls.map(c => c.name);
    expect(names).to.include('open_app');
    expect(names).to.include('create_file');
    expect(names).to.include('insert_text');
    expect(names).to.include('save_file');
    expect(names).to.include('search');
  });

  it('leverages desktop context to resolve deictic references', async () => {
    const context: DesktopContext = {
      activeApp: 'text-editor',
      activeWindowTitle: 'Text Editor - /todo.txt',
      activeWindowId: 'win_123',
      openWindows: [{ id: 'win_123', appId: 'text-editor', title: 'Text Editor', minimized: false }],
      editor: {
        isOpen: true,
        activeFileId: 'f1',
        activeFileName: 'todo.txt',
        content: 'Item 1\nItem 2',
        dirty: true
      },
      browser: {
        isOpen: false,
        url: '',
        hasSearchResults: false,
        searchResultsCount: 0
      },
      filesystem: {
        filesCount: 4,
        foldersCount: 2
      }
    };

    const calls = await adapter.parseCommand('Save this file', [], context);
    expect(calls).to.be.an('array').with.lengthOf(1);
    expect(calls[0].name).to.equal('save_file');
  });
});
