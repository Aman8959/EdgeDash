import sys
sys.path.insert(0, 'c:\\Users\\ASUS\\OneDrive\\Desktop\\edgeDash')

from edgedash.config import load_config
from edgedash.orchestrator import run_cycle

config = load_config()
run_cycle(config)
