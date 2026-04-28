import { useState, useEffect } from 'react'
import { Plus, Trash2, Server } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface MCPServer {
  name: string
  type: string
  command: string
}

export function MCPServers() {
  const [servers, setServers] = useState<MCPServer[]>([])
  const [name, setName] = useState('')
  const [type, setType] = useState('local')
  const [command, setCommand] = useState('')

  useEffect(() => {
    loadServers()
  }, [])

  async function loadServers() {
    const res = await fetch('/api/mcp')
    const data = await res.json()
    setServers(data.stored || [])
  }

  async function addServer() {
    const res = await fetch('/api/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, type, command }),
    })
    const data = await res.json()
    if (data.success) {
      setName('')
      setCommand('')
      loadServers()
    } else {
      alert(data.error)
    }
  }

  async function deleteServer(name: string) {
    await fetch(`/api/mcp/${name}`, { method: 'DELETE' })
    loadServers()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">MCP Servers</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add MCP Server</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Server Name</label>
              <Input
                placeholder="server-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="local">Local</option>
                <option value="remote">Remote</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Command/URL</label>
              <Input
                placeholder="npx or https://..."
                value={command}
                onChange={(e) => setCommand(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addServer}>
            <Plus className="mr-2 h-4 w-4" />
            Add MCP Server
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {servers.map((server) => (
          <Card key={server.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="h-4 w-4" />
                  {server.name}
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteServer(server.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Type: {server.type}</p>
              <p className="text-sm text-muted-foreground">{server.command}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
