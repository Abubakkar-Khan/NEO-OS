from typing import Callable, Dict, Any, List, Optional, Literal
from pydantic import BaseModel, Field
import inspect

PermissionLevel = Literal["automatic", "require_confirmation"]

class ToolParameter(BaseModel):
    name: str
    type: str
    description: str
    required: bool = True
    default: Optional[Any] = None

class ToolDefinition(BaseModel):
    name: str
    description: str
    category: Literal["desktop", "filesystem", "editor", "browser", "system"]
    permission_level: PermissionLevel = "automatic"
    parameters: Dict[str, Any] = Field(default_factory=dict)
    # The actual execution callable is stored separately in the registry dictionary
    model_config = {"arbitrary_types_allowed": True}

class ToolRegistry:
    def __init__(self):
        self._definitions: Dict[str, ToolDefinition] = {}
        self._functions: Dict[str, Callable] = {}
        self._pending_confirmations: Dict[str, Dict[str, Any]] = {}

    def register(
        self,
        name: str,
        description: str,
        category: Literal["desktop", "filesystem", "editor", "browser", "system"],
        fn: Callable,
        permission_level: PermissionLevel = "automatic",
        parameters: Optional[Dict[str, Any]] = None
    ):
        if parameters is None:
            # Extract basic parameter signature
            sig = inspect.signature(fn)
            props = {}
            req = []
            for p_name, param in sig.parameters.items():
                if p_name in ("self", "state"):
                    continue
                type_name = "string"
                if param.annotation == int:
                    type_name = "integer"
                elif param.annotation == bool:
                    type_name = "boolean"
                elif param.annotation == float:
                    type_name = "number"

                props[p_name] = {"type": type_name, "description": f"Parameter {p_name}"}
                if param.default == inspect.Parameter.empty:
                    req.append(p_name)
            parameters = {"type": "object", "properties": props, "required": req}

        definition = ToolDefinition(
            name=name,
            description=description,
            category=category,
            permission_level=permission_level,
            parameters=parameters
        )
        self._definitions[name] = definition
        self._functions[name] = fn

    def get_tool(self, name: str) -> Optional[ToolDefinition]:
        return self._definitions.get(name)

    def get_function(self, name: str) -> Optional[Callable]:
        return self._functions.get(name)

    def list_tools(self) -> List[ToolDefinition]:
        return list(self._definitions.values())

    def validate_call(self, name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        tool = self.get_tool(name)
        if not tool:
            return {"valid": False, "error": f"Unknown tool: '{name}'"}

        required = tool.parameters.get("required", [])
        for req in required:
            if req not in arguments:
                return {"valid": False, "error": f"Missing required parameter '{req}' for tool '{name}'"}

        return {"valid": True, "permission_level": tool.permission_level}

    def execute(self, name: str, arguments: Dict[str, Any], bypass_confirmation: bool = False) -> Any:
        validation = self.validate_call(name, arguments)
        if not validation["valid"]:
            raise ValueError(validation["error"])

        if validation["permission_level"] == "require_confirmation" and not bypass_confirmation:
            # Dangerous tool execution blocked without confirmation
            raise PermissionError(f"Action '{name}' requires user confirmation before execution.")

        fn = self.get_function(name)
        if not fn:
            raise ValueError(f"Tool execution function not found for: '{name}'")

        return fn(**arguments)

global_tool_registry = ToolRegistry()
