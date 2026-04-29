import { clsx } from 'clsx';

function BudgetMeter({
  current,
  limit,
  showPercentage = true,
  size = 'md',
  animated = true
}: {
  current: number;
  limit: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}) {
  const percentage = limit > 0 ? (current / limit) * 100 : 0;
  const clampedPercentage = Math.min(percentage, 100);

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4'
  };

  const colors = {
    safe: 'bg-green-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500'
  };

  let color: 'safe' | 'warning' | 'danger';
  if (percentage > 90) {
    color = 'danger';
  } else if (percentage > 70) {
    color = 'warning';
  } else {
    color = 'safe';
  }

  return (
    <div className="space-y-1">
      <div className={clsx('w-full bg-muted rounded-full overflow-hidden', heights[size])}>
        <div
          className={clsx(
            'h-full rounded-full transition-all',
            colors[color],
            animated && 'animate-pulse'
          )}
          style={{ width: `${clampedPercentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>${current.toFixed(2)}</span>
          <span>{percentage.toFixed(0)}%</span>
          <span>${limit.toFixed(2)}</span>
        </div>
      )}
    </div>
  );
}

export default BudgetMeter;