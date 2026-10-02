# Changes Log (CHANGES.md)

All notable changes and architectural advancements in **NEO-OS** are documented in this file.

---

## [Version 1.3.0] - 2026-10-02

### 1. Fast "/" Slash Commands System
- **Interactive Autocomplete Popover**: Added floating slash command menu triggered whenever the user types `/` in the command bar.
- **14 Built-In Slash Commands**:
  - `/computer` (aliases: `/files`, `/pc`): Instant direct launch of Computer.
  - `/editor` (aliases: `/edit`, `/notes`): Instant launch of Text Editor.
  - `/browser [url|query]` (alias: `/web`): Direct web search or URL navigation.
  - `/settings`: Direct access to system preferences.
  - `/control` (alias: `/harness`): Direct toggle between Desktop Shell and Mission Control Room.
  - `/newfile [name]` (alias: `/touch`): Instant file creation in virtual filesystem.
  - `/newfolder [name]` (alias: `/mkdir`): Instant directory creation.
  - `/search [query]`: Instant web search.
  - `/write [text]`: Direct insert text into active editor.
  - `/save`: Direct file save.
  - `/time`: Instant system clock readout.
  - `/reset`: Fast desktop state restoration.
  - `/clear`: Clear prompt input & command history.
  - `/help`: Print all available fast slash commands.
- **Sub-Millisecond Direct Execution**: Bypasses heavy neural routing loops entirely for slash commands, running direct mutations in `<1ms`.
- **Keyboard Navigation**: Full arrow-key selection (`↑`/`↓`), `Tab`/`Enter` autocomplete, and `Esc` dismissal.

### 2. Main Folder Renamed to "Computer"
- **Desktop Shortcut Renaming**: Replaced "Files" desktop shortcut with **"Computer"** featuring a clean `Monitor` icon.
- **Universal Intent Recognition**: Full natural language recognition for `"Computer"`, `"open computer"`, `"my computer"`, and `"show computer"` across frontend router, backend router agent, and desktop specialist.
- **Window Title Synchronization**: Opening the main folder sets the window title and taskbar badge to **"Computer"**.
- **Virtual Path Breadcrumb**: Breadcrumb root in File Manager prominently displays `Computer`.

### 3. Simplified Mascot
- **Unobtrusive Minimalist Companion**: Replaced the large permanent dialogue balloon with a sleek, non-intrusive 40x40 circular widget in the bottom right corner.
- **Biological Eye Tracking & Blinking**: Maintained smooth pupil gaze tracking the mouse cursor and natural biological blinking intervals.
- **Auto-Dismissing Micro-Toast**: Replaced cluttered buttons with a single-line, auto-dismissing Nothing OS pill notification (`• Ready`, `• Done: Opened Computer`).
- **Tactile Poke Interaction**: Clean elastic pop bounce and audio cue on click without screen obstruction.

### 4. Fast Single-Call Tool Execution (Eliminated 6-8 Redundant Calls)
- **Eliminated Over-Segmentation**: Fixed greedy comma-splitting in `RouterAgent._segment_command`, avoiding unnecessary pipeline fragmentation into 6-8 micro-calls for single or cohesive tasks.
- **Removed Artificial Delays**: Stripped 130ms of `setTimeout` delays in `src/agent/runner.ts`, accelerating sequential local tool calls to instantaneous speed.
- **Direct Keyword Fast-Path**: Canonical requests execute in 1 direct tool call without multi-step roundtrip overhead.

---

## [Version 1.2.0] - 2026-10-02

### 1. 153x Backend Acceleration & Speculative Fast-Path Engine
- **Lazy-Loaded Needle 3 Weights**: Replaced eager startup initialization across `RouterAgent`, `BaseSpecialistAgent`, and `AgentRunner` with on-demand lazy initialization (`_ensure_needle()`). Eliminated 7x redundant RAM weight allocations, accelerating test suite execution from 101.30s down to **0.66s** (153x speedup).
- **Speculative Fast-Path Classification**: Implemented deterministic sub-millisecond classification in `RouterAgent` and specialists for common window, file, and editor commands (<1ms execution). Ambiguous or conversational requests automatically fall back to the Needle 3 neural tool-calling engine.
- **Removed Artificial Delays**: Stripped `time.sleep` and `asyncio.sleep` delays across the tool proxies and coordinator, enabling instantaneous real-time execution.

