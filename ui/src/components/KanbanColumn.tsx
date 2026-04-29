import { useState } from 'react';
import { clsx } from 'clsx';
import { ChevronDown, ChevronRight } from 'lucide-react';

interface KanbanColumnProps {
  title: string;
  status: string;
  issues: Array<{
    id: string;
    identifier: string;
    title: string;
    priority: string;
  }>;
  onIssueClick?: (id: string) => void;
}

const statusColors: Record<string, string> = {
  backlog: 'border-gray-200',
  todo: 'border-blue-200',
  in_progress: 'border-amber-200',
  in_review: 'border-purple-200',
  blocked: 'border-red-200',
  done: 'border-green-200',
  cancelled: 'border-gray-300'
};

export function KanbanColumn({ title, status, issues, onIssueClick }: KanbanColumnProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="flex flex-col w-[280px] flex-shrink-0">
      <div
        className={clsx(
          'flex items-center gap-2 p-2 border-t-2 rounded-t-lg',
          statusColors[status]
        )}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-accent rounded"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        <span className="font-medium text-sm">{title}</span>
        <span className="text-xs text-muted-foreground ml-auto">{issues.length}</span>
      </div>
      {isExpanded && (
        <div className="flex-1 p-2 space-y-2 overflow-y-auto border rounded-b-lg bg-muted/20 min-h-[200px]">
          {issues.map((issue) => (
            <div
              key={issue.id}
              onClick={() => onIssueClick?.(issue.id)}
              className="p-2 border rounded bg-card hover:shadow-sm cursor-pointer"
            >
              <p className="text-xs text-muted-foreground">{issue.identifier}</p>
              <p className="text-sm line-clamp-2">{issue.title}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}