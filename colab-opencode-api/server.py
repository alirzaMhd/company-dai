"""
OpenCode API Server for Google Colab.

Runs OpenCode CLI via WebSocket API, accessible via cloudflared tunnel.
"""

import asyncio
import json
import os
import uuid
from pathlib import Path
from typing import Optional

from fastapi import FastAPI, WebSocket
from fastapi.responses import PlainTextResponse
import uvicorn

app = FastAPI(title="OpenCode API Server")

SESSIONS_DIR = Path("/tmp/opencode-sessions")
SESSIONS_DIR.mkdir(exist_ok=True)


async def stream_output(ws: WebSocket, line: str, stream_type: str = "stdout"):
    """Stream output line to WebSocket client."""
    try:
        await ws.send_json({
            "type": "stream",
            "stream": stream_type,
            "data": line,
        })
    except Exception:
        pass


async def run_opencode_models() -> list:
    """Run opencode models and return the list."""
    args = ["opencode", "models"]
    
    proc = await asyncio.create_subprocess_exec(
        *args,
        cwd=os.getcwd(),
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE,
    )
    
    stdout, stderr = await proc.communicate()
    output = (stdout or stderr).decode("utf-8", errors="replace")
    
    models = []
    for line in output.strip().split("\n"):
        line = line.strip()
        if not line:
            continue
        # Skip help text and non-model lines
        if line.startswith("opencode/") or line.startswith("/"):
            model_id = line.split("/")[-1] if "/" in line else line
            models.append({
                "id": line,
                "label": model_id,
            })
    
    return models


async def handle_models_request(ws: WebSocket):
    """Handle a request for available models."""
    try:
        models = await run_opencode_models()
        await ws.send_json({
            "type": "models",
            "models": models,
        })
    except Exception as e:
        await ws.send_json({
            "type": "models",
            "models": [],
            "error": str(e),
        })


def parse_json_output(stdout: str) -> dict:
    """Parse JSONL output from opencode."""
    for line in stdout.strip().split("\n"):
        if not line:
            continue
        try:
            data = json.loads(line)
            if data.get("type") == "result":
                return data
        except json.JSONDecodeError:
            continue
    return {}


async def run_opencode(
    ws: WebSocket,
    prompt: str,
    model: Optional[str],
    variant: Optional[str],
    cwd: str,
    session_id: Optional[str],
    extra_args: list,
) -> dict:
    """Run opencode CLI with streaming output."""
    
    args = ["opencode", "run", "--format", "json"]
    
    if session_id:
        args.extend(["--session", session_id])
    if model:
        args.extend(["--model", model])
    if variant:
        args.extend(["--variant", variant])
    args.extend(extra_args)
    
    await stream_output(ws, f"$ {' '.join(args)}", "system")
    
    # Build environment
    env = os.environ.copy()
    env["OPENCODE_DISABLE_PROJECT_CONFIG"] = "1"
    
    proc = await asyncio.create_subprocess_exec(
        *args,
        cwd=cwd or os.getcwd(),
        stdin=asyncio.subprocess.PIPE,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT,
        env=env,
    )
    
    # Send prompt to stdin
    proc.stdin.write(prompt.encode() + b"\n")
    await proc.stdin.drain()
    proc.stdin.close()
    
    stdout_lines = []
    
    # Stream stdout
    while True:
        line = await proc.stdout.readline()
        if not line:
            break
        decoded = line.decode("utf-8", errors="replace")
        stdout_lines.append(decoded)
        await stream_output(ws, decoded, "stdout")
    
    exit_code = await proc.wait()
    stdout = "".join(stdout_lines)
    
    parsed = parse_json_output(stdout)
    result = {
        "session_id": parsed.get("sessionId", session_id or str(uuid.uuid4())),
        "stdout": stdout,
        "stderr": "",
        "exit_code": exit_code,
        "signal": None,
        "timed_out": False,
        "error_message": parsed.get("error"),
        "usage": parsed.get("usage", {}),
        "summary": parsed.get("summary"),
    }
    
    return result


@app.websocket("/execute")
async def execute_endpoint(ws: WebSocket):
    """WebSocket endpoint for executing opencode."""
    await ws.accept()
    
    try:
        msg = await ws.receive_json()
    except Exception as e:
        await ws.send_json({"type": "error", "error": str(e)})
        return
    
    # Handle models request
    if msg.get("type") == "models":
        await handle_models_request(ws)
        return
    
    prompt = msg.get("prompt", "")
    model = msg.get("model")
    variant = msg.get("variant")
    cwd = msg.get("cwd", os.getcwd())
    session_id = msg.get("session_id")
    extra_args = msg.get("extra_args", [])

    # Validate cwd exists in Colab environment, otherwise use default
    # The client may send a local Windows path which doesn't exist in Colab
    if cwd and not Path(cwd).exists():
        await stream_output(ws, f"[warning] Requested cwd '{cwd}' does not exist in Colab, using default: {os.getcwd()}\n", "stderr")
        cwd = os.getcwd()
    
    try:
        result = await run_opencode(
            ws, prompt, model, variant, cwd, session_id, extra_args
        )
        await ws.send_json({"type": "result", **result})
    except Exception as e:
        await ws.send_json({
            "type": "result",
            "session_id": session_id or str(uuid.uuid4()),
            "stdout": "",
            "stderr": str(e),
            "exit_code": 1,
            "error_message": str(e),
        })


@app.get("/health")
async def health():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/models")
async def list_models():
    """HTTP endpoint to list available models (for debugging)."""
    models = await run_opencode_models()
    return {"models": models}


@app.get("/tunnel")
async def get_tunnel():
    """Get current tunnel URL if available."""
    tunnel_file = Path("/tmp/opencode-tunnel-url")
    if tunnel_file.exists():
        return {"url": tunnel_file.read_text().strip()}
    return {"url": None}


@app.get("/sessions")
async def list_sessions():
    """List saved sessions."""
    sessions = []
    for f in SESSIONS_DIR.glob("*.json"):
        try:
            sessions.append(json.loads(f.read_text()))
        except json.JSONDecodeError:
            continue
    return {"sessions": sessions}


# For direct execution: python server.py
if __name__ == "__main__":
    import sys
    port = 3100
    if len(sys.argv) > 1:
        port = int(sys.argv[1])
    print(f"Starting OpenCode API server on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)