### 2. Nothing OS Utilitarian Design System (Human-Friendly & Easy on the Eyes)
- **Warm Ceramic Palette**: Replaced harsh high-contrast black boxes with warm ceramic surfaces (`#F4F4F0` canvas, `#FAF9F5` cards, `#FFFFFF` viewports), soft graphite text (`#111111`), and signature **Nothing Red** (`#D71920`) focal accents.
- **Utilitarian Pill & Squircle Geometry**: Implemented friendly rounded pill contours (`rounded-full`), squircle application badges (`rounded-2xl`), dot-matrix NDot typography, and smooth elevations (`window-elevation`, `dock-glass`).
- **4 Built-in Applications Overhauled**:
  - **Text Editor**: Tactile pill toolbar (New, Open, Save with audio cues), dot-matrix line numbering gutter, live word/line/char counters, and Nothing Red unsaved status dot.
  - **File Manager**: Breadcrumb path pills, quick search filter, soft squircle folder badges, item count status footer, and refined context menu.
  - **Web Browser**: Pill omnibar with Nothing Red security dot, bookmark chips, segmented Live/Reader pill switch, and clean reader view.
  - **Settings**: System overview cards, audio cue test button, smooth pill toggle switches, registered tool catalog, and safe desktop reset.

### 3. Alive Character & Interactive Micro-Haptics
- **Alive Needle Mascot**:
  - **Pupil Eye Tracking**: Real-time pupil movement dynamically following the user's cursor position.
  - **Organic Blinking Loop**: Spontaneous natural blinking timers mimicking biological character life.
  - **GSAP Breathing Motion**: Organic scale and hover physics with spring eases.
  - **Interactive Poke Reaction**: Clicking the mascot triggers an elastic pop and conversational bubble response.
- **Synthesized Web Audio API Micro-Haptics**: Zero-asset audio engine (`src/lib/audio.ts`) producing physical mechanical clicks, window focus pops, success chimes, and alert tones with zero external sound files.

### 4. Nothing OS Spotlight Command Bar
- **Global `Cmd+K` / `Ctrl+K` Access**: Instantly brings focus to the command input from anywhere with spring animation.
- **Live Plan Prediction Chips**: Live visual breakdown of predicted multi-agent steps (e.g., `[Desktop: Open Editor] → [Files: Create File]`) rendered as pills before execution.
- **Terminal History & Voice Waveform**: Arrow up/down command recall persisted in `localStorage` and dynamic audio waveform during speech dictation.

---

## [Version 1.1.0] - 2026-10-02

### Needle 3 Model Upgrade (Cactus Compute)
- **Model Upgrade to Needle 3 (`generation=3`)**: Upgraded core AI inference engine from Needle 2 to the latest **Needle 3** released by Cactus Compute (`cactus-needle` 3.0.6, `generation=3`).
- **Local Model Weights Installation**: Downloaded and cached official Needle 3 model weights (`Cactus-Compute/needle3` &rarr; `needle3.cact`) for local-first, zero-cloud execution.
- **Hierarchical Engine Migration**: Migrated Root Router Agent, all 5 Domain Specialist Agents (`FilesAgent`, `DesktopAgent`, `EditorAgent`, `BrowserAgent`, `SystemAgent`), and backend `AgentRunner` to run `Needle(..., generation=3)`.
- **FastAPI Backend Synchronization**: Updated `/` root discovery endpoint and command execution loops to report `"model": "Needle 3 (cactus-needle)"`, `"generation": 3`.
- **Comprehensive Test Suite Verification**:
  - `python -m pytest backend/tests -v`: 15/15 tests passing with Needle 3 local weights.
  - `npm test`: 17/17 Mocha & Chai tests passing.
- **Architectural & Data Flow Diagrams**:
  - Added 5 comprehensive Mermaid diagrams in `README.md`:
    1. Full System Architecture (Frontend, Transport, Server, Hierarchical Agent Core, Virtual OS State).
    2. End-to-End Data Flow Pipeline.
    3. Execution Sequence Diagram (Message chronology from user input to WebSocket UI update).
    4. Multi-Agent Hierarchy & Bounded Catalogs.
    5. State & Permission Lifecycle State Machine.

---

## [Version 1.0.0] - 2026-10-02

