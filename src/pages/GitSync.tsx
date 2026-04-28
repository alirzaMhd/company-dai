import { useState, useEffect } from 'react'
import { GitBranch, RefreshCw, Upload, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface SyncStatus {
  enabled: boolean
  initialized: boolean
  remote?: string
  branch?: string
}

export function GitSync() {
  const [status, setStatus] = useState<SyncStatus>({ enabled: false, initialized: false })
  const [remote, setRemoteUrl] = useState('')

  useEffect(() => {
    loadStatus()
  }, [])

  async function loadStatus() {
    const res = await fetch('/api/sync/status')
    const data = await res.json()
    setStatus(data)
    if (data.remote) setRemoteUrl(data.remote)
  }

  async function updateRemote() {
    const res = await fetch('/api/sync/remote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: remote }),
    })
    const data = await res.json()
    if (data.success) loadStatus()
    else alert(data.error)
  }

  async function enableSync() {
    const res = await fetch('/api/sync/enable', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ remote }),
    })
    const data = await res.json()
    if (data.success) loadStatus()
    else alert(data.error)
  }

  async function disableSync() {
    await fetch('/api/sync/disable', { method: 'POST' })
    loadStatus()
  }

  async function syncNow() {
    const res = await fetch('/api/sync/sync', { method: 'POST' })
    const data = await res.json()
    if (data.success) alert('Synced!')
    loadStatus()
  }

  async function pull() {
    const res = await fetch('/api/sync/pull', { method: 'POST' })
    const data = await res.json()
    if (data.success) alert('Pulled!')
    loadStatus()
  }

  async function push() {
    const res = await fetch('/api/sync/push', { method: 'POST' })
    const data = await res.json()
    if (data.success) alert('Pushed!')
    loadStatus()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Git Sync</h1>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Sync Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Remote URL</label>
            <div className="flex gap-2">
              <Input
                placeholder="https://github.com/user/repo.git"
                value={remote}
                onChange={(e) => setRemoteUrl(e.target.value)}
              />
              <Button onClick={updateRemote}>Set</Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={enableSync} disabled={status.enabled}>
              Enable Auto-Sync
            </Button>
            <Button onClick={disableSync} variant="destructive" disabled={!status.enabled}>
              Disable
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manual Sync</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button onClick={syncNow}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Now
          </Button>
          <Button onClick={pull} variant="secondary">
            <Download className="mr-2 h-4 w-4" />
            Pull
          </Button>
          <Button onClick={push} variant="secondary">
            <Upload className="mr-2 h-4 w-4" />
            Push
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="font-medium">Enabled:</span>{' '}
              <span className={status.enabled ? 'text-green-500' : 'text-muted-foreground'}>
                {status.enabled ? 'Yes' : 'No'}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Initialized:</span>{' '}
              <span className={status.initialized ? 'text-green-500' : 'text-muted-foreground'}>
                {status.initialized ? 'Yes' : 'No'}
              </span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Remote:</span>{' '}
              <span className="text-muted-foreground">{status.remote || 'Not set'}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Branch:</span>{' '}
              <span className="text-muted-foreground">{status.branch || 'N/A'}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
