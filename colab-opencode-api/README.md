# OpenCode API Server for Google Colab

This module runs OpenCode CLI on Google Colab and exposes it via WebSocket API, accessible from your Windows machine via cloudflared tunnel.

## Quick Start (Colab)

```python
# Step 1: Upload files to Colab
# Upload: colab-opencode-api/server.py, colab-opencode-api/run_colab.py, colab-opencode-api/requirements.txt
# Also upload: cloudflared-linux-amd64.deb (from repo root)

# Step 2: Install dependencies
%pip install -r colab-opencode-api/requirements.txt

# Step 3: Start server with tunnel
%run colab-opencode-api/run_colab.py
```

The script will:
1. Start the FastAPI server on port 8000
2. Establish cloudflared tunnel
3. Print your WebSocket URL (wss://xxx.trycloudflare.com)

## API Endpoints

### WebSocket /execute
Execute OpenCode with streaming output:

```python
import asyncio
import websockets
import json

async def execute():
    uri = "wss://YOUR-TUNNEL-URL/execute"
    async with websockets.connect(uri) as ws:
        # Send request
        await ws.send(json.dumps({
            "prompt": "Write a hello world program in Python",
            "model": "anthropic/claude-sonnet-4-5",
            "cwd": "/content",
        }))
        
        # Receive streaming output
        while True:
            msg = await ws.recv()
            data = json.loads(msg)
            
            if data["type"] == "stream":
                print(data["data"], end="")  # stdout/stderr
            elif data["type"] == "result":
                print("\n---RESULT---")
                print(f"Exit code: {data['exit_code']}")
                print(f"Session: {data['session_id']}")
                break

asyncio.run(execute())
```

### REST Endpoints

- `GET /health` - Health check
- `GET /tunnel` - Get current tunnel URL
- `POST /tunnel` - Start tunnel
- `DELETE /tunnel` - Stop tunnel
- `GET /sessions` - List saved sessions
- `DELETE /sessions/{session_id}` - Delete session

## Session Resume

Pass `session_id` to resume a previous session:

```python
await ws.send(json.dumps({
    "prompt": "Continue from where we left off",
    "session_id": "abc-123-session-id",
}))
```

## Configuration Options

| Field | Type | Description |
|-------|------|-------------|
| prompt | string | The prompt to send to OpenCode |
| model | string | Model to use (e.g., "anthropic/claude-sonnet-4-5") |
| variant | string | Model variant |
| cwd | string | Working directory |
| session_id | string | Session to resume |
| extra_args | array | Extra CLI arguments |
| timeout_sec | int | Timeout in seconds (0 = no timeout) |

## Architecture

```
Colab                          Windows
┌─────────────────┐           ┌─────────────────┐
│ OpenCode CLI    │           │ Paperclip      │
│                 │  <--->   │                 │
│ API Server      │  WebSocket│ Remote Adapter│
│ (FastAPI+WS)    │  Tunnel   │                │
└─────────────────┘           └─────────────────┘
```

The server spawns OpenCode as a subprocess and streams all stdout/stderr to the WebSocket client.