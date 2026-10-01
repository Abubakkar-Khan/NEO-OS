# NeedleOS 🪡🖥️

> **Local-First Operating System Simulation Powered by Needle 2 (generation=2), FastAPI, Next.js, and WebSocket Event Streaming.**

NeedleOS is an in-browser operating system simulation controlled through natural-language text and speech commands. It demonstrates the local 14MB AI model, **Needle 2**, operating a simulated desktop environment through structured, atomic tool calls against an in-memory authoritative virtual operating system state.

---

## 🏛️ Core Two-Process Architecture

```text
Next.js (Port 3000)
       ↕ HTTP / WebSocket (/ws)
FastAPI (Port 8000)
       ↓
Needle 2 (cactus-needle, generation=2)
       ↓
Centralized Tool Registry
       ↓
Permission / Validation Layer
       ↓
Tool Executor
       ↓
Virtual OS State (Authoritative In-Memory Store)
       ↓
Event Bus
       ↓
Next.js UI (Desktop + Harness)
```

- **Frontend**: Next.js 16 App Router, React 19, TypeScript, Tailwind CSS, GSAP Motion.
  - The frontend **never directly executes tools or contains Needle logic**.
  - Consumes authoritative state and structured event streams via WebSocket (`/ws`).
- **Backend**: Python 3.13+, FastAPI, `cactus-needle` running **Needle 2** with `generation=2`.
  - Authoritative in-memory virtual filesystem and OS state store.
  - Centralized Tool Registry with atomic tools and permission levels.
  - Asynchronous Event Bus streaming structured `AgentEvent` payloads over WebSocket.

---

## ⚡ Key Highlights

1. **Dual Screens**:
   - **Screen A (Desktop)**: Retro Swiss/utilitarian desktop simulation with draggable rectangular windows, file manager, text editor, browser, settings, and taskbar.
   - **Screen B (Needle Harness)**: Dedicated AI execution and observability screen showing raw user command, Needle 2 model output, tool queues, live execution traces with latency, confidence rating, model reasoning, current OS snapshot, and full event log.
2. **Interactive Needle Mascot**:
   - Minimalist circular mascot with animated eyes (`• •` idle dots, `- -` thinking hyphens, `^ ^` happy carets, `× ×` alert crosses).
   - Powered by GSAP animations (idle float, bounce, expressions).
   - Pops open a retro speech bubble displaying reasoning and answers to queries like *"What's on screen?"*.
3. **Terminal Command History**:
   - Press **ArrowUp (`↑`)** to recall previous prompts and commands (like a real terminal/shell).
   - Press **ArrowDown (`↓`)** to cycle forwards and restore your draft.
   - Persisted across reloads in `localStorage`.
4. **Full Browser Simulation**:
   - Omnibar, history back navigation, reload, and home buttons.
   - Sandbox `iframe` mode for live web browsing with bookmark bar (Wikipedia, Hacker News, DuckDuckGo, MDN, Example.com).
   - Deterministic Reader / Simulated Search engine mode for local queries without network blocking.
5. **Speech-to-Text**:
   - Native microphone dictation with GSAP animated audio activity waves.
   - Transcribed text populates the command input for review and editing before execution.

---

## 🛠️ Registered Atomic Tools

All capabilities are strictly exposed through atomic tools registered in `backend/tools/registry.py`:

