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
  labels: string[]
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
}
