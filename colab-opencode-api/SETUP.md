# OpenCode Remote - Colab + Paperclip Setup

Run OpenCode on Google Colab and use it from Paperclip on your Windows laptop.

## Architecture

```
┌─────────────────────┐     WebSocket     ┌─────────────────────┐
│   Google Colab      │  ◄─────────────► │   Windows Laptop    │
│                     │  cloudflared    │                   │
│  + OpenCode CLI     │     tunnel      │  + Paperclip      │
│  + API Server      │                 │  + opencode_remote│
│  + /content (cwd)   │                 │  + local filesystem│
└─────────────────────┘                 └─────────────────────┘
```

**Filesystem Note:** The agent runs in Colab's filesystem (`/content`), not your local machine. Any code/data the agent needs must be uploaded to Colab first. The adapter automatically handles mismatched paths by falling back to Colab's default directory.

## Step 1: Colab (OpenCode Server)

### 1.1 Upload files to Colab

Upload these files from this folder:
- `colab-opencode-api/server.py`
- `colab-opencode-api/run_colab.py`
- `colab-opencode-api/requirements.txt`
- `cloudflared-linux-amd64.deb` (from repo root)

### 1.2 Install dependencies in Colab

```python
%pip install -r colab-opencode-api/requirements.txt
```

### 1.3 Start the server

```python
%run colab-opencode-api/run_colab.py
```

This will:
1. Start FastAPI on port 8000
2. Create cloudflared tunnel
3. Print your WebSocket URL like: `wss://abc123.trycloudflare.com`

**Copy this URL** - you'll need it for Paperclip.

---

## Step 2: Windows (Paperclip Adapter)

### 2.1 Copy the adapter to your Paperclip installation

The adapter is in: `packages/adapters/opencode-remote/`

Copy this entire folder to your Windows Paperclip installation at:
```
packages/adapters/opencode-remote/
```

### 2.2 Add to pnpm workspace

In your Paperclip `package.json`, under `packages/adapters/`, add:
```json
"opencode-remote": "workspace:*"
```

### 2.3 Rebuild

```bash
pnpm install
pnpm build
```

---

## Step 3: Configure Paperclip Agent

### 3.1 Create new agent

In Paperclip web UI:
1. Go to **Agents** → **New Agent**
2. Select adapter type: **OpenCode Remote**
3. Enter config:
   - **WebSocket Tunnel URL**: Your wss:// URL from Colab (e.g., `wss://abc123.trycloudflare.com`)
4. Click **Test Environment** — this connects to the server and fetches available models
5. Select a model from the dropdown (e.g., `anthropic/claude-sonnet-4-5`)
6. Optionally set timeout and instructions file

### 3.2 Test the adapter

The "Test Environment" button validates your connection and automatically fetches available models from the remote server.

---

## Troubleshooting

### Colab connection refused
- Make sure the server is running in Colab
- Check the tunnel URL is correct
- Ensure firewall allows WebSocket connections

### "No such file or directory" error during execution
- This usually means the agent's workspace path (e.g., `C:\Users\...\project`) doesn't exist in Colab
- The adapter will automatically fall back to Colab's default working directory (`/content`)
- For best results, ensure any files the agent needs are uploaded to Colab first

### Session resume not working
- Each Colab runtime is ephemeral
- Sessions are stored in `/tmp/opencode-sessions`
- If Colab restarts, sessions are lost

### Timeout errors
- Increase timeout in adapter config
- Or set to 0 for no timeout

---

## Files Reference

### Colab files
- `server.py` - FastAPI WebSocket server
- `run_colab.py` - Startup script with tunnel
- `requirements.txt` - Python dependencies

### Adapter files  
- `src/server/execute.ts` - Main execution logic
- `src/ui/index.ts` - Config form fields
- `package.json` - Package config