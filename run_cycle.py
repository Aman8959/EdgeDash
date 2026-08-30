#!/usr/bin/env python3
"""Entry point: python run_cycle.py"""

from edgedash.config import load_config
from edgedash.orchestrator import run_cycle


if __name__ == "__main__":
    try:
        config = load_config()
        run_cycle(config)
    except (FileNotFoundError, ValueError) as e:
        print(f"\n❌ ERROR: {e}\n")
        exit(1)
