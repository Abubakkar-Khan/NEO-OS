# Changes Log (CHANGES.md)

All notable changes and architectural advancements in **NEO-OS** are documented in this file.

---

## [Version 1.1.0] - 2026-10-02

### Needle 3 Model Upgrade (Cactus Compute)
- **Model Upgrade to Needle 3 (`generation=3`)**: Upgraded core AI inference engine from Needle 2 to the latest **Needle 3** released by Cactus Compute (`cactus-needle` 3.0.6, `generation=3`).
- **Local Model Weights Installation**: Downloaded and cached official Needle 3 model weights (`Cactus-Compute/needle3` &rarr; `needle3.cact`) for local-first, zero-cloud execution.
- **Hierarchical Engine Migration**: Migrated Root Router Agent, all 5 Domain Specialist Agents (`FilesAgent`, `DesktopAgent`, `EditorAgent`, `BrowserAgent`, `SystemAgent`), and backend `AgentRunner` to run `Needle(..., generation=3)`.
- **FastAPI Backend Synchronization**: Updated `/` root discovery endpoint and command execution loops to report `"model": "Needle 3 (cactus-needle)"`, `"generation": 3`.
- **Frontend & Mission Control Alignment**: Updated `Settings.tsx`, `AgentExecutionGraph.tsx`, `layout.tsx`, `api-client.ts`, and `Mascot.tsx` to reflect Needle 3 engine status.
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
