from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import time
import uuid

class FileNode(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4())[:8])
    name: str
    path: str
    type: str  # 'file' | 'folder'
    parent_path: Optional[str] = None
    content: str = ""
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

class VirtualFilesystem:
    def __init__(self):
        self.nodes: Dict[str, FileNode] = {}
        self.reset()

    def _normalize(self, path: str) -> str:
        if not path:
            return "/"
        path = path.strip().replace("\\", "/")
        if not path.startswith("/"):
            path = "/" + path
        # Collapse multiple slashes
        parts = [p for p in path.split("/") if p]
        if not parts:
            return "/"
        return "/" + "/".join(parts)

    def reset(self):
        self.nodes = {}
        # Root directory
        self.nodes["/"] = FileNode(id="root", name="/", path="/", type="folder", parent_path=None)
        
        # Initial folders
        self.create_folder("/Documents")
        self.create_folder("/Projects")

        # Initial files
        self.create_file("/Documents/notes.txt", "Initial notes for NeedleOS virtual desktop demo.")
        self.create_file("/Projects/hello.py", "print('Hello from simulated NeedleOS!')\n")
        self.create_file("/todo.txt", "1. Open text editor\n2. Create hello.txt\n3. Write Hello World\n4. Search Next.js in browser\n")

    def create_folder(self, path: str) -> FileNode:
        norm = self._normalize(path)
        if norm == "/":
            return self.nodes["/"]
        if norm in self.nodes:
            raise ValueError(f"Folder already exists: {norm}")

        parent_path = norm.rsplit("/", 1)[0] or "/"
        if parent_path not in self.nodes or self.nodes[parent_path].type != "folder":
            self.create_folder(parent_path)

        name = norm.rsplit("/", 1)[1]
        node = FileNode(name=name, path=norm, type="folder", parent_path=parent_path)
        self.nodes[norm] = node
        return node

    def create_file(self, path: str, content: str = "") -> FileNode:
        norm = self._normalize(path)
        if norm in self.nodes:
            raise ValueError(f"File already exists: {norm}")

        parent_path = norm.rsplit("/", 1)[0] or "/"
        if parent_path not in self.nodes:
            self.create_folder(parent_path)

        name = norm.rsplit("/", 1)[1]
        node = FileNode(name=name, path=norm, type="file", parent_path=parent_path, content=content)
        self.nodes[norm] = node
        return node

    def read_file(self, path: str) -> str:
        norm = self._normalize(path)
        if norm not in self.nodes:
            raise FileNotFoundError(f"File not found: {norm}")
        node = self.nodes[norm]
        if node.type != "file":
            raise ValueError(f"Path is a folder, not a file: {norm}")
        return node.content

    def write_file(self, path: str, content: str) -> FileNode:
        norm = self._normalize(path)
        if norm not in self.nodes:
            return self.create_file(norm, content)
        node = self.nodes[norm]
        if node.type != "file":
            raise ValueError(f"Cannot write to folder: {norm}")
        node.content = content
        node.updated_at = time.time()
        return node

    def rename_node(self, path: str, new_name: str) -> FileNode:
        norm = self._normalize(path)
        if norm == "/":
            raise ValueError("Cannot rename root folder")
        if norm not in self.nodes:
            raise FileNotFoundError(f"Path not found: {norm}")

        old_node = self.nodes[norm]
        parent_path = old_node.parent_path or "/"
        new_name = new_name.strip().strip("/")
        if "/" in new_name:
            # Handle full path passed as new_name
            new_path = self._normalize(new_name)
            new_name = new_path.rsplit("/", 1)[1]
        else:
            new_path = self._normalize(f"{parent_path}/{new_name}")

        if new_path in self.nodes and new_path != norm:
            raise ValueError(f"Target path already exists: {new_path}")

        # If it's a folder, also update all descendants
        if old_node.type == "folder":
            prefix = norm + "/"
            updates = {}
            for k, child in list(self.nodes.items()):
                if k.startswith(prefix):
                    rel = k[len(prefix):]
                    new_child_path = f"{new_path}/{rel}"
                    child.path = new_child_path
                    child.parent_path = new_child_path.rsplit("/", 1)[0]
                    updates[new_child_path] = child
                    del self.nodes[k]
            self.nodes.update(updates)

        del self.nodes[norm]
        old_node.name = new_name
        old_node.path = new_path
        old_node.updated_at = time.time()
        self.nodes[new_path] = old_node
        return old_node

    def move_node(self, source: str, destination: str) -> FileNode:
        s_norm = self._normalize(source)
        d_norm = self._normalize(destination)

        if s_norm not in self.nodes:
            raise FileNotFoundError(f"Source not found: {s_norm}")
        if s_norm == "/":
            raise ValueError("Cannot move root folder")

        # Destination must be an existing folder
        if d_norm not in self.nodes or self.nodes[d_norm].type != "folder":
            # If destination doesn't exist, try parent
            d_norm_parent = d_norm.rsplit("/", 1)[0] or "/"
            if d_norm_parent not in self.nodes:
                raise FileNotFoundError(f"Destination folder not found: {d_norm}")
            d_norm = d_norm_parent

        node = self.nodes[s_norm]
        new_path = self._normalize(f"{d_norm}/{node.name}")
        if new_path in self.nodes and new_path != s_norm:
            raise ValueError(f"Destination already contains: {new_path}")

        if node.type == "folder":
            prefix = s_norm + "/"
            updates = {}
            for k, child in list(self.nodes.items()):
                if k.startswith(prefix):
                    rel = k[len(prefix):]
                    new_child_path = f"{new_path}/{rel}"
                    child.path = new_child_path
                    child.parent_path = new_child_path.rsplit("/", 1)[0]
                    updates[new_child_path] = child
                    del self.nodes[k]
            self.nodes.update(updates)

        del self.nodes[s_norm]
        node.path = new_path
        node.parent_path = d_norm
        node.updated_at = time.time()
        self.nodes[new_path] = node
        return node

    def delete_node(self, path: str) -> str:
        norm = self._normalize(path)
        if norm == "/":
            raise ValueError("Cannot delete root directory")
        if norm not in self.nodes:
            raise FileNotFoundError(f"Path not found: {norm}")

        node = self.nodes[norm]
        if node.type == "folder":
            prefix = norm + "/"
            to_delete = [k for k in self.nodes.keys() if k.startswith(prefix)]
            for k in to_delete:
                del self.nodes[k]

        del self.nodes[norm]
        return norm

    def list_files(self, path: str = "/") -> List[Dict[str, Any]]:
        norm = self._normalize(path)
        if norm not in self.nodes:
            raise FileNotFoundError(f"Directory not found: {norm}")
        if self.nodes[norm].type != "folder":
            raise ValueError(f"Path is a file, not a directory: {norm}")

        items = []
        for p, node in self.nodes.items():
            if node.parent_path == norm and p != "/":
                items.append({
                    "id": node.id,
                    "name": node.name,
                    "path": node.path,
                    "type": node.type,
                    "size": len(node.content) if node.type == "file" else 0,
                    "updated_at": node.updated_at
                })
        return sorted(items, key=lambda x: (0 if x["type"] == "folder" else 1, x["name"].lower()))

    def to_list(self) -> List[Dict[str, Any]]:
        result = []
        for p, n in self.nodes.items():
            result.append({
                "id": n.id,
                "name": n.name,
                "path": n.path,
                "type": n.type,
                "parentId": n.parent_path,
                "content": n.content,
                "createdAt": n.created_at * 1000,
                "updatedAt": n.updated_at * 1000
            })
        return result

