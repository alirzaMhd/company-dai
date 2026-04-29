import { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { Play, Pause, Square, RefreshCw } from 'lucide-react';

interface LiveRunTranscriptProps {
  runId: string;
  onTranscriptUpdate?: (transcript: string) => void;
}

interface TranscriptEvent {
  type: 'output' | 'error' | 'done' | 'timeout';
  content: string;
  timestamp: string;
}

export function LiveRunTranscript({ runId, onTranscriptUpdate }: LiveRunTranscriptProps) {
  const [events, setEvents] = useState<TranscriptEvent[]>([]);
  const [isRunning, setIsRunning] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!runId) return;
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [runId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={clsx(
            'w-2 h-2 rounded-full',
            isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          )} />
          <span className="text-sm">{isRunning ? 'Running' : 'Idle'}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className="p-2 border rounded hover:bg-accent"
          >
            {isRunning ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4" />
            )}
          </button>
          <button className="p-2 border rounded hover:bg-accent">
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.location.reload()}
            className="p-2 border rounded hover:bg-accent"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="border rounded-lg bg-gray-900 p-4 min-h-[400px] max-h-[600px] overflow-auto font-mono text-sm">
        {isLoading ? (
          <div className="text-gray-400">Loading transcript...</div>
        ) : events.length === 0 ? (
          <div className="text-gray-400">Waiting for output...</div>
        ) : (
          events.map((event, i) => (
            <div key={i} className={clsx(
              'whitespace-pre-wrap',
              event.type === 'error' ? 'text-red-400' : 'text-green-400'
            )}>
              {event.content}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LiveRunTranscript;