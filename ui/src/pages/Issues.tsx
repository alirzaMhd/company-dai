import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { Plus, Search, Filter, LayoutGrid, List } from 'lucide-react';
import { IssueCard } from '../components/IssueCard';

const statuses = ['backlog', 'todo', 'in_progress', 'in_review', 'blocked', 'done', 'cancelled'] as const;

const statusLabels: Record<string, string> = {
  backlog: 'Backlog',
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  blocked: 'Blocked',
  done: 'Done',
  cancelled: 'Cancelled'
};

interface Issue {
  id: string;
  identifier: string;
  title: string;
  status: string;
  priority: string;
}

function Issues() {
  const navigate = useNavigate();
  const [view, setView] = useState<'board' | 'list'>('board');
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);

  const filteredIssues = issues.filter((issue) => {
    if (search && !issue.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedStatus && issue.status !== selectedStatus) return false;
    return true;
  });

  const issuesByStatus = statuses.reduce((acc, status) => {
    acc[status] = filteredIssues.filter((i) => i.status === status);
    return acc;
  }, {} as Record<string, Issue[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Issues</h2>
          <p className="text-muted-foreground">Task management</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Issue
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search issues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-md"
          />
        </div>
        <button className="p-2 border rounded hover:bg-accent">
          <Filter className="w-4 h-4" />
        </button>
        <div className="flex border rounded">
          <button
            onClick={() => setView('board')}
            className={clsx('p-2', view === 'board' ? 'bg-accent' : '')}
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView('list')}
            className={clsx('p-2', view === 'list' ? 'bg-accent' : '')}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {statuses.map((status) => (
            <div key={status} className="flex-shrink-0 w-[280px]">
              <div className="p-2 border-b border-l border-r rounded-t-lg bg-muted">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{statusLabels[status]}</span>
                  <span className="text-xs text-muted-foreground">
                    {issuesByStatus[status].length}
                  </span>
                </div>
              </div>
              <div className="p-2 space-y-2 border border-t-0 rounded-b-lg bg-muted/20 min-h-[400px]">
                {issuesByStatus[status].map((issue) => (
                  <IssueCard
                    key={issue.id}
                    id={issue.id}
                    identifier={issue.identifier}
                    title={issue.title}
                    status={issue.status as any}
                    priority={issue.priority as any}
                    onClick={() => navigate(`/issues/${issue.id}`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium">ID</th>
                <th className="text-left p-3 text-sm font-medium">Title</th>
                <th className="text-left p-3 text-sm font-medium">Status</th>
                <th className="text-left p-3 text-sm font-medium">Priority</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-muted-foreground">
                    No issues found
                  </td>
                </tr>
              ) : (
                filteredIssues.map((issue) => (
                  <tr
                    key={issue.id}
                    className="border-t cursor-pointer hover:bg-accent/50"
                    onClick={() => navigate(`/issues/${issue.id}`)}
                  >
                    <td className="p-3 text-sm">{issue.identifier}</td>
                    <td className="p-3 text-sm">{issue.title}</td>
                    <td className="p-3 text-sm">{statusLabels[issue.status]}</td>
                    <td className="p-3 text-sm capitalize">{issue.priority}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Issues;