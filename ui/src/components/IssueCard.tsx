import { clsx } from 'clsx';
import { Bot, User } from 'lucide-react';

interface IssueCardProps {
  id: string;
  identifier: string;
  title: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'in_review' | 'blocked' | 'done' | 'cancelled';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assigneeAgentId?: string;
  assigneeUserId?: string;
  onClick?: () => void;
}

const statusColors = {
  backlog: 'bg-gray-100 border-gray-200',
  todo: 'bg-blue-50 border-blue-200',
  in_progress: 'bg-amber-50 border-amber-200',
  in_review: 'bg-purple-50 border-purple-200',
  blocked: 'bg-red-50 border-red-200',
  done: 'bg-green-50 border-green-200',
  cancelled: 'bg-gray-50 border-gray-200'
};

const priorityColors = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-blue-500',
  low: 'bg-gray-500'
};

export function IssueCard({
  id,
  identifier,
  title,
  status,
  priority,
  assigneeAgentId,
  assigneeUserId,
  onClick
}: IssueCardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        'p-3 border rounded-lg bg-card hover:shadow-md cursor-pointer transition-shadow',
        statusColors[status]
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">{identifier}</p>
          <p className="font-medium text-sm mt-1 line-clamp-2">{title}</p>
        </div>
        <div className={clsx(
          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
          priorityColors[priority]
        )} />
      </div>
      <div className="mt-2 flex items-center gap-1">
        {assigneeAgentId ? (
          <Bot className="w-4 h-4 text-muted-foreground" />
        ) : assigneeUserId ? (
          <User className="w-4 h-4 text-muted-foreground" />
        ) : null}
      </div>
    </div>
  );
}