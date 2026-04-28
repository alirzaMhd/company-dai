import { useState, useEffect } from 'react'
import { FolderKanban, Plus, GitBranch, RefreshCw, Trash2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { api, type Project } from '../lib/api'

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '', type: 'local' as 'local' | 'github', repoUrl: '' })

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      const data = await api.getProjects()
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async (id: string) => {
    try {
      await api.syncProject(id)
      loadProjects()
    } catch (error) {
      console.error('Failed to sync project:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return
    try {
      await api.deleteProject(id)
      loadProjects()
    } catch (error) {
      console.error('Failed to delete project:', error)
    }
  }

  const handleSubmit = async () => {
    try {
      await api.createProject(formData)
      setShowDialog(false)
      setFormData({ name: '', description: '', type: 'local', repoUrl: '' })
      loadProjects()
    } catch (error) {
      console.error('Failed to create project:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading projects...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
          <p className="text-muted-foreground">Manage your local and GitHub projects.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {project.type === 'github' ? (
                    <GitBranch className="h-5 w-5" />
                  ) : (
                    <FolderKanban className="h-5 w-5" />
                  )}
                  {project.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === 'synced' ? 'default' : 'secondary'}>
                    {project.status || 'unknown'}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(project.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{project.description}</p>

              {project.type === 'github' && project.repo && (
                <p className="text-xs text-muted-foreground">Repo: {project.repo}</p>
              )}

              <div className="flex items-center justify-between text-sm">
                <span>{project.openIssues || 0} open issues</span>
                {project.lastSync && (
                  <span className="text-xs text-muted-foreground">
                    Last sync: {new Date(project.lastSync).toLocaleDateString()}
                  </span>
                )}
              </div>

              {project.type === 'github' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleSync(project.id)}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync
                </Button>
              )}
            </CardContent>
          </Card>
        ))}

        {projects.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
            No projects found. Add your first project to get started.
          </div>
        )}
      </div>

      {/* Add Project Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Project Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-project"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Project description"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <select
                id="type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'local' | 'github' })}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="local">Local</option>
                <option value="github">GitHub</option>
              </select>
            </div>
            {formData.type === 'github' && (
              <div className="space-y-2">
                <Label htmlFor="repoUrl">Repository URL</Label>
                <Input
                  id="repoUrl"
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({ ...formData, repoUrl: e.target.value })}
                  placeholder="https://github.com/user/repo"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Create Project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
