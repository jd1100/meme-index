#!/bin/bash

# Process name to monitor
PROCESS_NAME="ollama"

# CPU usage threshold
CPU_THRESHOLD=98

# Fetch the process's CPU usage
CPU_USAGE=$(ps -o %cpu= -p $(pgrep -f $PROCESS_NAME) | awk '{print $1}' | awk '{s+=$1} END {print s}')

# Check if CPU usage is above the threshold and trigger a task
if (( $(echo "$CPU_USAGE > $CPU_THRESHOLD" | bc -l) )); then
  echo "CPU usage of $PROCESS_NAME is above $CPU_THRESHOLD%. Triggering task."
  
  # Determine OS and restart ollama accordingly
  if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux platform
    echo "Restarting ollama using systemctl on Linux."
    systemctl restart ollama
  elif [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS platform
    echo "Restarting ollama using brew services on macOS."
    brew services restart ollama
  else
    echo "Unsupported OS for this script."
  fi
else
  echo "CPU usage of $PROCESS_NAME is below $CPU_THRESHOLD%. No action taken."
fi
