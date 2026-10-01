import re
from typing import List, Any, Optional
from backend.agent.specialists.base_specialist import BaseSpecialistAgent
from backend.tools.registry import global_tool_registry
from backend.events import AgentEvent, global_event_bus
from backend.state import global_os_state

class BrowserAgent(BaseSpecialistAgent):
    agent_id = "browser_agent"
    display_name = "Browser Agent"
    allowed_tools = [
        "open_browser",
        "navigate",
        "search",
        "go_back"
    ]

    def _fallback_execute(self, request: str, run_id: str, context: Optional[Any] = None) -> List[Any]:
        low = request.lower()
        results = []

        if "open" in low and "browser" in low:
            res = self._run_tool("open_browser", {}, run_id)
            results.append(res)

        if "search" in low or "look up" in low:
            # Query might be 'Next.js' or quoted or trailing text
            match = re.search(r'(?:search for|search|look up)\s+(.*?)(?:\s+and\s+|$)', request, re.IGNORECASE)
            raw_query = match.group(1).strip() if match else "Next.js"
            query = raw_query.rstrip('. ') if not raw_query.endswith('.js') else raw_query.rstrip('.')
            res = self._run_tool("search", {"query": query}, run_id)
            results.append(res)

        elif "navigate" in low or "go to" in low or "http" in low:
            match = re.search(r'(?:navigate to|go to)\s+(https?://[^\s]+|[a-zA-Z0-9_\-\.]+\.[a-zA-Z]{2,})', request, re.IGNORECASE)
            url = match.group(1).strip() if match else "https://needle.ai"
            if not url.startswith("http"):
                url = f"https://{url}"
            res = self._run_tool("navigate", {"url": url}, run_id)
            results.append(res)

        elif "back" in low:
            res = self._run_tool("go_back", {}, run_id)
            results.append(res)

        return results

    def _run_tool(self, tool_name: str, args: dict, run_id: str):
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_selected", tool=tool_name, arguments=args))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_started", tool=tool_name, arguments=args))
        res = global_tool_registry.execute(tool_name, args, bypass_confirmation=True)
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="tool_completed", tool=tool_name, arguments=args, result=res))
        global_event_bus.emit_sync(AgentEvent(runId=run_id, agent=self.agent_id, type="state_changed", result=global_os_state.to_dict()))
        return res
