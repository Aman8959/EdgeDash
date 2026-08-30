#!/usr/bin/env python3
"""Test script to run EdgeDash cycle."""

import sys
import traceback

try:
    from edgedash.config import load_config
    from edgedash.orchestrator import run_cycle
    
    print("Loading config...")
    config = load_config()
    print(f"✓ Config loaded: {config.target_role} in {config.target_city}")
    
    print("Running cycle...")
    run_cycle(config)
    print("✓ Cycle complete")
    
except Exception as e:
    print(f"✗ ERROR: {e}")
    traceback.print_exc()
    sys.exit(1)
