import { useState, useEffect } from 'react'
import { Download, RefreshCw, FileJson } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Badge } from '../components/ui/badge'
import { api, type Session } from '../lib/api'

export default function Sessions() {
  const [sessionsData, setSessionsData] = useState<{ sessions: Session[] }>({ sessions: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    try {
      const data = await api.getSessions()
      setSessionsData(data)
    } catch (error) {
      console.error('Failed to load sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExport = async (id: string) => {
    try {
      await api.exportSession(id)
      alert('Session exported successfully!')
    } catch (error) {
      console.error('Failed to export session:', error)
    }
  }

  const handleSyncAll = async () => {
    try {
      await api.syncAllSessions()
      loadSessions()
      alert('All sessions synced!')
    } catch (error) {
      console.error('Failed to sync sessions:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading sessions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sessions</h2>
          <p className="text-muted-foreground">Manage OpenCode sessions with export/import.</p>
        </div>
        <Button onClick={handleSyncAll}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Sync All
        </Button>
      </div>

      <div className="grid gap-4">
        {sessionsData.sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileJson className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <CardTitle className="text-base">{session.title}</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">{session.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {session.syncedAt && (
                    <Badge variant="secondary" className="text-xs">
                      Synced {new Date(session.syncedAt).toLocaleDateString()}
                    </Badge>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleExport(session.id)}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Export
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {sessionsData.sessions.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No sessions found. Sessions will appear here when available.
          </div>
        )}
      </div>
    </div>
  )
}
