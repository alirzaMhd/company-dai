import { useState, useEffect } from 'react'
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react'
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
import { api, type Skill } from '../lib/api'

export default function Skills() {
  const [skills, setSkills] = useState<{ skills: any[]; stored: Skill[] }>({ skills: [], stored: [] })
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => {
    loadSkills()
  }, [])

  const loadSkills = async () => {
    try {
      const data = await api.getSkills()
      setSkills(data)
    } catch (error) {
      console.error('Failed to load skills:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    try {
      await api.addSkill(formData)
      setShowDialog(false)
      setFormData({ name: '', description: '' })
      loadSkills()
    } catch (error) {
      console.error('Failed to add skill:', error)
    }
  }

  const handleRemove = async (name: string) => {
    if (!confirm(`Are you sure you want to remove skill "${name}"?`)) return
    try {
      await api.removeSkill(name)
      loadSkills()
    } catch (error) {
      console.error('Failed to remove skill:', error)
    }
  }

  const toggleSkill = async (skill: Skill) => {
    // Toggle skill enabled/disabled
    try {
      if (skill.enabled) {
        await api.removeSkill(skill.name)
      } else {
        await api.addSkill({ name: skill.name, description: skill.description })
      }
      loadSkills()
    } catch (error) {
      console.error('Failed to toggle skill:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading skills...</div>
  }

  const allSkills = [
    ...skills.skills.map((s: any) => ({
      name: typeof s === 'string' ? s : s.name,
      enabled: true,
      description: typeof s === 'string' ? '' : s.description,
    })),
    ...skills.stored.map(s => ({ ...s, enabled: true })),
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Skills</h2>
          <p className="text-muted-foreground">Manage skills for OpenCode agents.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {allSkills.map((skill) => (
          <Card key={skill.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{skill.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill.enabled ? (
                      <ToggleRight className="h-5 w-5 text-green-500" />
                    ) : (
                      <ToggleLeft className="h-5 w-5 text-muted-foreground" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemove(skill.name)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {skill.description && (
                <p className="text-sm text-muted-foreground">{skill.description}</p>
              )}
              <Badge variant={skill.enabled ? 'default' : 'secondary'} className="mt-2">
                {skill.enabled ? 'Enabled' : 'Disabled'}
              </Badge>
            </CardContent>
          </Card>
        ))}

        {allSkills.length === 0 && (
          <div className="col-span-full flex items-center justify-center h-64 text-muted-foreground">
            No skills found. Add your first skill to get started.
          </div>
        )}
      </div>

      {/* Add Skill Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Skill</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="my-skill"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Skill description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAdd}>Add Skill</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
