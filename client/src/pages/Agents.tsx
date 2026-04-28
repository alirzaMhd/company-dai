import { useState, useEffect } from 'react'
import { Plus, Search, MoreVertical, Wrench, Trash2, Pencil } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { api } from '../lib/api'
import type { Agent } from '../lib/api'

const statusColors = {
  online: 'bg-green-500',
  offline: 'bg-gray-500',
  busy: 'bg-yellow-500',
}

export default function Agents() {
  const [searchQuery, setSearchQuery] = useState('')
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    mode: 'Subagent',
    tools: '',
    model: '',
  })

  useEffect(() => {
    loadAgents()
  }, [])

  const loadAgents = async () => {
    try {
      const data = await api.getAgents()
      setAgents(data)
    } catch (error) {
      console.error('Failed to load agents:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (agent.description && agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleAddNew = () => {
    setEditingAgent(null)
    setFormData({ name: '', description: '', mode: 'Subagent', tools: '', model: '' })
    setShowDialog(true)
  }

  const handleEdit = (agent: Agent) => {
    setEditingAgent(agent)
    setFormData({
      name: agent.name,
      description: agent.description || '',
      mode: agent.mode || 'Subagent',
      tools: agent.tools ? (Array.isArray(agent.tools) ? agent.tools.join(', ') : agent.tools) : '',
      model: '',
    })
    setShowDialog(true)
  }

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete agent "${name}"?`)) return
    try {
      await api.deleteAgent(name)
      await loadAgents()
    } catch (error) {
      console.error('Failed to delete agent:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingAgent) {
        await api.updateAgent(editingAgent.name, {
          permissions: formData.tools.split(',').map(t => t.trim()).filter(Boolean),
        })
      } else {
        await api.createAgent({
          path: formData.name,
          description: formData.description,
          mode: formData.mode as any,
          tools: formData.tools,
          model: formData.model || undefined,
        } as any)
      }
      setShowDialog(false)
      await loadAgents()
    } catch (error) {
      console.error('Failed to save agent:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading agents...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agents</h2>
          <p className="text-muted-foreground">Manage your employee agents and their assignments.</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Add Agent
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Agents Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredAgents.map((agent) => (
          <Card key={agent.name} className="relative overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-semibold text-lg">{agent.name[0]}</span>
                    </div>
                    <div className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background ${statusColors[agent.status as keyof typeof statusColors] || 'bg-gray-500'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{agent.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={agent.mode === 'Primary' ? 'default' : 'secondary'}>
                        {agent.mode}
                      </Badge>
                    </div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleEdit(agent)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(agent.name)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {agent.description && (
                <p className="text-sm text-muted-foreground">{agent.description}</p>
              )}

              {/* Tools */}
              {agent.tools && agent.tools.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {agent.tools.map((tool) => (
                    <Badge key={tool} variant="outline" className="text-xs">
                      <Wrench className="h-3 w-3 mr-1" />
                      {tool}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {filteredAgents.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
            No agents found. Add your first agent to get started.
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAgent ? 'Edit Agent' : 'Add New Agent'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="agent-name"
                disabled={!!editingAgent}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Agent description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <select
                id="mode"
                value={formData.mode}
                onChange={(e) => setFormData({ ...formData, mode: e.target.value })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="Primary">Primary</option>
                <option value="Subagent">Subagent</option>
                <option value="All">All</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tools">Tools (comma-separated)</Label>
              <Input
                id="tools"
                value={formData.tools}
                onChange={(e) => setFormData({ ...formData, tools: e.target.value })}
                placeholder="tool1, tool2, tool3"
              />
            </div>
            {!editingAgent && (
              <div className="space-y-2">
                <Label htmlFor="model">Model (optional)</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="e.g., gpt-4"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingAgent ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
