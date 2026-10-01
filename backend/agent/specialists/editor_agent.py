import re
from typing import List, Any
from backend.agent.specialists.base_specialist import BaseSpecialistAgent
from backend.tools.registry import global_tool_registry
from backend.events import AgentEvent, global_event_bus
from backend.state import global_os_state

class EditorAgent(BaseSpecialistAgent):
    agent_id = "editor_agent"
    display_name = "Editor Agent"
    allowed_tools = [
        "open_editor",
        "insert_text",
        "replace_text",
        "save_file",
        "save_as"
    ]

    def _fallback_execute(self, request: str, run_id: str) -> List[Any]:
        low = request.lower()
        results = []

        curr_file = global_os_state.editor_state.get("openFile") or "/hello.txt"

        if "open" in low and ("editor" in low or ".txt" in low):
            match = re.search(r'(?:file|open)\s+([a-zA-Z0-9_\-\./]+)', request, re.IGNORECASE)
            p = match.group(1) if match else curr_file
            res = self._run_tool("open_editor", {"path": f"/{p.strip('/')}"}, run_id)
            results.append(res)

        if "write" in low or "type" in low or "insert" in low:
            # Extract content in quotes or text following write/type
            quote_match = re.search(r'["\'](.*?)["\']', request)
            if quote_match:
                content = quote_match.group(1)
            else:
                after_match = re.search(r'(?:write|type|insert)\s+(.*?)(?:\s+(?:into|to|in)\s+|$)', request, re.IGNORECASE)
                content = after_match.group(1).strip() if after_match else "Hello from Needle"
            
            res = self._run_tool("replace_text", {"path": curr_file, "content": content}, run_id)
            results.append(res)

        if "save" in low:
            res = self._run_tool("save_file", {"path": curr_file}, run_id)
            results.append(res)

        return results

    def _run_tool(self, tool_name: str, args: dict, run_id: str):
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_selected", tool=tool_name, arguments=args))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_started", tool=tool_name, arguments=args))
        res = global_tool_registry.execute(tool_name, args, bypass_confirmation=True)
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_completed", tool=tool_name, arguments=args, result=res))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="state_changed", result=global_os_state.to_dict()))
        return res
