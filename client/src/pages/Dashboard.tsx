import { Users, FolderKanban, MessageSquare, AlertCircle, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'

export default function Dashboard() {
  const stats = [
    { title: 'Total Agents', value: '12', icon: Users, change: '+2 this week', trend: 'up' },
    { title: 'Active Projects', value: '8', icon: FolderKanban, change: '+3 this month', trend: 'up' },
    { title: 'Open Issues', value: '24', icon: AlertCircle, change: '-5 from yesterday', trend: 'down' },
    { title: 'Messages Today', value: '156', icon: MessageSquare, change: '+12% vs avg', trend: 'up' },
  ]

  const recentActivity = [
    { agent: 'Agent-1', action: 'assigned to issue #123', time: '2 minutes ago', project: 'opencode' },
    { agent: 'Agent-2', action: 'completed issue #456', time: '15 minutes ago', project: 'dashboard' },
    { agent: 'Agent-3', action: 'started working on issue #789', time: '1 hour ago', project: 'api' },
    { agent: 'Agent-1', action: 'commented on issue #123', time: '2 hours ago', project: 'opencode' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your agents.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                {stat.trend === 'up' ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                )}
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
            {recentActivity.map((activity, i) => (
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
                  <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold">
                    {activity.project}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