### 1. Hierarchical Multi-Agent Architecture (Needle 2)
- **Eliminated Flat Catalog Failure Mode**: Replaced the monolithic 25-tool agent setup with a two-tier hierarchy (`User` &rarr; `Root Router Agent` &rarr; `Domain Specialist Agents` &rarr; `Scoped Toolsets` &rarr; `Virtual OS State`).
- **Dedicated Root Router Agent**: Bounded to 5 classification tools (`route_to_desktop`, `route_to_files`, `route_to_editor`, `route_to_browser`, `route_to_system`). Decomposes compound instructions into sequential workflows with dependency tracking (`dependsOn`).
- **Autonomous Domain Specialists**:
  - `FilesAgent`: 9 bounded filesystem tools (`list_files`, `create_file`, `create_folder`, `read_file`, `write_file`, `rename_file`, `rename_folder`, `move_file`, `delete_file`).
  - `DesktopAgent`: 5 window management tools (`open_app`, `close_app`, `focus_app`, `minimize_app`, `maximize_app`).
  - `EditorAgent`: 5 text editing tools (`open_editor`, `insert_text`, `replace_text`, `save_file`, `save_as`).
  - `BrowserAgent`: 4 web navigation tools (`open_browser`, `navigate`, `search`, `go_back`).
  - `SystemAgent`: 4 system tools (`get_time`, `get_system_info`, `change_setting`, `reset_desktop`).
- **Domain Context Builders**: Specialist agents are injected with real-time state snapshots (`open_file`, `current_directory`, `active_app`, `windows`, `history`), enabling them to autonomously inspect state, formulate actions, and make decisions without hallucinations.
- **Inter-Agent Handoffs**: Added `handoff` and `route_selected` events streamed over WebSockets to capture inter-agent delegation.

### 2. Control Room Telemetry & Harness Overhaul
- **Mission Control Room Interface**: Replaced static panels with a live mission-control dashboard.
- **Active Pipeline Topology**: Real-time ASCII/flow diagram displaying pipeline progression from `Input` &rarr; `Root Router` &rarr; `Domain Specialist` &rarr; `Virtual Executor` &rarr; `WebSocket Synchrony`.
- **Live Agent Execution Graph**: Visual node tree showing Root Router status, step-by-step specialist nodes with badges (`STANDBY`, `EXECUTING`, `COMPLETED`), sub-task request previews, and domain-scoped tool boundaries.
- **Real-Time Telemetry & OS Metrics**: Dedicated telemetry cards displaying active window app ID, open processes, editor byte count, buffer dirty state, and virtual filesystem node counts.
- **Inter-Agent Handoff Audit Log**: Real-time trail logging each handover with verification status.

### 3. Swiss 60-30-10 Utilitarian Design System
- **Replaced Green CRT Scanlines**: Removed ThreeUI phosphor screen in favor of a clean, high-contrast Swiss modernist interface.
- **60% Dominant Background**: Clean off-white surface (`#F8F9FA` / `#FFFFFF`) structured by an architectural geometric dot pattern.
- **30% Structural Monochrome**: Deep black and graphite frames (`#111111` / `#1E1E1E`), 1px borders (`#262626` / `#E2E4E8`), and monospace system fonts.
- **10% Vibrant Liveness**: ChatGPT-style multi-color indicators (Emerald `#10A37F`, Cobalt `#3B82F6`, Amber `#F59E0B`, Purple `#8B5CF6`) across the taskbar, active agent pills, and mascot dialogue.
- **GSAP Animations**: Micro-interactions for window opening, active status pulsing, and mascot expressions.

### 4. Interactive Mascot & Command Line Usability
- **Needle Mascot**: Circular mascot with interactive emotional eye states (`• •` idle dots, `- -` thinking hyphens, `^ ^` happy carets, `× ×` alert crosses) and speech bubbles.
- **Command History**: Added terminal-style prompt recall using **ArrowUp (`↑`)** and **ArrowDown (`↓`)** keys, persisted across sessions in `localStorage`.
- **Default Input Focus**: Cursor autofocuses on the command bar on load and clicking the desktop surface returns focus to the prompt.
- **Speech Dictation**: Web Speech API audio dictation with animated activity indicators.

### 5. Extensive Testing Suites (Pytest + Mocha/Chai)
- **Pytest Backend Suite (Python)**: 15/15 tests passing across filesystem CRUD, permissions, events bus, and end-to-end integration workflows.
- **Mocha & Chai Test Suite (TypeScript)**: 17/17 tests passing across:
  - `tests/filesystem.spec.ts`: Path resolution, directory traversal, node existence, full path calculation.
  - `tests/browser.spec.ts`: Search engine matching, fallback generation, HTML page generation.
  - `tests/agent.spec.ts`: Natural language parser, quoting preservation, 5-step compound instruction decomposition, and desktop context deictic resolution.

### 6. Project Rebranding
- Formalized project name as **NEO-OS** across `package.json`, `layout.tsx`, `Taskbar.tsx`, `Settings.tsx`, `Harness.tsx`, and `backend/app.py`.
