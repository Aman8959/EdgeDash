"""Run cycle and capture output."""
import subprocess
import sys

result = subprocess.run(
    [sys.executable, 'run_cycle.py'],
    cwd=r'c:\Users\ASUS\OneDrive\Desktop\edgeDash',
    capture_output=True,
    text=True,
    encoding='utf-8'
)

print(result.stdout)
if result.stderr:
    print("STDERR:", result.stderr)
print("Return code:", result.returncode)
