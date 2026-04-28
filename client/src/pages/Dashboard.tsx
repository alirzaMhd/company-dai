import { useState, useEffect } from 'react'
import { Users, FolderKanban, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { api } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeProjects: 0,
    openIssues: 0,
    messagesToday: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [agents, projects, issues, chatHistory] = await Promise.all([
        api.getAgents(),
        api.getProjects(),
        api.getIssues(),
        api.getChatHistory(),
      ])

      setStats({
        totalAgents: agents.length,
        activeProjects: projects.length,
        openIssues: issues.filter((i: any) => i.status !== 'done').length,
        messagesToday: chatHistory.filter((m: any) => {
          const today = new Date().toDateString()
          return new Date(m.timestamp).toDateString() === today
        }).length,
      })

      // Build recent activity from chat history and issues
      const activity: any[] = []

      // Add recent chat messages
      chatHistory.slice(-5).reverse().forEach((msg: any) => {
        if (msg.action?.type === 'assign_issue') {
          activity.push({
            agent: msg.action.agentName || 'System',
            action: `assigned to issue #${msg.action.issueNumber}`,
            time: new Date(msg.timestamp).toLocaleString(),
            project: 'chat',
          })
        }
      })

      // Add recent issues
      issues.slice(-3).reverse().forEach((issue: any) => {
        activity.push({
          agent: issue.assignee || 'Unassigned',
          action: `${issue.status === 'done' ? 'completed' : 'updated'} issue #${issue.number || issue.id}`,
          time: new Date(issue.createdAt || Date.now()).toLocaleString(),
          project: issue.project || 'general',
        })
      })

      setRecentActivity(activity.slice(0, 5))
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statsData = [
    { title: 'Total Agents', value: stats.totalAgents.toString(), icon: Users, change: `${stats.totalAgents} configured`, trend: 'up' as const },
    { title: 'Active Projects', value: stats.activeProjects.toString(), icon: FolderKanban, change: `${stats.activeProjects} synced`, trend: 'up' as const },
    { title: 'Open Issues', value: stats.openIssues.toString(), icon: AlertCircle, change: `${stats.openIssues} pending`, trend: stats.openIssues > 0 ? 'up' as const : 'down' as const },
    { title: 'Messages Today', value: stats.messagesToday.toString(), icon: MessageSquare, change: 'from chat', trend: 'up' as const },
  ]

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading dashboard...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your agents.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsData.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className={`h-3 w-3 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500 rotate-180'}`} />
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity. Start by creating issues or chatting with agents!</p>
            ) : (
              recentActivity.map((activity, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex items-center gap-4">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary text-xs font-medium">{activity.agent[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{activity.agent}</p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                    <Badge variant="outline" className="text-xs">
                      {activity.project}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
