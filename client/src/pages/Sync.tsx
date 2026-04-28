import { useState, useEffect } from 'react'
import { RefreshCw, Upload, Download, CheckCircle, XCircle, GitBranch } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Badge } from '../components/ui/badge'
import { api, type SyncStatus } from '../lib/api'

export default function Sync() {
  const [status, setStatus] = useState<SyncStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [remote, setRemote] = useState('')
  const [actionLoading, setActionLoading] = useState('')

  useEffect(() => {
    loadStatus()
  }, [])

  const loadStatus = async () => {
    try {
      const data = await api.getSyncStatus()
      setStatus(data)
      setRemote(data.remote || '')
    } catch (error) {
      console.error('Failed to load sync status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEnable = async () => {
    if (!remote) {
      alert('Please enter a remote URL')
      return
    }
    setActionLoading('enable')
    try {
      await api.enableSync(remote)
      await loadStatus()
    } catch (error) {
      console.error('Failed to enable sync:', error)
    } finally {
      setActionLoading('')
    }
  }

  const handleDisable = async () => {
    setActionLoading('disable')
    try {
      await api.disableSync()
      await loadStatus()
    } catch (error) {
      console.error('Failed to disable sync:', error)
    } finally {
      setActionLoading('')
    }
  }

  const handleSync = async () => {
    setActionLoading('sync')
    try {
      await api.syncNow()
      await loadStatus()
      alert('Sync completed!')
    } catch (error) {
      console.error('Failed to sync:', error)
    } finally {
      setActionLoading('')
    }
  }

  const handlePull = async () => {
    setActionLoading('pull')
    try {
      await api.pullChanges()
      await loadStatus()
      alert('Pull completed!')
    } catch (error) {
      console.error('Failed to pull:', error)
    } finally {
      setActionLoading('')
    }
  }

  const handlePush = async () => {
    setActionLoading('push')
    try {
      await api.pushChanges()
      await loadStatus()
      alert('Push completed!')
    } catch (error) {
      console.error('Failed to push:', error)
    } finally {
      setActionLoading('')
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading sync status...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Git Sync</h2>
        <p className="text-muted-foreground">Manage Git synchronization for data portability.</p>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Sync Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status:</span>
            <div className="flex items-center gap-2">
              {status?.enabled ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-muted-foreground" />
              )}
              <Badge variant={status?.enabled ? 'default' : 'secondary'}>
                {status?.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
          </div>

          {status?.remote && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Remote:</span>
              <code className="text-xs bg-muted px-2 py-1 rounded">{status.remote}</code>
            </div>
          )}

          {status?.lastSync && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Last Sync:</span>
              <span className="text-xs">
                {new Date(status.lastSync).toLocaleString()}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Remote Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Remote Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="remote">Remote URL</Label>
            <Input
              id="remote"
              value={remote}
              onChange={(e) => setRemote(e.target.value)}
              placeholder="https://github.com/user/repo.git"
            />
          </div>
          <div className="flex gap-2">
            {status?.enabled ? (
              <Button
                variant="destructive"
                onClick={handleDisable}
                disabled={actionLoading === 'disable'}
              >
                {actionLoading === 'disable' ? 'Disabling...' : 'Disable Sync'}
              </Button>
            ) : (
              <Button
                onClick={handleEnable}
                disabled={actionLoading === 'enable' || !remote}
              >
                {actionLoading === 'enable' ? 'Enabling...' : 'Enable Sync'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sync Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Sync Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <Button
              onClick={handleSync}
              disabled={!status?.enabled || actionLoading === 'sync'}
              className="w-full"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${actionLoading === 'sync' ? 'animate-spin' : ''}`} />
              {actionLoading === 'sync' ? 'Syncing...' : 'Sync Now'}
            </Button>
            <Button
              variant="outline"
              onClick={handlePull}
              disabled={!status?.enabled || actionLoading === 'pull'}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              {actionLoading === 'pull' ? 'Pulling...' : 'Pull'}
            </Button>
            <Button
              variant="outline"
              onClick={handlePush}
              disabled={!status?.enabled || actionLoading === 'push'}
              className="w-full"
            >
              <Upload className="mr-2 h-4 w-4" />
              {actionLoading === 'push' ? 'Pushing...' : 'Push'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
