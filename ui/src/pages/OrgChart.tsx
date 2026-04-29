import { clsx } from 'clsx';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface OrgChartPageProps {
  orgData?: Array<{
    id: string;
    name: string;
    role?: string;
    status: string;
    reports: Array<{
      id: string;
      name: string;
      role?: string;
      status: string;
      reports: any[];
    }>;
  }>;
  style?: 'monochrome' | 'nebula' | 'circuit' | 'warmth' | 'schematic';
}

export function OrgChart({ orgData = [], style = 'monochrome' }: OrgChartPageProps) {
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Org Chart</h2>
          <p className="text-muted-foreground">Organization hierarchy</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            className="p-2 border rounded hover:bg-accent"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-sm">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.1))}
            className="p-2 border rounded hover:bg-accent"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-2 border rounded hover:bg-accent"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex gap-2">
        {(['monochrome', 'nebula', 'circuit', 'warmth', 'schematic'] as const).map((s) => (
          <button
            key={s}
            className={clsx(
              'px-3 py-1 text-sm rounded',
              style === s ? 'bg-primary text-primary-foreground' : 'bg-muted'
            )}
          >
            {s}
          </button>
        ))}
      </div>
      <div
        className="border rounded-lg overflow-auto min-h-[500px] p-8"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'top left' }}
      >
        {orgData.length === 0 ? (
          <div className="text-center text-muted-foreground py-20">
            <p>No organization data</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {orgData.map((node) => (
              <div key={node.id} className="text-center">
                <div className="p-4 border rounded-lg bg-card">
                  <p className="font-medium">{node.name}</p>
                  {node.role && <p className="text-sm text-muted-foreground">{node.role}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OrgChart;