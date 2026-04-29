import { clsx } from 'clsx';
import { Bot, DollarSign, Clock } from 'lucide-react';

interface AgentCardProps {
  id: string;
  name: string;
  nameKey: string;
  status: 'running' | 'active' | 'paused' | 'idle' | 'error' | 'terminated';
  role?: string;
  icon?: string;
  monthlyBudget: number;
  currentCost: number;
  lastHeartbeatAt?: string;
  onClick?: () => void;
}

const statusColors = {
  running: 'border-l-cyan-400',
  active: 'border-l-green-400',
  paused: 'border-l-yellow-400',
  idle: 'border-l-yellow-400',
  error: 'border-l-red-400',
  terminated: 'border-l-gray-400'
};

const statusLabels = {
  running: 'Running',
  active: 'Active',
  paused: 'Paused',
  idle: 'Idle',
  error: 'Error',
  terminated: 'Terminated'
};

export function AgentCard({
  id,
  name,
  nameKey,
  status,
  role,
  monthlyBudget,
  currentCost,
  lastHeartbeatAt,
  onClick
}: AgentCardProps) {
  const budgetPercentage = monthlyBudget > 0 ? (currentCost / monthlyBudget) * 100 : 0;

  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-4 border rounded-lg bg-card hover:shadow-md cursor-pointer transition-shadow border-l-4',
        statusColors[status]
      )}
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
          <Bot className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium">{name}</p>
          <p className="text-xs text-muted-foreground font-mono">{nameKey}</p>
          {role && (
            <p className="text-xs text-muted-foreground mt-1">{role}</p>
          )}
        </div>
        <span className="text-xs px-2 py-1 rounded bg-muted">
          {statusLabels[status]}
        </span>
      </div>
      <div className="mt-3 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground flex items-center gap-1">
            <DollarSign className="w-3 h-3" />
            Budget
          </span>
          <span>${currentCost.toFixed(2)} / ${monthlyBudget.toFixed(2)}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={clsx(
              'h-full rounded-full',
              budgetPercentage > 80 ? 'bg-red-500' : budgetPercentage > 50 ? 'bg-amber-500' : 'bg-green-500'
            )}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>
        {lastHeartbeatAt && (
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="w-3 h-3" />
            Last run: {new Date(lastHeartbeatAt).toLocaleString()}
          </p>
        )}
      </div>
    </div>
  );
}