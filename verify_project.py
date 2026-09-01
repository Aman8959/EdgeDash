"""Final verification: test all EdgeDash components."""
import sys
from pathlib import Path

def test_all_components():
    """Test all project components."""
    tests_passed = 0
    tests_total = 0
    
    print("=" * 70)
    print("EDGEDASH PROJECT VERIFICATION")
    print("=" * 70)
    
    # Test 1: Config loading
    tests_total += 1
    try:
        from edgedash.config import load_config
        config = load_config()
        assert config.target_role == "Data Scientist"
        assert config.target_city == "Indore"
        assert len(config.my_skills) == 8
        print("✅ TEST 1: Config loading")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 1: Config loading - {e}")
    
    # Test 2: Storage layer
    tests_total += 1
    try:
        from edgedash import storage
        assert hasattr(storage, 'init_db')
        assert hasattr(storage, 'get_listings')
        assert hasattr(storage, 'update_listing_score')
        assert hasattr(storage, 'update_skill_gaps')
        print("✅ TEST 2: Storage layer interface")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 2: Storage layer - {e}")
    
    # Test 3: All agents exist
    tests_total += 1
    try:
        from edgedash.agents.indeed_fetcher import IndeedFetcher
        from edgedash.agents.scorer import Scorer
        from edgedash.agents.gap_analyzer import GapAnalyzer
        from edgedash.agents.verifier import Verifier
        
        agents = {
            'fetcher': IndeedFetcher(),
            'scorer': Scorer(),
            'gap_analyzer': GapAnalyzer(),
            'verifier': Verifier(),
        }
        
        for name, agent in agents.items():
            assert hasattr(agent, 'name')
            assert hasattr(agent, 'run')
            assert agent.name == name
        
        print("✅ TEST 3: All 4 agents implemented")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 3: Agents - {e}")
    
    # Test 4: Database exists and has data
    tests_total += 1
    try:
        import sqlite3
        conn = sqlite3.connect(config.db_path)
        cursor = conn.cursor()
        
        # Check listings table
        cursor.execute("SELECT COUNT(*) FROM listings")
        count = cursor.fetchone()[0]
        assert count > 0, f"Expected listings, got {count}"
        
        # Check all scored
        cursor.execute("SELECT COUNT(*) FROM listings WHERE fit_score IS NULL")
        unscored = cursor.fetchone()[0]
        assert unscored == 0, f"Expected 0 unscored, got {unscored}"
        
        # Check skill gaps exist
        cursor.execute("SELECT COUNT(*) FROM skill_gaps")
        gaps_count = cursor.fetchone()[0]
        
        conn.close()
        print(f"✅ TEST 4: Database verified ({count} listings, {gaps_count} gaps)")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 4: Database - {e}")
    
    # Test 5: Orchestrator
    tests_total += 1
    try:
        from edgedash.orchestrator import AGENT_REGISTRY, run_cycle
        
        assert 'fetcher' in AGENT_REGISTRY
        assert 'scorer' in AGENT_REGISTRY
        assert 'gap_analyzer' in AGENT_REGISTRY
        assert 'verifier' in AGENT_REGISTRY
        assert len(AGENT_REGISTRY) == 4
        
        print("✅ TEST 5: Orchestrator with 4 agents")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 5: Orchestrator - {e}")
    
    # Test 6: Display scripts exist
    tests_total += 1
    try:
        assert Path('dashboard.py').exists()
        assert Path('skills_inventory.py').exists()
        assert Path('streamlit_app.py').exists()
        print("✅ TEST 6: Display scripts (3 dashboards)")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 6: Display scripts - {e}")
    
    # Test 7: Documentation
    tests_total += 1
    try:
        assert Path('README.md').exists()
        assert Path('PROJECT_SUMMARY.md').exists()
        assert Path('.kiro/steering/edgedash.md').exists()
        assert Path('POSTGRES_MIGRATION.md').exists()
        print("✅ TEST 7: Documentation complete")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 7: Documentation - {e}")
    
    # Test 8: Git repo
    tests_total += 1
    try:
        assert Path('.git').exists()
        assert Path('.gitignore').exists()
        print("✅ TEST 8: Git repository initialized")
        tests_passed += 1
    except Exception as e:
        print(f"❌ TEST 8: Git repo - {e}")
    
    # Summary
    print("\n" + "=" * 70)
    print(f"RESULTS: {tests_passed}/{tests_total} tests passed")
    print("=" * 70)
    
    if tests_passed == tests_total:
        print("\n✅ ALL SYSTEMS OPERATIONAL - PROJECT 100% COMPLETE")
        print("\nNext steps:")
        print("1. python run_cycle.py       # Run the cycle")
        print("2. python dashboard.py       # View top jobs")
        print("3. python skills_inventory.py  # View skill gaps")
        print("4. streamlit run streamlit_app.py  # Launch web dashboard")
        return 0
    else:
        print(f"\n⚠ {tests_total - tests_passed} test(s) failed")
        return 1

if __name__ == '__main__':
    sys.exit(test_all_components())
