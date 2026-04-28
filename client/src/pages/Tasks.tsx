import { useState, useEffect } from 'react'
import { Plus, Play, Square, Eye, Trash2, ArrowRight } from 'lucide-react'
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
import { api, type Task } from '../lib/api'
import TaskWorkflow from '../components/TaskWorkflow'

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [viewingTask, setViewingTask] = useState<Task | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [{ agentName: '', prompt: '', dependsOn: '', nextStep: '' }] as any[],
  })

  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = async () => {
    try {
      const data = await api.getTasks()
      setTasks(data)
    } catch (error) {
      console.error('Failed to load tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddStep = () => {
    setFormData({
      ...formData,
      steps: [...formData.steps, { agentName: '', prompt: '', dependsOn: '', nextStep: '' }],
    })
  }

  const handleRemoveStep = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    })
  }

  const handleStepChange = (index: number, field: string, value: string) => {
    const newSteps = [...formData.steps]
    newSteps[index] = { ...newSteps[index], [field]: value }
    setFormData({ ...formData, steps: newSteps })
  }

  const handleCreate = async () => {
    try {
      await api.createTask({
        name: formData.name,
        description: formData.description,
        steps: formData.steps.filter(s => s.agentName),
      })
      setShowDialog(false)
      setFormData({
        name: '',
        description: '',
        steps: [{ agentName: '', prompt: '', dependsOn: '', nextStep: '' }],
      })
      loadTasks()
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleExecute = async (taskId: string) => {
    try {
      await api.executeTask(taskId)
      loadTasks()
    } catch (error) {
      console.error('Failed to execute task:', error)
    }
  }

  const handleCancel = async (taskId: string) => {
    if (!confirm('Are you sure you want to cancel this task?')) return
    try {
      await api.cancelTask(taskId)
      loadTasks()
    } catch (error) {
      console.error('Failed to cancel task:', error)
    }
  }

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      await api.deleteTask(taskId)
      loadTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading tasks...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Multi-Step Tasks</h2>
          <p className="text-muted-foreground">Create tasks with multiple steps. Agents can pass results to each other.</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Task
        </Button>
      </div>

      {/* Task List */}
      <div className="grid gap-4">
        {tasks.map((task) => (
          <Card key={task.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {task.name}
                    <Badge variant={
                      task.status === 'completed' ? 'default' :
                      task.status === 'running' ? 'secondary' :
                      task.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {task.status}
                    </Badge>
                  </CardTitle>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewingTask(viewingTask?.id === task.id ? null : task)}
                  >
                    <Eye className="mr-2 h-3 w-3" />
                    {viewingTask?.id === task.id ? 'Hide' : 'View'}
                  </Button>
                  {task.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => handleExecute(task.id)}
                    >
                      <Play className="mr-2 h-3 w-3" />
                      Execute
                    </Button>
                  )}
                  {(task.status === 'running' || task.status === 'pending') && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancel(task.id)}
                    >
                      <Square className="mr-2 h-3 w-3" />
                      Cancel
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(task.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {task.steps.length} steps | Created {new Date(task.createdAt).toLocaleDateString()}
                {task.completedAt && (
                  <span className="ml-2">| Completed {new Date(task.completedAt).toLocaleDateString()}</span>
                )}
              </div>

              {/* Step Summary */}
              <div className="flex items-center gap-2 mt-3 flex-wrap">
                {task.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-1">
                    <Badge
                      variant={
                        step.status === 'completed' ? 'default' :
                        step.status === 'running' ? 'secondary' :
                        step.status === 'failed' ? 'destructive' : 'outline'
                      }
                      className="text-xs"
                    >
                      {idx + 1}. {step.agentName}
                    </Badge>
                    {idx < task.steps.length - 1 && (
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                ))}
              </div>

              {/* Workflow Visualization */}
              {viewingTask?.id === task.id && (
                <div className="mt-4">
                  <TaskWorkflow task={task} onUpdate={loadTasks} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No tasks created yet. Create your first multi-step task to get started.
          </div>
        )}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create Multi-Step Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="space-y-2">
              <Label htmlFor="name">Task Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Fix login bug"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Task description"
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            {/* Steps */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Steps</Label>
                <Button variant="outline" size="sm" onClick={handleAddStep}>
                  <Plus className="mr-2 h-3 w-3" />
                  Add Step
                </Button>
              </div>

              {formData.steps.map((step, index) => (
                <Card key={index} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Step {index + 1}</span>
                      {formData.steps.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveStep(index)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Agent Name</Label>
                      <Input
                        value={step.agentName}
                        onChange={(e) => handleStepChange(index, 'agentName', e.target.value)}
                        placeholder="Agent-Reviewer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Prompt</Label>
                      <textarea
                        value={step.prompt}
                        onChange={(e) => handleStepChange(index, 'prompt', e.target.value)}
                        placeholder="Review the code and provide feedback"
                        className="w-full min-h-[60px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                      />
                    </div>
                    {index > 0 && (
                      <div className="space-y-2">
                        <Label>Depends On (previous step ID)</Label>
                        <Input
                          value={step.dependsOn}
                          onChange={(e) => handleStepChange(index, 'dependsOn', e.target.value)}
                          placeholder="Leave empty to run in parallel"
                        />
                      </div>
                    )}
                    {index < formData.steps.length - 1 && (
                      <div className="space-y-2">
                        <Label>Pass Result To (next step)</Label>
                        <Input
                          value={step.nextStep}
                          onChange={(e) => handleStepChange(index, 'nextStep', e.target.value)}
                          placeholder="Step that receives this result"
                        />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>Create Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
