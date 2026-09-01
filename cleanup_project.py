#!/usr/bin/env python
"""Cleanup and organize project structure."""

import os
import shutil
from pathlib import Path


def main():
    """Organize project structure professionally."""
    root = Path(".")
    
    # Create directories
    test_dir = root / "tests"
    doc_dir = root / "docs"
    
    test_dir.mkdir(exist_ok=True)
    doc_dir.mkdir(exist_ok=True)
    
    print("✓ Created directories: tests/, docs/\n")
    
    # Move test files
    test_files = list(root.glob("test_*.py"))
    for test_file in test_files:
        try:
            shutil.move(str(test_file), str(test_dir / test_file.name))
            print(f"✓ Moved {test_file.name} to tests/")
        except Exception as e:
            print(f"✗ Failed to move {test_file.name}: {e}")
    
    print()
    
    # Move documentation files
    doc_files = [
        "COMPLETION_REPORT.md",
        "FINAL_DELIVERY.md",
        "PROJECT_SUMMARY.md",
        "VISUAL_SUMMARY.md",
    ]
    
    for doc_file in doc_files:
        file_path = root / doc_file
        if file_path.exists():
            try:
                shutil.move(str(file_path), str(doc_dir / doc_file))
                print(f"✓ Moved {doc_file} to docs/")
            except Exception as e:
                print(f"✗ Failed to move {doc_file}: {e}")
    
    print()
    
    # Delete unnecessary files
    unnecessary_files = [
        "run_cycle_capture.py",  # Backup/test file
        "dashboard.py",           # Redundant with streamlit_app.py
        "cycle_output.txt",       # Temporary output
        "skills_inventory.py",    # Old utility
    ]
    
    for file_name in unnecessary_files:
        file_path = root / file_name
        if file_path.exists():
            try:
                os.remove(file_path)
                print(f"✓ Deleted {file_name}")
            except Exception as e:
                print(f"✗ Failed to delete {file_name}: {e}")
    
    print()
    
    # Delete mock_fetcher.py from agents
    mock_fetcher = root / "edgedash" / "agents" / "mock_fetcher.py"
    if mock_fetcher.exists():
        try:
            os.remove(mock_fetcher)
            print(f"✓ Deleted edgedash/agents/mock_fetcher.py (not used)")
        except Exception as e:
            print(f"✗ Failed to delete mock_fetcher.py: {e}")
    
    print()
    
    # List cleaned directory
    print("=" * 60)
    print("📁 CLEANED PROJECT STRUCTURE")
    print("=" * 60)
    
    items = sorted([item.name for item in root.iterdir() if not item.name.startswith(".")])
    for item in items:
        if (root / item).is_dir():
            print(f"📂 {item}/")
        else:
            print(f"📄 {item}")
    
    print("\n✅ Project cleanup complete!")


if __name__ == "__main__":
    main()
