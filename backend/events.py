from typing import Any, Callable, List, Literal, Optional
from pydantic import BaseModel, Field
import time
import asyncio
import json

EventType = Literal[
    "user_input",
    "route_selected",
    "handoff",
    "model_call",
    "tool_selected",
    "tool_started",
    "tool_completed",
    "tool_failed",
    "state_changed",
    "agent_finished"
]

class AgentHandoff(BaseModel):
    runId: str
    sourceAgent: str
    targetAgent: str
    request: str
    context: Optional[Any] = None

class AgentEvent(BaseModel):
    runId: str
    timestamp: float = Field(default_factory=lambda: round(time.time() * 1000, 2))
    agent: str = "root_router"
    type: str
    tool: Optional[str] = None
    arguments: Optional[Any] = None
    result: Optional[Any] = None
    error: Optional[str] = None
    confidence: Optional[float] = None
    reasoning: Optional[str] = None
    message: Optional[str] = None

class EventBus:
    def __init__(self):
        self._subscribers: List[Callable[[AgentEvent], Any]] = []
        self._history: List[AgentEvent] = []
        self._max_history = 1000

    def subscribe(self, callback: Callable[[AgentEvent], Any]):
        self._subscribers.append(callback)

    def unsubscribe(self, callback: Callable[[AgentEvent], Any]):
        if callback in self._subscribers:
            self._subscribers.remove(callback)

    async def emit(self, event: AgentEvent):
        self._history.append(event)
        if len(self._history) > self._max_history:
            self._history.pop(0)

        for callback in list(self._subscribers):
            try:
                res = callback(event)
                if asyncio.iscoroutine(res):
                    await res
            except Exception as e:
                print(f"[EventBus] Error notifying subscriber: {e}")

    def emit_sync(self, event: AgentEvent):
        self._history.append(event)
        if len(self._history) > self._max_history:
            self._history.pop(0)

        for callback in list(self._subscribers):
            try:
                res = callback(event)
                if asyncio.iscoroutine(res):
                    try:
                        loop = asyncio.get_running_loop()
                        loop.create_task(res)
                    except RuntimeError:
                        asyncio.run(res)
            except Exception as e:
                print(f"[EventBus] Sync error notifying subscriber: {e}")

    def get_history(self, limit: int = 200) -> List[AgentEvent]:
        return self._history[-limit:]

    def clear(self):
        self._history.clear()

global_event_bus = EventBus()
