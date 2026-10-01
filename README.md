# NEO-OS 🖥️⚡

> **Local-First Operating System Simulation Powered by a Hierarchical Multi-Agent Architecture (Needle 2, generation=2), Swiss 60-30-10 Design System, FastAPI, Next.js, and WebSocket Event Streaming.**

**NEO-OS** is an in-browser operating system simulation controlled through natural-language text and speech commands. It demonstrates how a tiny local tool-calling model (**Needle 2**, 14MB) operates a simulated desktop environment through a **hierarchical multi-agent network** consisting of a dedicated Root Router Agent and specialized domain specialist agents acting on an authoritative, in-memory virtual operating system state.

---

## 🏛️ Hierarchical Multi-Agent Architecture

Instead of exposing one flat model to an overwhelming catalog of 25+ tools, **NEO-OS** organizes execution into a modular, two-tier hierarchical tree:

```text
User Request
     ↓
Root Router Agent (Needle 2, generation=2)
     ├── [route_to_desktop] → Desktop Specialist Agent (5 bounded tools)
     ├── [route_to_files]   → Files Specialist Agent   (9 bounded tools)
     ├── [route_to_editor]  → Editor Specialist Agent  (5 bounded tools)
     ├── [route_to_browser] → Browser Specialist Agent (4 bounded tools)
     └── [route_to_system]  → System Specialist Agent  (4 bounded tools)
                                     ↓
                          Authoritative Tool Executor
                                     ↓
                          Shared Virtual OS State
                                     ↓
                       Event Bus (Handoffs & Stream)
                                     ↓
                       Next.js (Desktop Shell & Harness)
```

### Architectural Principles:
1. **Root Router Agent**: Dedicated routing agent with a strictly bounded 5-tool catalog (`route_to_desktop`, `route_to_files`, `route_to_editor`, `route_to_browser`, `route_to_system`). Decomposes complex compound requests into ordered, multi-domain workflow steps with dependency graph tracking (`dependsOn`).
2. **Domain Specialists**: Each specialist is equipped only with its domain-specific tools:
   - **Files Agent**: `list_files`, `create_file`, `create_folder`, `read_file`, `write_file`, `rename_file`, `rename_folder`, `move_file`, `delete_file`.
   - **Desktop Agent**: `open_app`, `close_app`, `focus_app`, `minimize_app`, `maximize_app`.
   - **Editor Agent**: `open_editor`, `insert_text`, `replace_text`, `save_file`, `save_as`.
   - **Browser Agent**: `open_browser`, `navigate`, `search`, `go_back`.
   - **System Agent**: `get_time`, `get_system_info`, `change_setting`, `reset_desktop`.
3. **Agent Coordinator & Context Builders**: Injects domain-specific context snapshots (e.g. open editor buffer, current directory tree, active browser tabs) and emits explicit `AgentHandoff` audit events between agents.
4. **Calibrated Confidence**: Uses Needle 2's built-in confidence scoring with fallback guardrails for 100% execution reliability.

---

## 🎨 Swiss 60-30-10 Design System

NEO-OS follows the **60-30-10 interior & visual design rule** combined with modern ChatGPT-inspired vibrant accents:

- **60% Dominant Background**: Clean Swiss off-white (`#F8F9FA` / `#FFFFFF`) structured by a subtle architectural geometric dot grid.
- **30% Structural Monochrome**: Deep black and charcoal window chrome (`#111111` / `#1E1E1E`), 1px crisp borders (`#262626` / `#E2E4E8`), and high-legibility monospace system typography.
- **10% Vibrant Liveness & GSAP Motion**:
  - ChatGPT-style colorful dot indicators (Emerald `#10A37F`, Cobalt `#3B82F6`, Amber `#F59E0B`, Purple `#8B5CF6`) in the taskbar brand badge, active agent pills, and mascot dialogue.
  - Interactive GSAP micro-interactions for window opening, focusing, minimization, and active agent status pulse.

---

## ⚡ Key Features

1. **Dual Screens**:
   - **Screen A (Desktop Shell)**: Utilitarian desktop simulation with draggable, resizable windows, File Manager, Text Editor, Browser, Settings, and Taskbar.
   - **Screen B (NEO-OS Harness)**: AI execution graph interface visualizing the Root Router, multi-step agent handoffs, confidence ratings, isolated tool boundaries, and live event audit trails.
2. **Interactive Mascot**:
   - Minimalist circular mascot with animated eyes (`• •` idle dots, `- -` thinking hyphens, `^ ^` happy carets, `× ×` alert crosses).
   - Real-time speech bubble displaying model reasoning and responses to contextual queries like *"What's on screen?"*.
