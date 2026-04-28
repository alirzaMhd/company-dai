import { useState, useEffect } from 'react'
import { Plus, Trash2, Server, CheckCircle, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { api, type MCPServer } from '../lib/api'

export default function MCP() {
  const [mcpData, setMcpData] = useState<{ servers: string; stored: MCPServer[] }>({ servers: '', stored: [] })
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({ name: '', type: 'stdio', command: '' })

  useEffect(() => {
    loadMCP()
  }, [])

  const loadMCP = async () => {
    try {
      const data = await api.getMCPServers()
      setMcpData(data)
    } catch (error) {
      console.error('Failed to load MCP servers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      await api.addMCPServer(formData)
      setShowDialog(false)
      setFormData({ name: '', type: 'stdio', command: '' })
      loadMCP()
    } catch (error) {
      console.error('Failed to add MCP server:', error)
    }
  }

  const handleRemove = async (name: string) => {
    if (!confirm(`Are you sure you want to remove MCP server "${name}"?`)) return
    try {
      await api.removeMCPServer(name)
      loadMCP()
    } catch (error) {
      console.error('Failed to remove MCP server:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading MCP servers...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">MCP Servers</h2>
          <p className="text-muted-foreground">Manage Model Context Protocol servers.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Server
        </Button>
      </div>

      {mcpData.servers && mcpData.servers !== 'No MCP servers' && (
        <Card>
          <CardHeader>
            <CardTitle>OpenCode MCP Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {mcpData.servers}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mcpData.stored.map((server) => (
          <Card key={server.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  {server.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {server.status === 'connected' ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-muted-foreground" />
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(server.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">{server.type}</Badge>
              </div>
              {server.command && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Command:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{server.command}</code>
                </div>
              )}
              <Badge variant={server.status === 'connected' ? 'default' : 'secondary'}>
                {server.status}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {mcpData.stored.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
            No MCP servers configured. Add your first server to get started.
          </div>
        )}
      </div>

      {/* Add MCP Server Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add MCP Server</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Server Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-mcp-server"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="stdio">stdio</option>
                <option value="sse">sse</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="command">Command</Label>
              <Input
                id="command"
                value={formData.command}
                onChange={(e) => setFormData({ ...formData, command: e.target.value })}
                placeholder="node server.js"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Server</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
