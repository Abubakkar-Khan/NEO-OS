import asyncio
import json
from typing import Dict, Any, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.state import global_os_state
from backend.events import AgentEvent, global_event_bus
from backend.tools.registry import global_tool_registry
from backend.agent.runner import global_agent_runner
import backend.tools # Ensure tools are initialized

app = FastAPI(title="NeedleOS Backend", version="1.0.0")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RunRequest(BaseModel):
    command: str
    runId: Optional[str] = None

class ActionRequest(BaseModel):
    tool: str
    arguments: Dict[str, Any] = {}

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        # Send current OS state immediately upon connecting
        await websocket.send_json({
            "type": "state_sync",
            "state": global_os_state.to_dict(),
            "events": [e.model_dump() for e in global_event_bus.get_history(50)]
        })

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in list(self.active_connections):
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"[WebSocket] Error broadcasting: {e}")
                self.disconnect(connection)

manager = ConnectionManager()

# Hook event bus into websocket broadcast
def on_agent_event(event: AgentEvent):
    asyncio.create_task(manager.broadcast({
        "type": "agent_event",
        "event": event.model_dump(),
        "state": global_os_state.to_dict() if event.type == "state_changed" else None
    }))

global_event_bus.subscribe(on_agent_event)

@app.get("/")
def root():
    return {
        "product": "NeedleOS Backend",
        "status": "online",
        "model": "Needle 2 (cactus-needle)",
        "generation": 2
    }

@app.get("/api/state")
def get_state():
    """Get authoritative Virtual OS state."""
    return global_os_state.to_dict()

@app.get("/api/tools")
def get_tools():
    """List all registered tools and their permissions."""
    return [t.model_dump() for t in global_tool_registry.list_tools()]

@app.get("/api/events")
def get_events(limit: int = 100):
    """Get recent event history."""
    return [e.model_dump() for e in global_event_bus.get_history(limit)]

@app.post("/api/run")
async def run_command(req: RunRequest):
    """Execute natural-language command through Needle 2 agentic loop."""
    if not req.command.strip():
        raise HTTPException(status_code=400, detail="Command cannot be empty")

    # Run in background task so API responds with run ID immediately
    run_id = req.runId or f"run_{asyncio.get_event_loop().time():.3f}"
    asyncio.create_task(global_agent_runner.run(req.command, run_id=run_id))

    return {
        "status": "started",
        "runId": run_id,
        "command": req.command
    }

@app.post("/api/action")
async def execute_action(req: ActionRequest):
    """Direct UI actions that mutate authoritative backend state."""
    try:
        res = global_tool_registry.execute(req.tool, req.arguments, bypass_confirmation=True)
        # Notify WebSocket
        await global_event_bus.emit(AgentEvent(
            runId="ui_action",
            type="state_changed",
            tool=req.tool,
            arguments=req.arguments,
            result=res
        ))
        return {"success": True, "result": res, "state": global_os_state.to_dict()}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/reset")
async def reset_desktop():
    """Reset virtual OS state to initial defaults."""
    global_os_state.reset()
    await global_event_bus.emit(AgentEvent(
        runId="system_reset",
        type="state_changed",
        tool="reset_desktop",
        result=global_os_state.to_dict()
    ))
    return {"success": True, "state": global_os_state.to_dict()}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                if msg.get("type") == "run":
                    cmd = msg.get("command", "")
                    rid = msg.get("runId")
                    asyncio.create_task(global_agent_runner.run(cmd, run_id=rid))
                elif msg.get("type") == "action":
                    tool_name = msg.get("tool")
                    args = msg.get("arguments", {})
                    global_tool_registry.execute(tool_name, args, bypass_confirmation=True)
                    await global_event_bus.emit(AgentEvent(
                        runId="ui_action",
                        type="state_changed",
                        tool=tool_name,
                        result=global_os_state.to_dict()
                    ))
            except Exception as e:
                print(f"[WebSocket] Error processing message: {e}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
