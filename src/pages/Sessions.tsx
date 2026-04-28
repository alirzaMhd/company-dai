import { useState, useEffect } from 'react'
import { MessageSquare, Download, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'

interface Session {
  id: string
  title?: string
}

export function Sessions() {
  const [sessions, setSessions] = useState<Session[]>([])

  useEffect(() => {
    loadSessions()
  }, [])

  async function loadSessions() {
    const res = await fetch('/api/sessions')
    const data = await res.json()
    setSessions(data.sessions || [])
  }

  async function syncAll() {
    const res = await fetch('/api/sessions/sync-all', { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      alert(`Synced ${data.count} sessions`)
      loadSessions()
    }
  }

  async function exportSession(id: string) {
    const res = await fetch(`/api/sessions/export/${id}`, { method: 'POST' })
    const data = await res.json()
    if (data.success) {
      alert('Session exported!')
    }
  }

  async function exportAll() {
    const data = await fetch('/api/sessions').then(r => r.json())
    for (const s of data.sessions || []) {
      await fetch(`/api/sessions/export/${s.id}`, { method: 'POST' })
    }
    alert('All sessions exported!')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sessions</h1>
        <div className="flex gap-2">
          <Button onClick={syncAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync All
          </Button>
          <Button onClick={exportAll} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Export All
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                {session.title || session.id}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">ID: {session.id}</p>
              <Button
                size="sm"
                onClick={() => exportSession(session.id)}
              >
                <Download className="mr-2 h-3 w-3" />
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
