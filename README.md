# OpenCode Sync Manager

A web-based management system for OpenCode agents, skills, MCP servers, plugins, and session memory. Designed for **session-based computers** - sync everything across different machines via Git.

---

## Features

### Agent Management
- List all OpenCode agents with their permissions
- Create new agents with custom configuration
- Update agent permissions
- Delete agents

### MCP Server Management
- Add/remove MCP (Model Context Protocol) servers
- Store server configurations locally
- Support for local and remote MCP servers

### Skill Management
- Add custom skills to OpenCode
- Enable/disable skills per agent
- Store skill configurations in JSON

### Plugin Management
- Install/uninstall OpenCode plugins
- Track installed plugins with timestamps
- Support global and local installations

### Session Management
- Export sessions with full conversation memory
- Import sessions to restore state
- Sync all session metadata automatically
- Store session exports as JSON files

### Database Sync
- Copy OpenCode SQLite database for complete portability
- Store database in data folder for Git sync

### Git Auto-Sync
- Auto-commit changes when configurations are modified
- Auto-push to remote (if configured)
- File watcher for real-time sync
- Manual sync controls available

---

## Installation

```bash
# Clone the repository
git clone https://github.com/alirzaMhd/company-dai.git
cd opencode-sync

# Install dependencies
npm install

# Start the server
npm start
```

The server will run at **http://localhost:3000**

---

## Data Storage Structure

```
opencode-sync/
├── data/
│   ├── agents.json           # Agent configurations
│   ├── mcp-servers.json      # MCP server configs
│   ├── skills.json           # Skill configurations
│   ├── plugins.json          # Installed plugins
│   ├── providers.json        # Provider credentials
│   ├── sync-config.json      # Git sync configuration
│   ├── sessions/
│   │   ├── metadata.json     # Session list
│   │   └── exports/          # Exported session files
│   └── database/             # OpenCode database copy
├── public/
│   └── index.html            # Web UI
├── src/
│   ├── server.js             # Main server
│   ├── lib/                  # Core libraries
│   └── routes/               # API routes
├── package.json
├── .gitignore
└── README.md
```

---

## API Endpoints

### Agents
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List all agents |
| POST | `/api/agents` | Create new agent |
| PUT | `/api/agents/:name` | Update agent permissions |
| DELETE | `/api/agents/:name` | Delete agent |

### MCP Servers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/mcp` | List MCP servers |
| POST | `/api/mcp` | Add MCP server |
| DELETE | `/api/mcp/:name` | Remove MCP server |

### Skills
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/skills` | List skills |
| POST | `/api/skills` | Add skill |
| DELETE | `/api/skills/:name` | Remove skill |

### Plugins
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/plugins` | List plugins |
| POST | `/api/plugins` | Install plugin |
| DELETE | `/api/plugins/:module` | Uninstall plugin |

### Sessions
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sessions` | List sessions |
| POST | `/api/sessions/export/:id` | Export session |
| GET | `/api/sessions/export/:id` | Get exported session |
| POST | `/api/sessions/import` | Import session |
| POST | `/api/sessions/sync-all` | Sync all sessions |

### Git Sync
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sync/status` | Get sync status |
| POST | `/api/sync/enable` | Enable auto-sync |
| POST | `/api/sync/disable` | Disable auto-sync |
| POST | `/api/sync/remote` | Set remote URL |
| POST | `/api/sync/sync` | Manual sync |
| POST | `/api/sync/pull` | Pull from remote |
| POST | `/api/sync/push` | Push to remote |

---

## Git Sync Setup

### Enable Git Sync

```bash
# Via API
curl -X POST http://localhost:3000/api/sync/enable \
  -H "Content-Type: application/json" \
  -d '{"remote": "https://github.com/alirzaMhd/company-dai.git"}'
```

### Manual Sync

```bash
# Sync now
curl -X POST http://localhost:3000/api/sync/sync

# Pull from remote
curl -X POST http://localhost:3000/api/sync/pull

# Push to remote
curl -X POST http://localhost:3000/api/sync/push
```

---

## Session-Based Computer Workflow

This tool is designed for use on temporary session-based computers:

### On Current Computer
1. Run `npm start`
2. Make changes to agents, skills, MCP, plugins, sessions
3. All changes auto-sync to Git

### On New Computer
```bash
# Clone the repository
git clone https://github.com/alirzaMhd/company-dai.git
cd company-dai

# Install dependencies
npm install

# Start the server
npm start

# Pull latest changes
curl -X POST http://localhost:3000/api/sync/pull
```

### Restore Everything
All configurations, sessions, and database are stored in the `data/` folder and will be restored on the new computer.

---

## Configuration

### Web UI
Access the dashboard at **http://localhost:3000**

### Environment Variables
- `PORT` - Server port (default: 3000)

---

## Requirements

- Node.js 16+
- OpenCode CLI installed locally
- Git

---

## License

ISC

---

## Author

Created for company-dai workflow management