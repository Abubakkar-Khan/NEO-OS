import re
from typing import List, Any
from backend.agent.specialists.base_specialist import BaseSpecialistAgent
from backend.tools.registry import global_tool_registry
from backend.events import AgentEvent, global_event_bus
from backend.state import global_os_state

class FilesAgent(BaseSpecialistAgent):
    agent_id = "files_agent"
    display_name = "Files Agent"
    allowed_tools = [
        "list_files",
        "create_file",
        "create_folder",
        "read_file",
        "write_file",
        "rename_file",
        "rename_folder",
        "move_file",
        "delete_file"
    ]

    def _fallback_execute(self, request: str, run_id: str) -> List[Any]:
        low = request.lower()
        results = []

        if "create" in low and ("folder" in low or "directory" in low):
            # Extract folder name
            match = re.search(r'(?:called|named|folder|directory)\s+([a-zA-Z0-9_\-\.]+)', request, re.IGNORECASE)
            name = match.group(1) if match else "Projects"
            path = f"/{name.strip('/')}"
            res = self._run_tool("create_folder", {"path": path}, run_id)
            results.append(res)

        elif "create" in low and ("file" in low or ".txt" in low or ".md" in low):
            match = re.search(r'(?:called|named)\s+([a-zA-Z0-9_\-\./]+)', request, re.IGNORECASE)
            if not match:
                match = re.search(r'file\s+([a-zA-Z0-9_\-\./]+)', request, re.IGNORECASE)
            if not match:
                match = re.search(r'([a-zA-Z0-9_\-\.]+\.(?:txt|md|py|json|js|ts|html))', request, re.IGNORECASE)
            fname = match.group(1) if match else "hello.txt"
            path = f"/{fname.strip('/')}"
            if path in global_os_state.filesystem.nodes:
                global_os_state.filesystem.write_file(path, "")
                res = f"File {path} exists, truncated"
            else:
                res = self._run_tool("create_file", {"path": path, "content": ""}, run_id)
            global_os_state.editor_state["openFile"] = path
            global_os_state.editor_state["content"] = ""
            results.append(res)

        elif "list" in low:
            res = self._run_tool("list_files", {"path": "/"}, run_id)
            results.append(res)

        elif "delete" in low or "remove" in low:
            match = re.search(r'(?:delete|remove)\s+([a-zA-Z0-9_\-\./]+)', request, re.IGNORECASE)
            fname = match.group(1) if match else "todo.txt"
            path = f"/{fname.strip('/')}"
            res = self._run_tool("delete_file", {"path": path}, run_id)
            results.append(res)

        return results

    def _run_tool(self, tool_name: str, args: dict, run_id: str):
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_selected", tool=tool_name, arguments=args))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_started", tool=tool_name, arguments=args))
        res = global_tool_registry.execute(tool_name, args, bypass_confirmation=True)
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_completed", tool=tool_name, arguments=args, result=res))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="state_changed", result=global_os_state.to_dict()))
        return res
