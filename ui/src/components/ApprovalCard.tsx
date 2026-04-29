import { clsx } from 'clsx';
import { Check, X, Clock } from 'lucide-react';

interface ApprovalCardProps {
  id: string;
  type: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedByAgentId?: string;
  requestedByUserId?: string;
  targetAgentId?: string;
  createdAt: string;
  onApprove?: () => void;
  onReject?: () => void;
}

const typeLabels: Record<string, string> = {
  hire_agent: 'Hire Agent',
  approve_ceo_strategy: 'Approve CEO Strategy',
  budget_increase: 'Budget Increase'
};

export function ApprovalCard({
  id,
  type,
  status,
  requestedByAgentId,
  requestedByUserId,
  targetAgentId,
  createdAt,
  onApprove,
  onReject
}: ApprovalCardProps) {
  return (
    <div className="p-4 border rounded-lg bg-card">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <Clock className={clsx(
            'w-4 h-4',
            status === 'pending' ? 'text-amber-500' :
            status === 'approved' ? 'text-green-500' : 'text-red-500'
          )} />
          <span className="text-sm font-medium">{typeLabels[type] || type}</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {new Date(createdAt).toLocaleDateString()}
        </span>
      </div>
      <div className="mt-3 flex items-center gap-2">
        {status === 'pending' ? (
          <>
            <button
              onClick={onApprove}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              <Check className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={onReject}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded hover:bg-accent"
            >
              <X className="w-4 h-4" />
              Reject
            </button>
          </>
        ) : (
          <span className={clsx(
            'text-sm px-2 py-1 rounded',
            status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          )}>
            {status === 'approved' ? 'Approved' : 'Rejected'}
          </span>
        )}
      </div>
    </div>
  );
}

export default ApprovalCard;