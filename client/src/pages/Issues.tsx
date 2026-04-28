import { useState, useEffect } from 'react'
import { Plus, Search, ArrowUpDown, FolderGit2, GripVertical, Trash2 } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { api, type Issue } from '../lib/api'

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
]

const priorityColors: Record<string, string> = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
}

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingIssue, setEditingIssue] = useState<Issue | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    projectId: '',
    status: 'todo' as 'todo' | 'in-progress' | 'done',
  })

  useEffect(() => {
    loadIssues()
  }, [])

  const loadIssues = async () => {
    try {
      const data = await api.getIssues()
      setIssues(data)
    } catch (error) {
      console.error('Failed to load issues:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredIssues = issues.filter(issue =>
    issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (issue.project && issue.project.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const getIssuesByStatus = (status: string) => {
    return filteredIssues.filter(issue => issue.status === status)
  }

  const handleAssign = async (issueId: string, agentName: string) => {
    try {
      await api.updateIssue(issueId, { assignee: agentName, status: 'in-progress' })
      loadIssues()
    } catch (error) {
      console.error('Failed to assign issue:', error)
    }
  }

  const handleCreateNew = () => {
    setEditingIssue(null)
    setFormData({ title: '', description: '', priority: 'medium', projectId: '', status: 'todo' })
    setShowDialog(true)
  }

  const handleEdit = (issue: Issue) => {
    setEditingIssue(issue)
    setFormData({
      title: issue.title,
      description: issue.description || '',
      priority: issue.priority || 'medium',
      projectId: issue.projectId || '',
      status: issue.status || 'todo',
    })
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this issue?')) return
    try {
      await api.deleteIssue(id)
      loadIssues()
    } catch (error) {
      console.error('Failed to delete issue:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      if (editingIssue) {
        await api.updateIssue(editingIssue.id.toString(), formData)
      } else {
        await api.createIssue(formData)
      }
      setShowDialog(false)
      loadIssues()
    } catch (error) {
      console.error('Failed to save issue:', error)
    }
  }

  const handleStatusChange = async (issueId: string, newStatus: 'todo' | 'in-progress' | 'done') => {
    try {
      await api.updateIssue(issueId, { status: newStatus })
      loadIssues()
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading issues...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Issues</h2>
          <p className="text-muted-foreground">Track and assign issues across all projects.</p>
        </div>
        <Button onClick={handleCreateNew}>
          <Plus className="mr-2 h-4 w-4" />
          Create Issue
        </Button>
      </div>

      {/* Search and filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="icon">
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[600px]">
        {columns.map((column) => {
          const columnIssues = getIssuesByStatus(column.id)
          return (
            <div key={column.id} className="flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <div className={`h-2 w-2 rounded-full ${column.color}`} />
                <h3 className="font-semibold text-sm">{column.title}</h3>
                <Badge variant="secondary" className="ml-auto">
                  {columnIssues.length}
                </Badge>
              </div>

              <div className="flex-1 space-y-3 bg-muted/50 rounded-lg p-3">
                {columnIssues.map((issue) => (
                  <Card
                    key={issue.id}
                    className={`border-l-4 ${priorityColors[issue.priority] || 'border-l-gray-500'} hover:shadow-md transition-shadow`}
                  >
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="text-xs text-muted-foreground font-mono">
                            #{issue.number || issue.id}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge
                            variant={
                              issue.priority === 'high' ? 'destructive' :
                              issue.priority === 'medium' ? 'default' : 'secondary'
                            }
                            className="text-xs"
                          >
                            {issue.priority}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleEdit(issue)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleDelete(issue.id.toString())}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold leading-tight cursor-pointer" onClick={() => handleEdit(issue)}>
                          {issue.title}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {issue.description}
                        </p>
                      </div>

                      {/* Labels */}
                      {issue.labels && issue.labels.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {issue.labels.map((label) => (
                            <Badge key={label} variant="outline" className="text-xs">
                              {label}
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Status Quick Change */}
                      <div className="flex gap-1 pt-2 border-t border-border">
                        {columns.filter(c => c.id !== issue.status).map(col => (
                          <Button
                            key={col.id}
                            variant="ghost"
                            size="sm"
                            className="h-5 text-xs"
                            onClick={() => handleStatusChange(issue.id.toString(), col.id as 'todo' | 'in-progress' | 'done')}
                          >
                            → {col.title}
                          </Button>
                        ))}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FolderGit2 className="h-3 w-3" />
                          {issue.project}
                        </div>

                        {issue.assignee ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{issue.assignee}</span>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {(issue.assigneeAvatar || issue.assignee[0])}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs"
                            onClick={() => handleAssign(issue.id.toString(), 'Agent-Alpha')}
                          >
                            Assign
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnIssues.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    No issues
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingIssue ? 'Edit Issue' : 'Create New Issue'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Issue title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Issue description"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as 'todo' | 'in-progress' | 'done' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingIssue ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