# Deterministic simulated browser search database
MOCK_SEARCH_DATABASE = {
    "next.js": [
        {"title": "Next.js by Vercel — The React Framework for the Web", "url": "https://nextjs.org", "snippet": "Used by some of the world's largest companies, Next.js enables you to create full-stack Web applications by extending the latest React features."},
        {"title": "Next.js Documentation", "url": "https://nextjs.org/docs", "snippet": "Welcome to the Next.js documentation! Everything you need to know about App Router, Server Components, and API routes."},
        {"title": "Getting Started with Next.js & React", "url": "https://nextjs.org/learn", "snippet": "An interactive tutorial showing step-by-step how to build high-performance web applications with Next.js."}
    ],
    "needle": [
        {"title": "Needle 2 — 14MB Foundation Tool-Calling AI Model", "url": "https://cactuscompute.com/needle", "snippet": "A fast, compact local AI model optimized for structured function and tool calling on resource-constrained devices."},
        {"title": "cactus-needle Documentation & Guide", "url": "https://github.com/cactus-compute/needle", "snippet": "Official python package for running Needle 2 with generation=2, local inference, and agent loops."}
    ],
    "react": [
        {"title": "React — The library for web and native user interfaces", "url": "https://react.dev", "snippet": "React lets you build user interfaces out of individual pieces called components. Create your own React components then combine them into entire screens."},
        {"title": "React Documentation & Quick Start", "url": "https://react.dev/learn", "snippet": "Learn React from basics to advanced state management, hooks, and suspense."}
    ],
    "python": [
        {"title": "Welcome to Python.org", "url": "https://www.python.org", "snippet": "Python is an easy to learn, powerful programming language with efficient high-level data structures and simple object-oriented approach."},
        {"title": "FastAPI Framework", "url": "https://fastapi.tiangolo.com", "snippet": "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints."}
    ]
}

