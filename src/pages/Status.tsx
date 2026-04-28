import { useState, useEffect } from 'react'
import { Activity, Box, Server, Wrench, Puzzle, MessageSquare, GitBranch } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface StatusData {
  agents: number
  mcp: number
  skills: number
  plugins: number
  sessions: number
  syncEnabled: boolean
}

export function Status() {
  const [status, setStatus] = useState<StatusData>({
    agents: 0,
    mcp: 0,
    skills: 0,
    plugins: 0,
    sessions: 0,
    syncEnabled: false,
  })

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    const [agents, mcp, skills, plugins, sessions, sync] = await Promise.all([
      fetch('/api/agents').then(r => r.json()),
      fetch('/api/mcp').then(r => r.json()),
      fetch('/api/skills').then(r => r.json()),
      fetch('/api/plugins').then(r => r.json()),
      fetch('/api/sessions').then(r => r.json()),
      fetch('/api/sync/status').then(r => r.json()),
    ])

    setStatus({
      agents: agents.agents?.length || 0,
      mcp: mcp.stored?.length || 0,
      skills: skills.stored?.length || 0,
      plugins: plugins.stored?.length || 0,
      sessions: sessions.sessions?.length || 0,
      syncEnabled: sync.enabled || false,
    })
  }

  const stats = [
    { name: 'Agents', value: status.agents, icon: Box, color: 'text-blue-500' },
    { name: 'MCP Servers', value: status.mcp, icon: Server, color: 'text-green-500' },
    { name: 'Skills', value: status.skills, icon: Wrench, color: 'text-yellow-500' },
    { name: 'Plugins', value: status.plugins, icon: Puzzle, color: 'text-purple-500' },
    { name: 'Sessions', value: status.sessions, icon: MessageSquare, color: 'text-pink-500' },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">System Status</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Git Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <GitBranch className={`h-4 w-4 ${status.syncEnabled ? 'text-green-500' : 'text-muted-foreground'}`} />
            <span className={status.syncEnabled ? 'text-green-500' : 'text-muted-foreground'}>
              {status.syncEnabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
