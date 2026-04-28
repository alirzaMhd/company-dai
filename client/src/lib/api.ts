const API_BASE = '/api'

export interface Agent {
  id: string
  name: string
  description: string
  mode: 'Primary' | 'Subagent' | 'All'
  status: 'online' | 'offline' | 'busy'
  tools: string[]
  assignedIssues: number
  completedToday: number
  avatar: string
  permissions?: any[]
}

export interface Project {
  id: string
  name: string
  description: string
  type: 'local' | 'github'
  owner?: string
  repo?: string
  issuesCount: number
  openIssues: number
  lastSync: string
  status: 'synced' | 'syncing' | 'error'
}

export interface Issue {
  id: number
  number: number
  title: string
  description: string
  status: 'todo' | 'in-progress' | 'done'
  priority: 'low' | 'medium' | 'high'
  assignee?: string
  assigneeAvatar?: string
  project: string
  projectId?: string
  labels: string[]
}

export interface Skill {
  name: string
  description?: string
  enabled: boolean
  addedAt?: string
}

export interface MCPServer {
  name: string
  type: string
  command?: string
  status: 'connected' | 'disconnected'
}

export interface Plugin {
  module: string
  version?: string
  installedAt?: string
  global: boolean
}

export interface Session {
  id: string
  title: string
  syncedAt?: string
}

export interface TaskStep {
  id: string
  agentName: string
  prompt: string
  dependsOn?: string | null
  status: 'pending' | 'running' | 'completed' | 'failed'
  result?: any
  nextStep?: string
}

export interface Task {
  id: string
  name: string
  description: string
  steps: TaskStep[]
  status: 'pending' | 'running' | 'completed' | 'failed'
  createdAt: string
  completedAt?: string
}

export interface SyncStatus {
  enabled: boolean
  remote?: string
  lastSync?: string
  status: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'system' | 'agent'
  content: string
  timestamp: Date
  agentName?: string
}

export const api = {
  // Agents
  async getAgents(): Promise<Agent[]> {
    const res = await fetch(`${API_BASE}/agents`)
    return res.json()
  },

  async createAgent(data: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async updateAgent(name: string, data: Partial<Agent>): Promise<Agent> {
    const res = await fetch(`${API_BASE}/agents/${name}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async deleteAgent(name: string): Promise<void> {
    await fetch(`${API_BASE}/agents/${name}`, {
      method: 'DELETE',
    })
  },

  // Projects
  async getProjects(): Promise<Project[]> {
    const res = await fetch(`${API_BASE}/projects`)
    return res.json()
  },

  async createProject(data: Partial<Project>): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async syncProject(id: string): Promise<Project> {
    const res = await fetch(`${API_BASE}/projects/${id}/sync`, {
      method: 'POST',
    })
    return res.json()
  },

  async deleteProject(id: string): Promise<void> {
    await fetch(`${API_BASE}/projects/${id}`, {
      method: 'DELETE',
    })
  },

  // Issues
  async getIssues(): Promise<Issue[]> {
    const res = await fetch(`${API_BASE}/issues`)
    return res.json()
  },

  async createIssue(data: Partial<Issue>): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async updateIssue(id: string, data: Partial<Issue>): Promise<Issue> {
    const res = await fetch(`${API_BASE}/issues/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async deleteIssue(id: string): Promise<void> {
    await fetch(`${API_BASE}/issues/${id}`, {
      method: 'DELETE',
    })
  },

  // Skills
  async getSkills(): Promise<{ skills: any[]; stored: Skill[] }> {
    const res = await fetch(`${API_BASE}/skills`)
    return res.json()
  },

  async addSkill(data: Partial<Skill>): Promise<Skill> {
    const res = await fetch(`${API_BASE}/skills`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async removeSkill(name: string): Promise<void> {
    await fetch(`${API_BASE}/skills/${name}`, {
      method: 'DELETE',
    })
  },

  // MCP Servers
  async getMCPServers(): Promise<{ servers: string; stored: MCPServer[] }> {
    const res = await fetch(`${API_BASE}/mcp`)
    return res.json()
  },

  async addMCPServer(data: { name: string; type: string; command: string }): Promise<any> {
    const res = await fetch(`${API_BASE}/mcp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async removeMCPServer(name: string): Promise<void> {
    await fetch(`${API_BASE}/mcp/${name}`, {
      method: 'DELETE',
    })
  },

  // Plugins
  async getPlugins(): Promise<{ plugins: string; stored: Plugin[] }> {
    const res = await fetch(`${API_BASE}/plugins`)
    return res.json()
  },

  async installPlugin(data: { module: string; global?: boolean }): Promise<any> {
    const res = await fetch(`${API_BASE}/plugins`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async uninstallPlugin(module: string): Promise<void> {
    await fetch(`${API_BASE}/plugins/${module}`, {
      method: 'DELETE',
    })
  },

  // Sessions
  async getSessions(): Promise<{ sessions: Session[] }> {
    const res = await fetch(`${API_BASE}/sessions`)
    return res.json()
  },

  async exportSession(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/export/${id}`, {
      method: 'POST',
    })
    return res.json()
  },

  async importSession(data: any): Promise<void> {
    await fetch(`${API_BASE}/sessions/import`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  async syncAllSessions(): Promise<any> {
    const res = await fetch(`${API_BASE}/sessions/sync-all`, {
      method: 'POST',
    })
    return res.json()
  },

  // Sync
  async getSyncStatus(): Promise<SyncStatus> {
    const res = await fetch(`${API_BASE}/sync/status`)
    return res.json()
  },

  async enableSync(remote: string): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/enable`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remote }),
    })
    return res.json()
  },

  async disableSync(): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/disable`, {
      method: 'POST',
    })
    return res.json()
  },

  async syncNow(): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/sync`, {
      method: 'POST',
    })
    return res.json()
  },

  async pullChanges(): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/pull`, {
      method: 'POST',
    })
    return res.json()
  },

  async pushChanges(): Promise<any> {
    const res = await fetch(`${API_BASE}/sync/push`, {
      method: 'POST',
    })
    return res.json()
  },

  // Chat
  async sendMessage(message: string): Promise<{ message: string; action: any }> {
    const res = await fetch(`${API_BASE}/chat/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    })
    return res.json()
  },

  async getChatHistory(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/chat/history`)
    return res.json()
  },

  // Tasks (Multi-Step)
  async getTasks(): Promise<Task[]> {
    const res = await fetch(`${API_BASE}/tasks`)
    return res.json()
  },

  async createTask(data: Partial<Task>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },

  async getTask(id: string): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${id}`)
    return res.json()
  },

  async executeTask(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${id}/execute`, {
      method: 'POST',
    })
    return res.json()
  },

  async cancelTask(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${id}/cancel`, {
      method: 'POST',
    })
    return res.json()
  },

  async deleteTask(id: string): Promise<any> {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'DELETE',
    })
    return res.json()
  },

  async updateTaskStep(taskId: string, stepId: string, data: Partial<TaskStep>): Promise<Task> {
    const res = await fetch(`${API_BASE}/tasks/${taskId}/steps/${stepId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    return res.json()
  },
}
