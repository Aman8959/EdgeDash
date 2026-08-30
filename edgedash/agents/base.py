"""Agent base protocol and result dataclass."""

from dataclasses import dataclass
from typing import Protocol


@dataclass
class AgentResult:
    """Result from a single agent run."""
    agent: str
    status: str  # "ok" or "failed"
    records_touched: int
    notes: str


class Agent(Protocol):
    """Protocol for all agents in EdgeDash."""
    
    @property
    def name(self) -> str:
        """Agent name (Fetcher, Scorer, GapAnalyzer, etc.)."""
        ...
    
    def run(self, config, storage) -> AgentResult:
        """Run the agent. Takes config and storage module.
        
        Returns:
            AgentResult with status, records touched, and notes.
        """
        ...
