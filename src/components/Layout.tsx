import { Outlet, NavLink } from 'react-router-dom'
import { Box, Server, Wrench, Puzzle, MessageSquare, GitBranch, Activity, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Agents', href: '/agents', icon: Box },
  { name: 'MCP Servers', href: '/mcp', icon: Server },
  { name: 'Skills', href: '/skills', icon: Wrench },
  { name: 'Plugins', href: '/plugins', icon: Puzzle },
  { name: 'Sessions', href: '/sessions', icon: MessageSquare },
  { name: 'Git Sync', href: '/sync', icon: GitBranch },
  { name: 'Status', href: '/status', icon: Activity },
]

export function Layout() {
  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Home className="h-6 w-6 text-primary" />
          <span className="ml-2 text-lg font-semibold">OpenCode Sync</span>
        </div>
        <nav className="space-y-1 p-4">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
