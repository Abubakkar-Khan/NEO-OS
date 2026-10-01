# NeedleOS 🪡🖥️

> **Simulated Desktop Operating System with Local AI Tool Calling, Screen-Aware Agentic Pipeline, GSAP Motion, and Live Web Browsing.**

NeedleOS is an in-browser operating system simulation powered by the **Needle 2** agent execution framework. It converts natural-language text or speech commands into verifiable, multi-step desktop actions executed deterministically against an in-memory virtual operating system state.

Designed with a utilitarian **Swiss retro-computing aesthetic** (monochrome `#000000` / `#FFFFFF` palette, 1px precision borders, dense typography), NeedleOS provides an observable platform for running and inspecting agentic workflows.

---

## ⚡ Key Highlights

- **Dual-Screen Architecture**:
  - **Screen A (Desktop)**: Simulated OS environment with draggable windows, taskbar, desktop shortcuts, speech-to-text dictation, virtual filesystem, and native applications.
  - **Screen B (Needle Harness)**: Dedicated observability and debugging interface showing raw model outputs, parsed tool queues, real-time execution traces (latency, parameters, outputs), live OS state snapshots, and a chronological event log.
- **Context & Screen Awareness ("What's in Front")**:
  - The agent understands the active screen state: which window is focused, what note is open in the text editor, current browser URL, and filesystem status.
  - Supports deictic commands like *"What's on my screen?"*, *"Read this note"*, *"Close this"*, *"Minimize this"*, *"Save this"*, and *"Search what's in this note"*.
- **Full Live Web Browser (`iframe` + Reader Engine)**:
  - Embedded sandbox iframe with omnibar, history back navigation, reload, home, and quick bookmarks (Wikipedia, Hacker News, DuckDuckGo, MDN, Example.com).
  - Built-in **Reader / Simulated Mode** for local search queries and domains that restrict iframe embedding via `X-Frame-Options`.
- **GSAP Motion Design**:
  - Window entrance, minimize-to-taskbar, and close animations powered by GSAP.
  - Interactive voice activity indicators and staggered trace card entrance animations.
  - Respects the user's `Settings → Animations` toggle.
- **Multi-Step Tool Orchestration**:
  - Parses complex multi-step compound requests into sequential tool calls:
    > *"Open the text editor, create hello.txt, write 'Hello from Needle', save it, then open the browser and search for Next.js."*
- **Local Speech-to-Text**:
  - One-click microphone button using native Web Speech recognition. Dictated text appears in the command bar for review and editing before execution.

---

## 🏗️ Architecture

```
User Input (Text / Voice)
         ↓
Command Input Bar
         ↓
Desktop Context Snapshot (Active App, Open Note, Browser State, Windows)
         ↓
Agent Runner (AgentRunner.run)
         ↓
Needle 2 Adapter (Local Command Parser / Model Adapter)
         ↓
Structured Tool Call Sequence
         ↓
Schema Validation & Safety Boundaries (validateToolCall)
         ↓
Tool Executor (executeTool)
         ↓
Virtual OS Services (FS, Editor, Browser, System)
         ↓
Zustand Central Store (Desktop State + Harness State)
         ↓
UI Update (Desktop UI + Live Harness Trace)
```

---

## 📦 Applications

| App | Description | Capabilities |
|---|---|---|
| **File Manager** | Virtual filesystem browser | Directory navigation, create file/folder, rename, move, delete, context menu, breadcrumbs. |
| **Text Editor** | In-memory text editor | New, open file, insert text, replace, save, save as, line counter, dirty state indicator. |
| **Browser** | Dual-mode web browser | Live `iframe` sandbox, Reader / Simulated search engine mode, history back, reload, bookmarks. |
| **Settings** | System control center | Sound toggle, GSAP animation toggle, keyboard shortcuts, tool registry inspection, OS reset. |

---

## 🛠️ Registered Tools

All agent capabilities are registered in the central `ToolRegistry` (`src/tools/registry.ts`):

### 1. Desktop Tools (`src/tools/definitions/desktop-tools.ts`)
- `open_app`: Opens an application (`file-manager`, `text-editor`, `browser`, `settings`).
- `close_app`: Closes an application or window ID.
- `focus_app`: Brings a window to the foreground.
- `minimize_app`: Minimizes a window to the taskbar.

