import { useEffect, useState } from 'react';
import { Play, Square, RefreshCw } from 'lucide-react';
import RunTranscript from '../components/RunTranscript';

interface LivePageProps {
  companyId?: string;
}

function LivePage({ companyId }: LivePageProps) {
  const [runId, setRunId] = useState<string | null>(null);
  const [runs, setRuns] = useState<Array<{ id: string; status: string; agentId: string }>>([]);
  
  const [activeRuns, setActiveRuns] = useState<Array<{ id: string; status: string }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      
    }, 5000);
    return () => clearInterval(interval);
  }, [companyId]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Live</h2>
          <p className="text-muted-foreground">Real-time agent execution</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 border rounded hover:bg-accent"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-2">
          <h3 className="font-medium">Active Runs</h3>
          {activeRuns.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active runs</p>
          ) : (
            activeRuns.map((run) => (
              <button
                key={run.id}
                onClick={() => setRunId(run.id)}
                className={`w-full p-3 border rounded text-left ${
                  runId === run.id ? 'border-primary' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-mono">{run.id.slice(0, 8)}</span>
                </div>
              </button>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {runId ? (
            <RunTranscript runId={runId} />
          ) : (
            <div className="border rounded-lg p-8 text-center text-muted-foreground">
              Select a run to view transcript
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LivePage;