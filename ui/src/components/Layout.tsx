import { Outlet, NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  Users,
  GitBranch,
  Bot,
  Target,
  FolderKanban,
  ListTodo,
  CheckCircle2,
  DollarSign,
  Clock,
  Settings,
  Image,
  Inbox,
  FolderOutput,
  Heart
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Companies', href: '/companies', icon: Users },
  { name: 'Org Chart', href: '/org', icon: GitBranch },
  { name: 'Agents', href: '/agents', icon: Bot },
  { name: 'Goals', href: '/goals', icon: Target },
  { name: 'Projects', href: '/projects', icon: FolderKanban },
  { name: 'Issues', href: '/issues', icon: ListTodo },
  { name: 'Approvals', href: '/approvals', icon: CheckCircle2 },
  { name: 'Costs', href: '/costs', icon: DollarSign },
  { name: 'Routines', href: '/routines', icon: Clock },
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Assets', href: '/assets', icon: Image },
  { name: 'Inbox', href: '/inbox', icon: Inbox },
  { name: 'Live', href: '/live', icon: Heart },
];

function Layout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-card">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Company-dai</h1>
        </div>
        <nav className="p-2 space-y-1">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              end={item.href === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;