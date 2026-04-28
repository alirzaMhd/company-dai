import { useState, useEffect } from 'react'
import { Plus, Trash2, Puzzle, Download } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog'
import { Label } from '../components/ui/label'
import { Input } from '../components/ui/input'
import { Badge } from '../components/ui/badge'
import { api, type Plugin } from '../lib/api'

export default function Plugins() {
  const [pluginsData, setPluginsData] = useState<{ plugins: string; stored: Plugin[] }>({ plugins: '', stored: [] })
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({ module: '', global: false })

  useEffect(() => {
    loadPlugins()
  }, [])

  const loadPlugins = async () => {
    try {
      const data = await api.getPlugins()
      setPluginsData(data)
    } catch (error) {
      console.error('Failed to load plugins:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInstall = async () => {
    try {
      await api.installPlugin(formData)
      setShowDialog(false)
      setFormData({ module: '', global: false })
      loadPlugins()
    } catch (error) {
      console.error('Failed to install plugin:', error)
    }
  }

  const handleUninstall = async (module: string) => {
    if (!confirm(`Are you sure you want to uninstall plugin "${module}"?`)) return
    try {
      await api.uninstallPlugin(module)
      loadPlugins()
    } catch (error) {
      console.error('Failed to uninstall plugin:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading plugins...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Plugins</h2>
          <p className="text-muted-foreground">Manage OpenCode plugins.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Install Plugin
        </Button>
      </div>

      {pluginsData.plugins && pluginsData.plugins !== 'No plugins info' && (
        <Card>
          <CardHeader>
            <CardTitle>OpenCode Plugins Status</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-muted p-4 rounded-md overflow-auto">
              {pluginsData.plugins}
            </pre>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pluginsData.stored.map((plugin) => (
          <Card key={plugin.module}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Puzzle className="h-5 w-5" />
                  {plugin.module}
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleUninstall(plugin.module)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {plugin.version && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <code className="text-xs bg-muted px-2 py-1 rounded">{plugin.version}</code>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Badge variant={plugin.global ? 'default' : 'secondary'}>
                  {plugin.global ? 'Global' : 'Local'}
                </Badge>
                {plugin.installedAt && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(plugin.installedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {pluginsData.stored.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
            No plugins installed. Install your first plugin to get started.
          </div>
        )}
      </div>

      {/* Install Plugin Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Install Plugin</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="module">Module Name</Label>
              <Input
                id="module"
                value={formData.module}
                onChange={(e) => setFormData({ ...formData, module: e.target.value })}
                placeholder="@opencode/plugin-name"
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="global"
                checked={formData.global}
                onChange={(e) => setFormData({ ...formData, global: e.target.checked })}
                className="rounded border-input"
              />
              <Label htmlFor="global">Install globally (-g)</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleInstall}>
              <Download className="mr-2 h-4 w-4" />
              Install
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