### 2. Filesystem Tools (`src/tools/definitions/filesystem-tools.ts`)
- `list_files`: Lists contents of a directory path (default `/`).
- `create_file`: Creates a file at a path with optional initial content.
- `create_folder`: Creates a new folder directory.
- `read_file`: Reads text content from a virtual file path.
- `write_file`: Writes/appends content to a file.
- `rename_file`: Renames a virtual file.
- `rename_folder`: Renames a virtual folder.
- `delete_file`: Deletes a file or directory node.
- `move_file`: Moves a file to another virtual folder.

### 3. Editor Tools (`src/tools/definitions/editor-tools.ts`)
- `open_editor`: Opens the text editor (optionally loading a specific file).
- `get_editor_content`: Inspects the active file and content currently open in the editor.
- `insert_text`: Appends text into the active editor buffer.
- `replace_text`: Replaces the entire active editor buffer.
- `save_file`: Saves modifications to the currently opened file.
- `save_as`: Saves buffer content as a new file in the virtual filesystem.

### 4. Browser Tools (`src/tools/definitions/browser-tools.ts`)
- `open_browser`: Launches the browser window.
- `navigate`: Navigates to a specific URL (loads live iframe or reader page).
- `search`: Executes a query across search results / documentation.
- `go_back`: Returns to the previous URL in browser history.

### 5. System & Inspection Tools (`src/tools/definitions/system-tools.ts`)
- `inspect_screen`: Returns full structured summary of what is on screen (active window, open note, browser URL, open apps).
- `get_time`: Retrieves the current system timestamp.
- `get_system_info`: Returns OS version, model information, and tool count.
- `change_setting`: Toggles system settings (`sound`, `animations`).
- `reset_desktop`: Resets all virtual state back to factory defaults.

---

## 🖥️ Screen B — Needle Harness

Click **Harness Mode** in the taskbar or run commands to view the execution trace:

- **Command**: Exact user command received.
- **Model Output**: Raw structured JSON output from the Needle 2 engine.
- **Tool Queue**: Ordered list of sequential tools with execution statuses (`PENDING`, `RUNNING`, `SUCCESS`, `FAILED`).
- **Execution Trace**: Detailed step-by-step breakdown displaying duration (`ms`), arguments, tool result output, and any caught errors.
- **OS State Snapshot**: Live metrics tracking active app, open windows, virtual filesystem count, editor file name, and dirty state.
- **Event Log**: Chronological audit trail of system events (`USER_INPUT`, `MODEL_CALL`, `TOOL_SELECTED`, `TOOL_VALIDATED`, `TOOL_STARTED`, `TOOL_COMPLETED`, `TOOL_FAILED`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ (Node 20+ recommended)
- npm, pnpm, or yarn

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd NEO-OS

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

---

## 🧪 Acceptance Test Flows

Try typing or dictating these commands in the command bar:

1. **Screen & Context Inspection**:
   - `What's on my screen?` → Executes `inspect_screen`, reporting active windows and open files.
2. **Text Editor Workflow**:
   - `Open the editor, create hello.txt, write "Hello from Needle", save it` → Editor opens, file is created in virtual filesystem, text inserted, file saved.
   - `What does this note say?` → Agent inspects the open note and returns its contents.
   - `Close this` → Closes the active text editor window using deictic resolution.
3. **Filesystem Organization**:
   - `Create a folder called Projects and move hello.txt into it` → Hierarchy updates to `/Projects/hello.txt`.
   - `Rename hello.txt to greeting.txt` → File name updates cleanly.
4. **Live Web Browsing**:
   - `Open the browser and search for Next.js` → Browser launches and displays simulated search results.
   - `Go to en.m.wikipedia.org` → Loads Wikipedia inside the live sandboxed iframe.
5. **Full Multi-Step Sequence**:
   - `Open the editor, create notes.txt, write "Testing NeedleOS", save it, then open the browser and search for Next.js` → All 6 actions execute sequentially with live visual feedback in both Desktop and Harness screens!

---

## 📜 License

MIT License. Built for the NeedleOS demonstration.
