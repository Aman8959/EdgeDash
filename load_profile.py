#!/usr/bin/env python
"""Load candidate master profile from YAML into database."""

import sys
from pathlib import Path
from edgedash.config import load_config
from edgedash.storage import init_db
from edgedash.profile_loader import load_and_save_profile


def main():
    """Load profile from profile.yaml into database."""
    try:
        print("=" * 70)
        print("EDGEDASH: Load Master Candidate Profile")
        print("=" * 70)
        
        # Load config to get database path
        config = load_config()
        
        # Initialize database (creates tables if they don't exist)
        print(f"\nInitializing database at {config.db_path}...")
        init_db(config.db_path)
        print("✅ Database initialized")
        
        # Check if profile.yaml exists
        profile_path = Path("profile.yaml")
        if not profile_path.exists():
            print("\n❌ ERROR: profile.yaml not found in current directory")
            print("\nTo use this feature:")
            print("  1. Copy profile.yaml template:")
            print("     cp profile.yaml.example profile.yaml")
            print("  2. Edit profile.yaml with your information")
            print("  3. Run this script again")
            sys.exit(1)
        
        # Load and save profile
        result = load_and_save_profile("profile.yaml", config.db_path)
        
        print("\n" + "=" * 70)
        if result['status'] == 'SUCCESS':
            print(f"✅ SUCCESS: {result['message']}")
            if result.get('warnings'):
                print("\nWarnings:")
                for warning in result['warnings']:
                    print(f"  ⚠️  {warning}")
        else:
            print(f"❌ FAILED: {result['message']}")
            if result.get('issues'):
                print("\nIssues:")
                for issue in result['issues']:
                    print(f"  • {issue}")
        
        print("=" * 70)
        return 0 if result['status'] == 'SUCCESS' else 1
    
    except Exception as e:
        print(f"\n❌ ERROR: {str(e)}")
        return 1


if __name__ == "__main__":
    sys.exit(main())
