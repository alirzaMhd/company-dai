import { useState, useEffect } from 'react'
import { Plus, Trash2, Wrench } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Skill {
  name: string
  addedAt?: string
}

export function Skills() {
  const [skills, setSkills] = useState<Skill[]>([])
  const [name, setName] = useState('')
  const [path, setPath] = useState('')

  useEffect(() => {
    loadSkills()
  }, [])

  async function loadSkills() {
    const res = await fetch('/api/skills')
    const data = await res.json()
    setSkills(data.stored || [])
  }

  async function addSkill() {
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, path }),
    })
    const data = await res.json()
    if (data.success) {
      setName('')
      setPath('')
      loadSkills()
    } else {
      alert(data.error)
    }
  }

  async function deleteSkill(name: string) {
    await fetch(`/api/skills/${name}`, { method: 'DELETE' })
    loadSkills()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Skills</h1>

      <Card>
        <CardHeader>
          <CardTitle>Add Skill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Skill Name</label>
              <Input
                placeholder="skill-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Path or URL</label>
              <Input
                placeholder="./skills or https://..."
                value={path}
                onChange={(e) => setPath(e.target.value)}
              />
            </div>
          </div>
          <Button onClick={addSkill}>
            <Plus className="mr-2 h-4 w-4" />
            Add Skill
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {skills.map((skill) => (
          <Card key={skill.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  {skill.name}
                </span>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => deleteSkill(skill.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Added: {skill.addedAt || 'unknown'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
