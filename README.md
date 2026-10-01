# NEO-OS

> A local-first operating system simulation powered by a hierarchical multi-agent architecture (Needle 3, generation=3), Swiss 60-30-10 design system, FastAPI, Next.js, and WebSocket event streaming.

NEO-OS is an in-browser operating system simulation controlled through natural-language text and speech commands. It demonstrates how a local tool-calling model (Needle 3 by Cactus Compute) operates a simulated desktop environment through a hierarchical multi-agent network consisting of a dedicated Root Router Agent and specialized domain specialist agents acting on an authoritative, in-memory virtual operating system state.

---

## Table of Contents

- [Overview](#overview)
- [System & Architecture Diagrams](#system--architecture-diagrams)
  - [1. Full System Architecture Diagram](#1-full-system-architecture-diagram)
  - [2. End-to-End Data Flow Diagram](#2-end-to-end-data-flow-diagram)
  - [3. Execution Sequence Diagram](#3-execution-sequence-diagram)
  - [4. Multi-Agent Hierarchy & Tool Catalogs](#4-multi-agent-hierarchy--tool-catalogs)
  - [5. State & Permission Lifecycle Diagram](#5-state--permission-lifecycle-diagram)
- [Hierarchical Multi-Agent Architecture](#hierarchical-multi-agent-architecture)
  - [Architectural Principles](#architectural-principles)
  - [Domain Specialist Agents](#domain-specialist-agents)
- [Swiss 60-30-10 Design System](#swiss-60-30-10-design-system)
- [Control Room Interface & Telemetry](#control-room-interface--telemetry)
- [Core Features](#core-features)
- [Registered Atomic Tools Catalog](#registered-atomic-tools-catalog)
- [Quick Start Guide](#quick-start-guide)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Testing Suites](#testing-suites)
  - [Backend Tests (Pytest)](#backend-tests-pytest)
  - [Frontend & Unit Tests (Mocha / Chai)](#frontend--unit-tests-mocha--chai)
- [Demo Scenario Walkthrough](#demo-scenario-walkthrough)
- [Changelog & Documentation](#changelog--documentation)
- [License](#license)

---

## Overview

NEO-OS simulates a desktop operating system with windows, applications, files, and settings inside the browser. Rather than invoking tools directly from the frontend or exposing a single large model to every system capability, NEO-OS decouples intent understanding into specialized agents. A lightweight Root Router agent classifies user requests into structured sub-tasks, dispatches them to domain specialists with isolated toolsets, and streams real-time telemetry back to a control room interface.

---

## System & Architecture Diagrams

### 1. Full System Architecture Diagram

The system operates across a dual-tier model: a Next.js 16 frontend rendering the desktop environment and control room harness, paired with a FastAPI backend running Needle 3 on local weights with a real-time event bus.

```mermaid
flowchart TD
    subgraph Client["Frontend Client (Next.js 16 + React 19 + TypeScript)"]
        UI_Desktop["Desktop Shell & Window Manager"]
        UI_Harness["Harness Mission Control Room"]
        UI_Mascot["Interactive Needle Mascot"]
        Store_Desktop["Zustand Desktop Store"]
        Store_Harness["Zustand Harness Store"]
        UI_Desktop --> Store_Desktop
        UI_Harness --> Store_Harness
        UI_Mascot --> Store_Harness
    end

    subgraph Transport["Transport Layer"]
        HTTP["HTTP REST API (/api/run, /api/state, /api/tools)"]
        WS["WebSocket Duplex Channel (/ws)"]
    end

    subgraph Server["Backend Server (FastAPI + Python 3.13)"]
        API_Router["FastAPI Application Router"]
        Conn_Mgr["WebSocket Connection Manager"]
        Event_Bus["Authoritative Real-Time Event Bus"]
        Perm_Gate["Permission & Validation Layer"]
        Executor["Atomic Tool Executor"]
    end

    subgraph Agent_Core["Hierarchical AI Engine (Needle 3, generation=3)"]
        Coord["Agent Coordinator"]
        Router["Root Router Agent (5 Routing Tools)"]
        subgraph Specialists["Domain Specialist Agents"]
            Desktop_Sp["Desktop Specialist"]
            Files_Sp["Files Specialist"]
            Editor_Sp["Editor Specialist"]
            Browser_Sp["Browser Specialist"]
            System_Sp["System Specialist"]
        end
        Local_Weights[("Local Needle 3 Weights (needle3.cact)")]
    end

    subgraph State_Layer["In-Memory Virtual OS State"]
        VFS[("Virtual Filesystem (In-Memory Tree)")]
        Proc_Table["Window & Process Table"]
        Editor_Buffer["Text Editor Buffer State"]
        Browser_Hist["Browser History & Search Index"]
    end

    Store_Desktop <--> HTTP
    Store_Harness <--> WS
    HTTP --> API_Router
    WS <--> Conn_Mgr
    Conn_Mgr <--> Event_Bus
    API_Router --> Coord
    Coord --> Router
    Router --> Specialists
    Specialists --> Local_Weights
    Specialists --> Perm_Gate
    Perm_Gate --> Executor
    Executor --> State_Layer
    State_Layer --> Event_Bus
    Event_Bus --> Conn_Mgr
```

---

### 2. End-to-End Data Flow Diagram

Illustrates the progression of a user instruction through intent decomposition, specialist execution, state mutation, and real-time telemetry streaming.

```mermaid
flowchart LR
    A["User Input (Text / Speech)"] --> B["Command Input Bar"]
    B --> C["FastAPI /api/run"]
    C --> D["Agent Coordinator"]
    D --> E["Root Router Agent (Needle 3)"]
    E --> F["Workflow Decomposition (Ordered Steps + Dependencies)"]
    F --> G["Domain Specialists (Scoped Execution)"]
    G --> H["Context Injection (VFS & Window State)"]
    H --> I["Permission Gate (Automatic / Confirmation)"]
    I --> J["Atomic Tool Executor"]
    J --> K["Virtual OS State Mutation"]
    K --> L["Event Bus Broadcast"]
    L --> M["WebSocket Push (/ws)"]
    M --> N["Mission Control Telemetry & Desktop UI Sync"]
```

---

### 3. Execution Sequence Diagram

Detailed chronology showing message passing, event emissions, context extraction, and UI updates for a compound user request.

```mermaid
sequenceDiagram
    autonumber
    actor User as User
    participant Frontend as Next.js Desktop / Harness
    participant Backend as FastAPI Server
    participant Bus as Event Bus
    participant Coordinator as Agent Coordinator
    participant Router as Root Router Agent (Needle 3)
    participant Specialist as Domain Specialist
    participant Executor as Tool Executor
    participant State as Virtual OS State

    User->>Frontend: Types or speaks compound command
    Frontend->>Backend: POST /api/run { command: "..." }
    Backend->>Coordinator: Initialize execution pipeline
    Coordinator->>Bus: Emit user_input event
    Bus-->>Frontend: WebSocket push: user_input
    Coordinator->>Bus: Emit model_call (Needle 3)
    Coordinator->>Router: Decompose request into domain workflow
    Router-->>Coordinator: Return Workflow (steps, dependencies, confidence)
    Coordinator->>Bus: Emit route_selected (workflow topology)
    Bus-->>Frontend: WebSocket push: route_selected

    loop For each workflow step
        Coordinator->>State: Extract domain state snapshot
        State-->>Coordinator: Return context (open_file, current_dir, windows)
        Coordinator->>Bus: Emit handoff (source: router, target: specialist)
        Bus-->>Frontend: WebSocket push: handoff
        Coordinator->>Specialist: Execute sub-task with context
        Specialist->>Bus: Emit tool_selected & tool_started
        Bus-->>Frontend: WebSocket push: tool telemetry
        Specialist->>Executor: Execute atomic tool (e.g., create_file)
        Executor->>State: Mutate in-memory virtual state
        State-->>Executor: State mutation confirmed
        Executor->>Bus: Emit tool_completed & state_changed
        Bus-->>Frontend: WebSocket push: tool_completed & state_changed
        Specialist-->>Coordinator: Step execution completed
    end

    Coordinator->>Bus: Emit agent_finished event
    Bus-->>Frontend: WebSocket push: agent_finished
    Backend-->>Frontend: Return run summary { status: "completed" }
    Frontend->>User: Update Desktop Windows & Mascot message
```

---

### 4. Multi-Agent Hierarchy & Tool Catalogs

Displays the separation of concerns between the Root Router Agent and Domain Specialists, showing each agent's strictly bounded tool catalog.

```mermaid
flowchart TD
    Prompt["User Request: Text or Speech"] --> Router["Root Router Agent (Needle 3, generation=3)"]

    subgraph RouterCatalog["Router Routing Tools (5)"]
        R1["route_to_desktop"]
        R2["route_to_files"]
        R3["route_to_editor"]
        R4["route_to_browser"]
        R5["route_to_system"]
    end

    Router --- RouterCatalog

    Router -->|Desktop Intent| D_Agent["Desktop Specialist Agent"]
    Router -->|Files Intent| F_Agent["Files Specialist Agent"]
    Router -->|Editor Intent| E_Agent["Editor Specialist Agent"]
    Router -->|Browser Intent| B_Agent["Browser Specialist Agent"]
    Router -->|System Intent| S_Agent["System Specialist Agent"]

    subgraph D_Tools["Desktop Tools (5)"]
        open_app["open_app"]
        close_app["close_app"]
        focus_app["focus_app"]
        minimize_app["minimize_app"]
        maximize_app["maximize_app"]
    end

    subgraph F_Tools["Files Tools (9)"]
        list_files["list_files"]
        create_file["create_file"]
        create_folder["create_folder"]
        read_file["read_file"]
        write_file["write_file"]
        rename_file["rename_file"]
        rename_folder["rename_folder"]
        move_file["move_file"]
        delete_file["delete_file (Requires Confirmation)"]
    end

    subgraph E_Tools["Editor Tools (5)"]
        open_editor["open_editor"]
        insert_text["insert_text"]
        replace_text["replace_text"]
        save_file["save_file"]
        save_as["save_as"]
    end

    subgraph B_Tools["Browser Tools (4)"]
        open_browser["open_browser"]
        navigate["navigate"]
        search["search"]
        go_back["go_back"]
    end

    subgraph S_Tools["System Tools (4)"]
        get_time["get_time"]
        get_system_info["get_system_info"]
        change_setting["change_setting"]
        reset_desktop["reset_desktop (Requires Confirmation)"]
    end

    D_Agent --- D_Tools
    F_Agent --- F_Tools
    E_Agent --- E_Tools
    B_Agent --- B_Tools
    S_Agent --- S_Tools

    D_Tools --> Exec["Authoritative Tool Executor"]
    F_Tools --> Exec
    E_Tools --> Exec
    B_Tools --> Exec
    S_Tools --> Exec

    Exec --> VOS[("Authoritative Virtual OS State")]
```

---

### 5. State & Permission Lifecycle Diagram

Finite-state model representing how instructions transition through validation, permission checks, execution, and broadcast.

```mermaid
stateDiagram-v2
    [*] --> Idle: OS Boot & WebSocket Handshake
    Idle --> IngestingCommand: User Input via Prompt / Speech
    IngestingCommand --> RoutingWorkflow: Root Router Decomposition
    RoutingWorkflow --> ContextInjection: Snapshot Current OS State
    ContextInjection --> PermissionCheck: Specialist Selects Tool

    state PermissionCheck {
        [*] --> CheckLevel
        CheckLevel --> AutomaticPermission: Level == Automatic
        CheckLevel --> ConfirmationRequired: Level == Require Confirmation
        ConfirmationRequired --> Approved: User Approves Action
        ConfirmationRequired --> Blocked: User Cancels Action
    }

    AutomaticPermission --> ToolExecuting
    Approved --> ToolExecuting
    Blocked --> StepAborted: Emit Warning Telemetry

    ToolExecuting --> StateMutating: In-Memory VFS / Window Update
    StateMutating --> EventBroadcasting: Emit tool_completed & state_changed
    EventBroadcasting --> StepCompleted: Check Remaining Workflow Steps
    StepAborted --> StepCompleted

    StepCompleted --> ContextInjection: Next Step in Workflow
    StepCompleted --> Finished: All Steps Completed
    Finished --> Idle: Agent Finished Telemetry Emitted
```

---

## Hierarchical Multi-Agent Architecture

### Architectural Principles

1. **Root Router Agent**: The router agent has a strictly bounded catalog of 5 routing tools (`route_to_desktop`, `route_to_files`, `route_to_editor`, `route_to_browser`, `route_to_system`). It decomposes complex instructions into ordered workflow steps with dependency tracking (`dependsOn`). It never touches virtual files or UI windows directly.
2. **Autonomous Domain Specialists**: Each specialist is equipped only with tools required for its domain, preventing tool selection collisions.
3. **Context Injection**: Before a specialist executes, the agent coordinator passes a snapshot of current system state (e.g. active file buffer, current directory tree, open windows). The specialist inspects this context to resolve references like "this note", "save it", or "here".
4. **Calibrated Confidence**: Built on Needle 3's calibrated confidence rating, ensuring fallback handling when ambiguous user phrases arise.

### Domain Specialist Agents

- **Files Agent**: `list_files`, `create_file`, `create_folder`, `read_file`, `write_file`, `rename_file`, `rename_folder`, `move_file`, `delete_file`.
- **Desktop Agent**: `open_app`, `close_app`, `focus_app`, `minimize_app`, `maximize_app`.
- **Editor Agent**: `open_editor`, `insert_text`, `replace_text`, `save_file`, `save_as`.
- **Browser Agent**: `open_browser`, `navigate`, `search`, `go_back`.
- **System Agent**: `get_time`, `get_system_info`, `change_setting`, `reset_desktop`.

---

## Swiss 60-30-10 Design System

NEO-OS is styled around a high-contrast Swiss modernist aesthetic:

- **60% Dominant Background**: Clean off-white surface (`#F8F9FA` / `#FFFFFF`) patterned with an architectural dot grid.
- **30% Structural Monochrome**: Deep black and graphite chrome (`#111111` / `#1E1E1E`), 1px borders (`#262626` / `#E2E4E8`), and monospace system typography.
- **10% Vibrant Accents**: Distinctive dot indicators (Emerald `#10A37F`, Cobalt `#3B82F6`, Amber `#F59E0B`, Purple `#8B5CF6`) for live execution status, taskbar badges, and mascot dialogue.
- **Motion & Micro-Interactions**: Built using GSAP for window opening, active agent pulse, and focus transitions.

---

## Control Room Interface & Telemetry

Switching to the Harness view reveals the Mission Control Room:

- **Active Pipeline Topology**: Flowchart visualizing pipeline progression from input through the router, domain specialists, and WebSocket synchrony.
- **Multi-Agent Execution Graph**: Live tree displaying the Root Router node, each decomposed sub-step, target domain specialist, confidence score, and isolated tool boundaries.
- **Virtual OS Telemetry**: Metric cards showing active window ID, open processes, editor byte count, buffer dirty status, and virtual filesystem counts.
- **Inter-Agent Handoff Audit Log**: Real-time log displaying delegation between agents with verified payload states.

---

## Core Features

- **Dual Screens**: Switch seamlessly between Desktop Shell mode and Harness Control Room mode.
- **Interactive Mascot**: Minimalist circular mascot with expressive eye states (`• •` idle dots, `- -` thinking hyphens, `^ ^` happy carets, `× ×` alert crosses) showing real-time reasoning summaries.
- **Terminal Command History**: Use ArrowUp (`↑`) and ArrowDown (`↓`) to cycle through command history, persisted in `localStorage`.
- **Default Focus**: Command input is automatically focused on startup and background clicks refocus the prompt.
- **Full Browser Simulation**: Fast simulated search engine mode and live sandboxed iframe browsing with bookmarked sites (Wikipedia, Hacker News, DuckDuckGo, MDN).
- **Speech-to-Text**: Web Speech API dictation with animated activity indicators.

---

## Registered Atomic Tools Catalog

| Domain | Tool | Parameters | Permission Level | Description |
|---|---|---|---|---|
| Desktop | `open_app` | `app` | Automatic | Opens an app window (`editor`, `files`, `browser`, `settings`). |
| Desktop | `close_app` | `app` | Automatic | Closes an application window. |
| Desktop | `focus_app` | `app` | Automatic | Brings an application window to focus. |
| Desktop | `minimize_app` | `app` | Automatic | Minimizes a window to the taskbar. |
| Desktop | `maximize_app` | `app` | Automatic | Toggles window maximization. |
| Filesystem | `list_files` | `path` | Automatic | Lists files and folders in virtual directory. |
| Filesystem | `create_file` | `path`, `content?` | Automatic | Creates a new virtual file. |
| Filesystem | `create_folder` | `path` | Automatic | Creates a new virtual directory. |
| Filesystem | `read_file` | `path` | Automatic | Reads content from virtual file. |
| Filesystem | `write_file` | `path`, `content` | Automatic | Writes text to virtual file. |
| Filesystem | `rename_file` | `path`, `new_name` | Automatic | Renames a virtual file. |
| Filesystem | `rename_folder` | `path`, `new_name` | Automatic | Renames a virtual folder. |
| Filesystem | `delete_file` | `path` | Require Confirmation | Deletes a virtual file or folder. |
| Filesystem | `move_file` | `source`, `destination`| Automatic | Moves a file to another folder. |
| Editor | `open_editor` | `path` | Automatic | Opens editor buffer for virtual file. |
| Editor | `insert_text` | `path?`, `content` | Automatic | Appends text into editor buffer. |
| Editor | `replace_text`| `path?`, `content` | Automatic | Replaces editor buffer content. |
| Editor | `save_file` | `path?` | Automatic | Saves buffer to virtual filesystem. |
| Editor | `save_as` | `path` | Automatic | Saves buffer as a new virtual file. |
| Browser | `open_browser` | — | Automatic | Launches simulated web browser. |
| Browser | `search` | `query` | Automatic | Searches simulated web pages. |
| Browser | `navigate` | `url` | Automatic | Navigates to a specific URL. |
| Browser | `go_back` | — | Automatic | Navigates back in browser history. |
| System | `get_time` | — | Automatic | Returns current system clock time. |
| System | `get_system_info` | — | Automatic | Returns OS metadata and tool statistics. |
| System | `change_setting` | `key`, `value` | Automatic | Toggles system preferences (`sound`, `animations`). |
| System | `reset_desktop` | — | Require Confirmation | Resets virtual OS to initial state. |

---

## Quick Start Guide

### Prerequisites

- Python 3.10+ (Python 3.13 recommended)
- Node.js 18+ (Node 20+ recommended)
- `pip install cactus-needle fastapi uvicorn websockets pydantic pytest httpx`
- `npm install`

### Backend Setup

```bash
# Start FastAPI backend with Needle 3:
python -m uvicorn backend.app:app --host 127.0.0.1 --port 8000
```

Backend operates at `http://127.0.0.1:8000` with WebSocket endpoint at `ws://127.0.0.1:8000/ws`.

### Frontend Setup

```bash
# Start Next.js development server:
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Testing Suites

### Backend Tests (Pytest)

Run the Python backend verification suite covering filesystem state, permission gates, event streaming, and compound multi-agent workflows:

```bash
python -m pytest backend/tests -v
```

Output:
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
============================= 15 passed in 38.03s =============================
```

### Frontend & Unit Tests (Mocha / Chai)

Run the TypeScript unit test suite using Mocha and Chai:

```bash
npm test
```

Output:
```text
  LocalNeedleAdapter Agent Parser (Mocha & Chai)
    √ parses a single app open instruction into open_app tool call
    √ parses file creation with clean path and filename
    √ preserves exact quoted content for text editor writing
    √ parses web search query accurately
    √ decomposes the full 5-step benchmark compound instruction
    √ leverages desktop context to resolve deictic references

  Browser Service (Mocha & Chai)
    √ returns specialized Next.js documentation results when query mentions next.js
    √ returns React documentation results when query mentions react
    √ returns TypeScript results when query mentions typescript
    √ generates fallback search results for arbitrary queries
    √ generates simulated HTML page content for direct URLs

  Filesystem Service (Mocha & Chai)
    √ correctly resolves getParentPath for root and nested paths
    √ correctly extracts getFileName
    √ finds children for a directory node
    √ resolves path to node accurately
    √ computes full path for node id
    √ checks if a path exists

  17 passing (48ms)
```

---

## Demo Scenario Walkthrough

Execute the benchmark compound command from the prompt bar:

> "Open the text editor, create a file called hello.txt, write Hello from Needle, save it, then open the browser and search for Next.js."

Execution sequence:
1. Root Router decomposes the sentence into 5 steps and dependencies.
2. Desktop Specialist opens the Text Editor.
3. Files Specialist creates `/hello.txt` in the virtual filesystem.
4. Editor Specialist loads the buffer, inserts content, and commits the file.
5. Browser Specialist opens the browser and triggers the query for `Next.js`.
6. Mascot displays an autonomous completion confirmation.
7. Switch to Harness Mode to view the live execution tree and telemetry metrics.

---

## Changelog & Documentation

Detailed records of each architectural milestone and code change are maintained in [CHANGES.md](./CHANGES.md).

---

## License

MIT License. Developed for NEO-OS.
