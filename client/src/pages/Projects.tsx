import { useState, useEffect } from 'react'
import { FolderKanban, Plus, Search, GitBranch, AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { api } from '../lib/api'
import type { Project } from '../lib/api'

const statusIcons = {
  synced: CheckCircle2,
  syncing: Clock,
  error: AlertCircle,
}

export default function Projects() {
  const [searchQuery, setSearchQuery] = useState('')
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)

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

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Project
        </Button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button variant="outline">Filter</Button>
      </div>

      {/* Projects Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredProjects.map((project) => {
          const StatusIcon = statusIcons[project.status as keyof typeof statusIcons] || CheckCircle2
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {project.type === 'github' ? (
                        <GitBranch className="h-6 w-6" />
                      ) : (
                      <FolderKanban className="h-6 w-6" />
                    )}
                    <div>
                      <CardTitle className="text-lg">{project.name}</CardTitle>
                      {project.type === 'github' && project.repo && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {project.repo}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant={project.type === 'github' ? 'default' : 'secondary'}>
                    {project.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{project.description}</p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{project.openIssues || 0}</p>
                      <p className="text-xs text-muted-foreground">Open Issues</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{project.issuesCount || 0}</p>
                      <p className="text-xs text-muted-foreground">Total Issues</p>
                    </div>
                  </div>
                </div>

                {/* Sync Status */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <StatusIcon className={`h-4 w-4 ${(project.status === 'synced' || !project.status) ? 'text-green-500' : project.status === 'syncing' ? 'text-yellow-500' : 'text-red-500'}`} />
                    <span className="text-xs text-muted-foreground">
                      {project.status === 'syncing' ? 'Syncing...' : `Synced ${project.lastSync || 'never'}`}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleSync(project.id)}>
                    Sync Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredProjects.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
            No projects found. Add your first project to get started.
          </div>
        )}
      </div>

      {/* Add Project Dialog */}
      {showAddDialog && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Add New Project</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button variant="outline" className="flex-1">
                  <GitBranch className="mr-2 h-4 w-4" />
                  GitHub Repo
                </Button>
                <Button variant="outline" className="flex-1">
                  <FolderKanban className="mr-2 h-4 w-4" />
                  Local Project
                </Button>
              </div>
              <Input placeholder="Repository URL or local path" />
              <p className="text-sm text-muted-foreground">
                Enter a GitHub repository URL (e.g., https://github.com/user/repo) or a local project path.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
                <Button onClick={() => setShowAddDialog(false)}>Add Project</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
