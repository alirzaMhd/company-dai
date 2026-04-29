#!/usr/bin/env python3
"""
Startup script for Colab OpenCode API server with cloudflared tunnel.
Runs in background to keep the server alive in Colab.
"""

import subprocess
import threading
import time
import sys
import signal
import os
import re
from pathlib import Path

# Global process references for cleanup
server_proc = None
tunnel_proc = None


def cleanup(signum=None, frame=None):
    """Kill processes on port 3100 when cell is stopped."""
    global server_proc, tunnel_proc
    print("\nCleaning up...")
    if tunnel_proc:
        try:
            tunnel_proc.terminate()
            tunnel_proc.wait(timeout=5)
        except:
            pass
    if server_proc:
        try:
            server_proc.terminate()
            server_proc.wait(timeout=5)
        except:
            pass
    subprocess.run(["pkill", "-f", "uvicorn"], capture_output=True)
    subprocess.run(["pkill", "-f", "cloudflared"], capture_output=True)
    print("Cleanup complete")


signal.signal(signal.SIGINT, cleanup)
signal.signal(signal.SIGTERM, cleanup)


def find_cloudflared():
    """Find cloudflared binary."""
    for path in [
        Path("/tmp/cloudflared"),
        Path("cloudflared"),
    ]:
        if path.exists():
            return str(path)
    return None


def install_cloudflared():
    """Install cloudflared to /tmp."""
    import urllib.request
    
    cloudflared_path = Path("/tmp/cloudflared")
    if cloudflared_path.exists():
        cloudflared_path.chmod(0o755)
        return str(cloudflared_path)
    
    url = "https://github.com/cloudflare/cloudflared/releases/download/2024.8.3/cloudflared-linux-amd64"
    try:
        print("Downloading cloudflared...")
        urllib.request.urlretrieve(url, cloudflared_path)
        cloudflared_path.chmod(0o755)
        return str(cloudflared_path)
    except Exception as e:
        print(f"Failed to download cloudflared: {e}")
        return None


def start_tunnel():
    """Start cloudflared tunnel in background thread."""
    global tunnel_proc
    cloudflared = find_cloudflared() or install_cloudflared()
    if not cloudflared:
        print("WARNING: cloudflared not available")
        return None
    
    print(f"Starting tunnel with {cloudflared}...")
    
    tunnel_proc = subprocess.Popen(
        [cloudflared, "tunnel", "--url", "http://localhost:3100"],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    
    # Wait for tunnel URL (read output until we get URL)
    url = None
    deadline = time.time() + 30
    while time.time() < deadline:
        line = tunnel_proc.stdout.readline()
        if line:
            decoded = line.decode().strip()
            print(f"[tunnel] {decoded}")
            # Extract URL from any line
            if ".trycloudflare.com" in decoded:
                match = re.search(r'https?://[a-zA-Z0-9\-]+\.trycloudflare\.com', decoded)
                if match:
                    url = match.group(0)
                    break
            if "url=" in decoded:
                url = decoded.split("url=")[1].strip()
                break
            if tunnel_proc.poll() is not None:
                break
        else:
            time.sleep(0.1)
    
    if url:
        print(f"\n>>> TUNNEL URL: {url}")
        Path("/tmp/opencode-tunnel-url").write_text(url)
        return url
    
    print("Failed to get tunnel URL")
    return None


def start_server():
    """Start API server."""
    global server_proc
    server_proc = subprocess.Popen(
        ["python", "-m", "uvicorn", "server:app", "--host", "0.0.0.0", "--port", "3100"],
        cwd="/content/custom-paperclip/colab-opencode-api",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )


def main():
    print("=" * 60)
    print("OpenCode API Server for Colab")
    print("=" * 60)
    
    # Ensure cloudflared is available
    cloudflared = find_cloudflared()
    if not cloudflared:
        print("Installing cloudflared...")
        install_cloudflared()
    
    # Start server
    print("\nStarting API server on port 3100...")
    start_server()
    time.sleep(2)
    
    # Start tunnel
    print("Starting cloudflared tunnel...")
    tunnel_url = start_tunnel()
    
    if tunnel_url:
        print("\n" + "=" * 60)
        print("TUNNEL URL:")
        print("=" * 60)
        print(f"\n{tunnel_url}\n")
        print("=" * 60)
    else:
        print("Tunnel failed to start")
    
    print("\n Keeping connection alive...")
    print("To stop: Cell menu -> Interrupt execution")
    
    # Keep running to maintain connection
    print("\n[Running - Cell menu->Interrupt to stop]")
    try:
        while True:
            time.sleep(60)
            print(".", end="", flush=True)
            
            # Check if tunnel/server died
            if tunnel_proc and tunnel_proc.poll() is not None:
                print("\nTunnel disconnected!")
                break
            if server_proc and server_proc.poll() is not None:
                print("\nServer stopped!")
                break
    except KeyboardInterrupt:
        pass
    
    cleanup()


if __name__ == "__main__":
    main()