| Category | Tool | Parameters | Permission Level | Description |
|---|---|---|---|---|
| **Desktop** | `open_app` | `app` | Automatic | Opens an application (`editor`, `file_manager`, `browser`, `settings`). |
| **Desktop** | `close_app` | `app` | Automatic | Closes an application window. |
| **Desktop** | `focus_app` | `app` | Automatic | Focuses and brings a window to the foreground. |
| **Desktop** | `minimize_app` | `app` | Automatic | Minimizes a window to the taskbar. |
| **Filesystem** | `list_files` | `path` | Automatic | Lists files and folders in a virtual directory. |
| **Filesystem** | `create_file` | `path`, `content?` | Automatic | Creates a new virtual file. |
| **Filesystem** | `create_folder` | `path` | Automatic | Creates a new virtual directory. |
| **Filesystem** | `read_file` | `path` | Automatic | Reads file content. |
| **Filesystem** | `write_file` | `path`, `content` | Automatic | Writes text content to a virtual file. |
| **Filesystem** | `rename_file` | `path`, `new_name` | Automatic | Renames a virtual file. |
| **Filesystem** | `rename_folder` | `path`, `new_name` | Automatic | Renames a virtual folder. |
| **Filesystem** | `delete_file` | `path` | **Require Confirmation** | Deletes a virtual file or folder. |
| **Filesystem** | `move_file` | `source`, `destination`| Automatic | Moves a virtual file to another directory. |
| **Editor** | `open_editor` | `path` | Automatic | Opens editor and loads virtual file. |
| **Editor** | `insert_text` | `path`, `content` | Automatic | Appends text into editor buffer. |
| **Editor** | `replace_text`| `path`, `content` | Automatic | Replaces editor buffer content. |
| **Editor** | `save_file` | `path` | Automatic | Saves buffer to virtual filesystem. |
| **Browser** | `open_browser` | — | Automatic | Launches simulated web browser. |
| **Browser** | `search` | `query` | Automatic | Searches simulated web pages. |
| **Browser** | `navigate` | `url` | Automatic | Navigates to a specific URL. |
| **Browser** | `go_back` | — | Automatic | Navigates back in browser history. |
| **System** | `get_time` | — | Automatic | Returns current system clock time. |
| **System** | `get_system_info` | — | Automatic | Returns OS metadata and tool count. |
| **System** | `change_setting` | `key`, `value` | Automatic | Toggles settings (`sound`, `animations`). |
| **System** | `reset_desktop` | — | **Require Confirmation** | Resets virtual OS to initial state. |

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Python 3.10+ (Python 3.13 recommended)
- Node.js 18+ (Node 20+ recommended)
- `pip install cactus-needle fastapi uvicorn websockets pydantic pytest httpx`
- `npm install`

### 2. Start Local AI Backend (FastAPI + Needle 2)
```bash
# In project root:
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```
Backend will start at `http://127.0.0.1:8000` with WebSocket endpoint at `ws://127.0.0.1:8000/ws`.

### 3. Start Next.js Frontend
```bash
# In project root:
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

Run the complete test suite covering filesystem operations, tool validation, permissions, event bus, and multi-step agent execution:

```bash
python -m pytest backend/tests -v
```

All 15 tests pass out of the box:
```text
backend/tests/test_events.py::test_event_generation_and_bus_subscription PASSED
backend/tests/test_filesystem.py::test_filesystem_initial_structure PASSED
backend/tests/test_filesystem.py::test_filesystem_create_and_read_file PASSED
backend/tests/test_filesystem.py::test_filesystem_write_file PASSED
backend/tests/test_filesystem.py::test_filesystem_create_folder_and_nested_file PASSED
backend/tests/test_filesystem.py::test_filesystem_rename PASSED
backend/tests/test_filesystem.py::test_filesystem_move PASSED
backend/tests/test_filesystem.py::test_filesystem_delete PASSED
backend/tests/test_integration.py::test_full_demo_command_integration PASSED
backend/tests/test_permissions.py::test_automatic_permissions PASSED
backend/tests/test_permissions.py::test_require_confirmation_permissions PASSED
backend/tests/test_permissions.py::test_blocked_execution_without_confirmation PASSED
backend/tests/test_tools.py::test_tool_registry_has_tools PASSED
backend/tests/test_tools.py::test_tool_validation PASSED
backend/tests/test_tools.py::test_tool_execution PASSED
============================= 15 passed in 4.96s ==============================
```

---

## 🎯 Demo Scenario Walkthrough

Try submitting this end-to-end command in the command bar (or press `↑` to recall it):

> **"Open the text editor, create a file called hello.txt, write Hello from Needle, save it, then open the browser and search for Next.js."**

Watch the live execution:
1. **Text Editor** opens in a retro window.
2. `hello.txt` is created inside the virtual filesystem.
3. `"Hello from Needle"` appears in the editor buffer.
4. File is saved and marked clean.
5. **Browser** opens to simulated search results for `"Next.js"`.
6. **Mascot** animates with thinking hyphen eyes `- -` then bounces with happy eyes `^ ^`, displaying reasoning and completion!
7. **Harness Mode** displays every tool call in order, complete with duration, arguments, results, and full audit logs.

---

## 📜 License

MIT License. Built for the NeedleOS technical demonstration.
