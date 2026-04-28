import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Agent {
  name: string
  mode: string
  permissions?: string[]
}

export function Agents() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [mode, setMode] = useState('primary')
  const [tools, setTools] = useState('')

  useEffect(() => {
    loadAgents()
  }, [])

  async function loadAgents() {
    const res = await fetch('/api/agents')
    const data = await res.json()
    setAgents(data.agents || [])
  }

  async function createAgent() {
    const res = await fetch('/api/agents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, description: desc, mode, tools }),
    })
    const data = await res.json()
    if (data.success) {
      setName('')
      setDesc('')
      setTools('')
      loadAgents()
    } else {
      alert(data.error)
    }
  }

  async function deleteAgent(name: string) {
    if (!confirm(`Delete agent: ${name}?`)) return
    await fetch(`/api/agents/${name}`, { method: 'DELETE' })
    loadAgents()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Agents</h1>

      {/* Create Agent Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Agent Name</label>
              <Input
                placeholder="my-agent"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Agent purpose"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mode</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="primary">Primary</option>
                <option value="subagent">Subagent</option>
                <option value="all">All</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tools (comma-separated)</label>
              <Input
                placeholder="bash,read,write,edit,glob,grep"
                value={tools}
                onChange={(e) => setTools(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={createAgent}>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </CardContent>
      </Card>

      {/* Agents List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {agent.name}
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteAgent(agent.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Mode: {agent.mode}</p>
              <p className="text-sm text-muted-foreground">
                Permissions: {agent.permissions?.length || 0} rules
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
