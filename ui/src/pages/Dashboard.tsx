import { useQuery } from '@tanstack/react-query';

function Dashboard() {
  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      return {
        companyCount: 0,
        agentCount: 0,
        issueCount: 0,
        activeRuns: 0,
        totalCost: 0,
      };
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-muted-foreground">Company overview and metrics</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-6 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Companies</p>
          <p className="text-2xl font-semibold">{data?.companyCount}</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Agents</p>
          <p className="text-2xl font-semibold">{data?.agentCount}</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Open Issues</p>
          <p className="text-2xl font-semibold">{data?.issueCount}</p>
        </div>
        <div className="p-6 border rounded-lg bg-card">
          <p className="text-sm text-muted-foreground">Active Runs</p>
          <p className="text-2xl font-semibold">{data?.activeRuns}</p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;