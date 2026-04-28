import { useState, useEffect } from 'react'
import { Plus, Trash2, Puzzle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Plugin {
  module: string
  global: boolean
  installedAt?: string
}

export function Plugins() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [module, setModule] = useState('')
  const [global, setGlobal] = useState(false)

  useEffect(() => {
    loadPlugins()
  }, [])

  async function loadPlugins() {
    const res = await fetch('/api/plugins')
    const data = await res.json()
    setPlugins(data.stored || [])
  }

  async function installPlugin() {
    const res = await fetch('/api/plugins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ module, global }),
    })
    const data = await res.json()
    if (data.success) {
      setModule('')
      loadPlugins()
    } else {
      alert(data.error)
    }
  }

  async function uninstallPlugin(module: string) {
    await fetch(`/api/plugins/${module}`, { method: 'DELETE' })
    loadPlugins()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Plugins</h1>

      <Card>
        <CardHeader>
          <CardTitle>Install Plugin</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Module Name</label>
              <Input
                placeholder="package-name"
                value={module}
                onChange={(e) => setModule(e.target.value)}
              />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input
                type="checkbox"
                id="global"
                checked={global}
                onChange={(e) => setGlobal(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="global" className="text-sm font-medium">
                Global Install
              </label>
            </div>
          </div>
          <Button onClick={installPlugin}>
            <Plus className="mr-2 h-4 w-4" />
            Install Plugin
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {plugins.map((plugin) => (
          <Card key={plugin.module}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Puzzle className="h-4 w-4" />
                  {plugin.module}
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => uninstallPlugin(plugin.module)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Global: {plugin.global ? 'Yes' : 'No'}
              </p>
              {plugin.installedAt && (
                <p className="text-sm text-muted-foreground">
                  Installed: {plugin.installedAt}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
