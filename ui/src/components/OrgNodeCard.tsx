import { clsx } from 'clsx';
import { Bot } from 'lucide-react';

interface OrgNodeCardProps {
  id: string;
  name: string;
  role?: string;
  status: 'running' | 'active' | 'paused' | 'idle' | 'error' | 'terminated';
  icon?: string;
  adapterType?: string;
  onClick?: () => void;
}

const statusColors = {
  running: 'bg-cyan-400',
  active: 'bg-green-400',
  paused: 'bg-yellow-400',
  idle: 'bg-yellow-400',
  error: 'bg-red-400',
  terminated: 'bg-gray-400'
};

export function OrgNodeCard({ id, name, role, status, icon, adapterType, onClick }: OrgNodeCardProps) {
  return (
    <div
      onClick={onClick}
      className="w-[200px] p-3 border rounded-lg bg-card hover:shadow-md cursor-pointer transition-shadow"
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
            {icon ? (
              <img src={icon} alt={name} className="w-9 h-9 rounded-full" />
            ) : (
              <Bot className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className={clsx(
            'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
            statusColors[status]
          )} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          {role && (
            <p className="text-xs text-muted-foreground truncate">{role}</p>
          )}
        </div>
      </div>
      {adapterType && (
        <p className="mt-2 text-xs text-muted-foreground font-mono">{adapterType}</p>
      )}
    </div>
  );
}