3. **Terminal Command History**:
   - Press **ArrowUp (`↑`)** to recall previous prompts (persisted in `localStorage`).
   - Press **ArrowDown (`↓`)** to cycle forward and restore current drafts.
4. **Full Browser Simulation**:
   - Dual-mode browser supporting simulated fast search engine responses as well as real sandboxed `iframe` web browsing with quick bookmarks (Wikipedia, Hacker News, DuckDuckGo, MDN).
5. **Speech Dictation**:
   - Native Web Speech microphone input with animated audio pulse. Transcribes voice commands directly into the prompt bar for review and execution.

---

## 🛠️ Complete Tool Catalog

All actions are strictly executed via atomic tools registered in `backend/tools/registry.py`:

| Domain | Tool | Parameters | Permission Level | Description |
|---|---|---|---|---|
| **Desktop** | `open_app` | `app` | Automatic | Opens an app window (`editor`, `files`, `browser`, `settings`). |
| **Desktop** | `close_app` | `app` | Automatic | Closes an application window. |
| **Desktop** | `focus_app` | `app` | Automatic | Brings an application window to focus. |
| **Desktop** | `minimize_app` | `app` | Automatic | Minimizes a window to the taskbar. |
| **Desktop** | `maximize_app` | `app` | Automatic | Toggles window maximization. |
| **Filesystem** | `list_files` | `path` | Automatic | Lists files and folders in virtual directory. |
| **Filesystem** | `create_file` | `path`, `content?` | Automatic | Creates a new virtual file. |
| **Filesystem** | `create_folder` | `path` | Automatic | Creates a new virtual directory. |
| **Filesystem** | `read_file` | `path` | Automatic | Reads content from virtual file. |
| **Filesystem** | `write_file` | `path`, `content` | Automatic | Writes text to virtual file. |
| **Filesystem** | `rename_file` | `path`, `new_name` | Automatic | Renames a virtual file. |
| **Filesystem** | `rename_folder` | `path`, `new_name` | Automatic | Renames a virtual folder. |
| **Filesystem** | `delete_file` | `path` | **Require Confirmation** | Deletes a virtual file or folder. |
| **Filesystem** | `move_file` | `source`, `destination`| Automatic | Moves a file to another folder. |
| **Editor** | `open_editor` | `path` | Automatic | Opens editor buffer for virtual file. |
| **Editor** | `insert_text` | `path?`, `content` | Automatic | Appends text into editor buffer. |
| **Editor** | `replace_text`| `path?`, `content` | Automatic | Replaces editor buffer content. |
| **Editor** | `save_file` | `path?` | Automatic | Saves buffer to virtual filesystem. |
| **Editor** | `save_as` | `path` | Automatic | Saves buffer as a new virtual file. |
| **Browser** | `open_browser` | — | Automatic | Launches simulated web browser. |
| **Browser** | `search` | `query` | Automatic | Searches simulated web pages. |
| **Browser** | `navigate` | `url` | Automatic | Navigates to a specific URL. |
| **Browser** | `go_back` | — | Automatic | Navigates back in browser history. |
| **System** | `get_time` | — | Automatic | Returns current system clock time. |
| **System** | `get_system_info` | — | Automatic | Returns OS metadata and tool statistics. |
| **System** | `change_setting` | `key`, `value` | Automatic | Toggles system preferences (`sound`, `animations`). |
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
Backend starts at `http://127.0.0.1:8000` with WebSocket endpoint at `ws://127.0.0.1:8000/ws`.

### 3. Start Next.js Frontend
```bash
# In project root:
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Testing Suite

Run the complete test suite verifying filesystem operations, tool validation, security permissions, event bus, and multi-agent coordination:

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
============================= 15 passed in 25.72s =============================
```

---

## 🎯 Demo Scenario Walkthrough

Try running the multi-agent compound command (or press `↑` to recall it):

> **"Open the text editor, create a file called hello.txt, write Hello from Needle, save it, then open the browser and search for Next.js."**

### Execution Progression:
1. **Root Router Agent** decomposes the instruction into 5 sequential steps with dependency tracking.
2. **Desktop Agent** receives handoff and opens Text Editor.
3. **Files Agent** receives handoff and creates `/hello.txt`.
4. **Editor Agent** receives handoff, inserts text, and commits the file to the virtual filesystem.
5. **Browser Agent** receives handoff, launches the browser, and executes search for `Next.js`.
6. **Mascot** animates with thinking eyes `- -` and celebrates completion `^ ^` while displaying reasoning summary.
7. Switch to **Harness Graph** mode in the taskbar to inspect the live multi-agent execution tree and handoff history!

---

## 📜 License

MIT License. Built for NEO-OS.