class VirtualOSState:
    def __init__(self):
        self.filesystem = VirtualFilesystem()
        self.open_apps: List[str] = []
        self.active_app: Optional[str] = None
        self.windows: List[Dict[str, Any]] = []
        self.editor_state: Dict[str, Any] = {
            "openFile": None,
            "content": "",
            "dirty": False
        }
        self.browser_state: Dict[str, Any] = {
            "url": "https://en.m.wikipedia.org",
            "history": ["https://en.m.wikipedia.org"],
            "searchResults": []
        }
        self.settings: Dict[str, Any] = {
            "sound": True,
            "animations": True
        }
        self._next_z_index = 1
        self.reset()

    def reset(self):
        self.filesystem.reset()
        self.open_apps = []
        self.active_app = None
        self.windows = []
        self.editor_state = {
            "openFile": None,
            "content": "",
            "dirty": False
        }
        self.browser_state = {
            "url": "https://en.m.wikipedia.org",
            "history": ["https://en.m.wikipedia.org"],
            "searchResults": []
        }
        self.settings = {
            "sound": True,
            "animations": True
        }
        self._next_z_index = 1

    def open_app(self, app_id: str, title: Optional[str] = None) -> Dict[str, Any]:
        app_clean = self._normalize_app_id(app_id)
        if app_clean not in self.open_apps:
            self.open_apps.append(app_clean)

        self._next_z_index += 1
        # Check existing window
        for w in self.windows:
            if w["appId"] == app_clean:
                w["minimized"] = False
                w["zIndex"] = self._next_z_index
                self.active_app = app_clean
                return w

        # Create new window
        offset = (len(self.windows) % 5) * 28 + 40
        win_title = title or self._default_title_for_app(app_clean)
        new_win = {
            "id": f"win_{uuid.uuid4().hex[:6]}",
            "appId": app_clean,
            "title": win_title,
            "minimized": False,
            "zIndex": self._next_z_index,
            "position": {"x": offset, "y": offset},
            "size": {"width": 720, "height": 500}
        }
        self.windows.append(new_win)
        self.active_app = app_clean
        return new_win

    def close_app(self, app_id: str):
        app_clean = self._normalize_app_id(app_id)
        if app_clean in self.open_apps:
            self.open_apps.remove(app_clean)
        self.windows = [w for w in self.windows if w["appId"] != app_clean and w["id"] != app_id]
        if self.active_app == app_clean:
            self.active_app = self.open_apps[-1] if self.open_apps else None

    def focus_app(self, app_id: str):
        app_clean = self._normalize_app_id(app_id)
        self._next_z_index += 1
        for w in self.windows:
            if w["appId"] == app_clean or w["id"] == app_id:
                w["minimized"] = False
                w["zIndex"] = self._next_z_index
                self.active_app = w["appId"]
                return

    def minimize_app(self, app_id: str):
        app_clean = self._normalize_app_id(app_id)
        for w in self.windows:
            if w["appId"] == app_clean or w["id"] == app_id:
                w["minimized"] = True
        if self.active_app == app_clean:
            unminimized = [w for w in self.windows if not w["minimized"]]
            self.active_app = unminimized[-1]["appId"] if unminimized else None

    def search_browser(self, query: str) -> List[Dict[str, str]]:
        q_lower = query.lower().strip()
        matched = []
        for key, results in MOCK_SEARCH_DATABASE.items():
            if key in q_lower or q_lower in key:
                matched.extend(results)

        if not matched:
            matched = [
                {
                    "title": f"{query} — NeedleOS Simulated Results",
                    "url": f"https://duckduckgo.com/?q={query.replace(' ', '+')}",
                    "snippet": f"Simulated web search response for '{query}' inside the NeedleOS sandbox."
                },
                {
                    "title": f"Documentation & Articles for {query}",
                    "url": f"https://example.com/search/{query.replace(' ', '-')}",
                    "snippet": f"Explore articles and technical details regarding {query}."
                }
            ]

        self.browser_state["searchResults"] = matched
        self.browser_state["url"] = f"search:{query}"
        return matched

    def _normalize_app_id(self, app: str) -> str:
        s = str(app).lower().replace(" ", "").replace("-", "").replace("_", "")
        if "edit" in s or "note" in s or "text" in s:
            return "text-editor"
        if "file" in s or "explorer" in s or "dir" in s or "computer" in s:
            return "file-manager"
        if "brows" in s or "web" in s or "net" in s:
            return "browser"
        if "set" in s or "config" in s or "pref" in s:
            return "settings"
        return "file-manager"

    def _default_title_for_app(self, app_id: str) -> str:
        if app_id == "text-editor":
            return "Text Editor"
        if app_id == "file-manager":
            return "Computer"
        if app_id == "browser":
            return "Browser"
        if app_id == "settings":
            return "Settings"
        return app_id.title()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "openApps": self.open_apps,
            "activeApp": self.active_app,
            "openWindows": self.windows,
            "filesystem": self.filesystem.to_list(),
            "editor": self.editor_state,
            "browser": self.browser_state,
            "settings": self.settings,
            "activeWindowId": next((w["id"] for w in self.windows if w["appId"] == self.active_app and not w["minimized"]), None)
        }

global_os_state = VirtualOSState()
