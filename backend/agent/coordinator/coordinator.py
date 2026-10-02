import asyncio
import uuid
import time
from typing import Dict, Any, Optional

from backend.events import AgentEvent, AgentHandoff, global_event_bus
from backend.state import global_os_state
from backend.agent.router.router_agent import RouterAgent
from backend.agent.coordinator.workflow import Workflow, WorkflowStep
from backend.agent.specialists.files_agent import FilesAgent
from backend.agent.specialists.desktop_agent import DesktopAgent
from backend.agent.specialists.editor_agent import EditorAgent
from backend.agent.specialists.browser_agent import BrowserAgent
from backend.agent.specialists.system_agent import SystemAgent
from backend.agent.context import builders

class AgentCoordinator:
    """
    Central deterministic coordinator for hierarchical multi-agent execution:
    User -> Root Router Agent -> Specialist Domain Agent -> Small Toolset -> Tool Executor -> Virtual OS State.
    Enforces maximum depth = 2 (Router -> Specialist -> Tool), handles explicit handoffs,
    domain context builders, and emits unified observable events into the Harness stream.
    """
    def __init__(self):
        self.router = RouterAgent()
        self.specialists = {
            "files": FilesAgent(),
            "desktop": DesktopAgent(),
            "editor": EditorAgent(),
            "browser": BrowserAgent(),
            "system": SystemAgent(),
        }

    async def run(self, user_command: str, run_id: Optional[str] = None) -> Dict[str, Any]:
        run_id = run_id or f"run_{uuid.uuid4().hex[:8]}"

        # 1. USER_INPUT event
        await global_event_bus.emit(AgentEvent(
            runId=run_id,
            agent="root_router",
            type="user_input",
            arguments={"command": user_command}
        ))

        # 2. MODEL_CALL event for Root Router
        await global_event_bus.emit(AgentEvent(
            runId=run_id,
            agent="root_router",
            type="model_call",
            arguments={"model": "Needle 3", "generation": 3, "query": user_command}
        ))

        # 3. Route user command into domain workflow
        workflow: Workflow = await asyncio.to_thread(self.router.route, user_command, run_id)

        # 4. ROUTE_SELECTED event
        await global_event_bus.emit(AgentEvent(
            runId=run_id,
            agent="root_router",
            type="route_selected",
            arguments={
                "steps": [s.model_dump() for s in workflow.steps],
                "original_request": workflow.original_request
            },
            confidence=workflow.confidence,
            reasoning=workflow.reasoning
        ))

        step_results = []

        # 5. Execute each workflow step through its domain specialist
        for step in workflow.steps:
            specialist = self.specialists.get(step.domain)
            if not specialist:
                specialist = self.specialists["system"]

            # Build domain-specific context
            ctx = self._build_context_for_domain(step.domain)

            # Explicit Agent Handoff
            handoff = AgentHandoff(
                runId=run_id,
                sourceAgent="root_router",
                targetAgent=specialist.agent_id,
                request=step.request,
                context=ctx
            )

            await global_event_bus.emit(AgentEvent(
                runId=run_id,
                agent="root_router",
                type="handoff",
                arguments=handoff.model_dump(),
                message=f"Handoff to {specialist.display_name}: '{step.request}'"
            ))

            # Execute specialist agent
            exec_res = await asyncio.to_thread(
                specialist.execute,
                step.request,
                run_id,
                ctx
            )
            step_results.append({
                "step_id": step.id,
                "domain": step.domain,
                "agent": specialist.agent_id,
                "result": exec_res
            })

        # 6. AGENT_FINISHED event
        await global_event_bus.emit(AgentEvent(
            runId=run_id,
            agent="root_router",
            type="agent_finished",
            result={"steps_completed": len(step_results), "workflow": workflow.to_dict()},
            confidence=workflow.confidence,
            reasoning=workflow.reasoning
        ))

        return {
            "runId": run_id,
            "status": "completed",
            "workflow": workflow.to_dict(),
            "step_results": step_results,
            "confidence": workflow.confidence,
            "reasoning": workflow.reasoning,
            "state": global_os_state.to_dict()
        }

    def _build_context_for_domain(self, domain: str) -> Dict[str, Any]:
        if domain == "files":
            return builders.build_files_context(global_os_state)
        elif domain == "editor":
            return builders.build_editor_context(global_os_state)
        elif domain == "browser":
            return builders.build_browser_context(global_os_state)
        elif domain == "desktop":
            return builders.build_desktop_context(global_os_state)
        elif domain == "system":
            return builders.build_system_context(global_os_state)
        return {}

global_coordinator = AgentCoordinator()
