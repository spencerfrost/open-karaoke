#!/bin/bash
echo "Starting Open Karaoke Studio - All Services..."

# Create a new tmux session with mouse mode enabled
tmux new-session -d -s karaoke
# Enable mouse mode
tmux set -g -t karaoke mouse on

# Split the window into 4 panes
tmux split-window -h -t karaoke
tmux split-window -v -t karaoke:0.1
tmux split-window -v -t karaoke:0.0

# Start services in their respective panes
# Start the API server in the top-right pane
tmux send-keys -t karaoke:0.1 "cd $(pwd)/backend && source venv/bin/activate && ./run_api.sh" C-m

# Start the Celery worker in the bottom-left pane
tmux send-keys -t karaoke:0.2 "cd $(pwd)/backend && source venv/bin/activate && ./run_celery.sh" C-m

# Start the frontend in the bottom-right pane
tmux send-keys -t karaoke:0.3 "cd $(pwd)/frontend && pnpm run dev" C-m

# Display system info in the left pane
tmux send-keys -t karaoke:0.0 "echo 'Open Karaoke Studio - System Information'" C-m
tmux send-keys -t karaoke:0.0 "echo '-------------------------------------'" C-m
tmux send-keys -t karaoke:0.0 "echo 'Services running in other panes:'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Top-right: Backend API'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Bottom-left: Celery worker'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Bottom-right: Frontend'" C-m
tmux send-keys -t karaoke:0.0 "echo ''" C-m
tmux send-keys -t karaoke:0.0 "echo 'Mouse features enabled:'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Click on any pane to select it'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Scroll with the mouse wheel'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Click and drag pane borders to resize'" C-m
tmux send-keys -t karaoke:0.0 "echo ''" C-m
tmux send-keys -t karaoke:0.0 "echo 'tmux commands:'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Ctrl+B then D: Detach (keeps services running)'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Ctrl+B then arrow keys: Navigate between panes'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Ctrl+B then :: Enter command mode'" C-m
tmux send-keys -t karaoke:0.0 "echo ''" C-m
tmux send-keys -t karaoke:0.0 "echo 'To end the session:'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Detach (keeps running): Ctrl+B then D'" C-m
tmux send-keys -t karaoke:0.0 "echo '- Kill session: Ctrl+B then :: then type \"kill-session\"'" C-m
tmux send-keys -t karaoke:0.0 "echo '- From outside: tmux kill-session -t karaoke'" C-m
tmux send-keys -t karaoke:0.0 "echo ''" C-m
tmux send-keys -t karaoke:0.0 "echo 'This pane is free for your commands. Type \"help\" for a list of useful commands.'" C-m
tmux send-keys -t karaoke:0.0 "echo ''" C-m

# Define help function for the system pane
tmux send-keys -t karaoke:0.0 "echo 'function help() {'" C-m
tmux send-keys -t karaoke:0.0 "echo '  Useful Commands:'" C-m
tmux send-keys -t karaoke:0.0 "echo '  - tmux list-sessions: Show all tmux sessions'" C-m
tmux send-keys -t karaoke:0.0 "echo '  - tmux kill-session -t karaoke: Kill this session'" C-m
tmux send-keys -t karaoke:0.0 "echo '  - ps aux | grep -E \"(api|celery|vite)\": Check running processes'" C-m
tmux send-keys -t karaoke:0.0 "echo '  - clear: Clear this screen'" C-m
tmux send-keys -t karaoke:0.0 "echo '}'" C-m

# Focus on the system info pane initially
tmux select-pane -t karaoke:0.0

# Attach to the tmux session
tmux a -t karaoke