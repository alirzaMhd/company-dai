import { useState, useEffect } from 'react'
import { Plus, Search, ArrowUpDown, FolderGit2, GripVertical } from 'lucide-react'
import { Card, CardContent } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { api } from '../lib/api'
import type { Issue } from '../lib/api'

const columns = [
  { id: 'todo', title: 'To Do', color: 'bg-slate-500' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500' },
  { id: 'done', title: 'Done', color: 'bg-green-500' },
]

const priorityColors = {
  low: 'border-l-green-500',
  medium: 'border-l-yellow-500',
  high: 'border-l-red-500',
}

export default function Issues() {
  const [issues, setIssues] = useState<Issue[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)

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
    issue.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    issue.project?.toLowerCase().includes(searchQuery.toLowerCase())
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
        <Button>
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
                    className={`border-l-4 ${priorityColors[issue.priority as keyof typeof priorityColors] || 'border-l-gray-500'} hover:shadow-md transition-shadow cursor-pointer`}
                  >
                    <CardContent className="p-3 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="text-xs text-muted-foreground font-mono">
                            #{issue.number || issue.id}
                          </span>
                        </div>
                        <Badge
                          variant={
                            issue.priority === 'high' ? 'destructive' :
                            issue.priority === 'medium' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {issue.priority}
                        </Badge>
                      </div>

                      <div>
                        <h4 className="text-sm font-semibold leading-tight">{issue.title}</h4>
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

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-2 border-t border-border">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FolderGit2 className="h-3 w-3" />
                          {issue.project}
                        </div>

                        {issue.assignee ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground">{issue.assignee}</span>
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs">
                                {issue.assigneeAvatar || issue.assignee[0]}
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
                            <User className="h-3 w-3 mr-1" />
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
    </div>
  )
}

function User(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
