from typing import List, Literal, Optional, Dict, Any
from pydantic import BaseModel, Field

DomainType = Literal["desktop", "files", "editor", "browser", "system"]

class WorkflowStep(BaseModel):
    id: str
    domain: DomainType
    request: str
    dependsOn: List[str] = Field(default_factory=list)

class Workflow(BaseModel):
    id: str
    original_request: str
    steps: List[WorkflowStep] = Field(default_factory=list)
    confidence: float = 0.95
    reasoning: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "original_request": self.original_request,
            "steps": [s.model_dump() for s in self.steps],
            "confidence": self.confidence,
            "reasoning": self.reasoning,
        }
