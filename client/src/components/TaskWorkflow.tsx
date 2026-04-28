import { useState } from 'react'
import { CheckCircle, XCircle, Loader2, ArrowRight, Bot } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { api, type Task, type TaskStep } from '../lib/api'

interface TaskWorkflowProps {
  task: Task
  onUpdate: () => void
}

export default function TaskWorkflow({ task, onUpdate }: TaskWorkflowProps) {
  const [updatingStep, setUpdatingStep] = useState('')

  const handleCompleteStep = async (stepId: string) => {
    setUpdatingStep(stepId)
    try {
      await api.updateTaskStep(task.id, stepId, { result: 'Completed', status: 'completed' })
      onUpdate()
    } catch (error) {
      console.error('Failed to update step:', error)
    } finally {
      setUpdatingStep('')
    }
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'running':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Workflow Visualization</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {task.steps.map((step: TaskStep, index: number) => (
            <div key={step.id}>
              <div className="flex items-start gap-4">
                {/* Step Number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>

                {/* Step Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bot className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm">{step.agentName}</span>
                      {getStepIcon(step.status)}
                    </div>
                    <Badge variant={
                      step.status === 'completed' ? 'default' :
                      step.status === 'running' ? 'secondary' :
                      step.status === 'failed' ? 'destructive' : 'outline'
                    }>
                      {step.status}
                    </Badge>
                  </div>

                  <p className="text-sm text-muted-foreground">{step.prompt}</p>

                  {/* Result */}
                  {step.result && (
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-xs font-medium mb-1">Result:</p>
                      <pre className="text-xs overflow-auto">{JSON.stringify(step.result, null, 2)}</pre>
                    </div>
                  )}

                  {/* Actions */}
                  {step.status === 'pending' && task.status === 'running' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCompleteStep(step.id)}
                      disabled={updatingStep === step.id}
                    >
                      {updatingStep === step.id ? 'Updating...' : 'Mark Complete'}
                    </Button>
                  )}

                  {/* Dependencies */}
                  {step.dependsOn && (
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <span>Depends on:</span>
                      <Badge variant="outline" className="text-xs">
                        Step {task.steps.findIndex(s => s.id === step.dependsOn) + 1}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Arrow */}
              {index < task.steps.length - 1 && (
                <div className="flex justify-center my-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Task Summary */}
        <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-muted-foreground">
              {task.steps.filter(s => s.status === 'completed').length} / {task.steps.length} completed
            </span>
          </div>
          <Badge variant={
            task.status === 'completed' ? 'default' :
            task.status === 'running' ? 'secondary' :
            task.status === 'failed' ? 'destructive' : 'outline'
          }>
            Task: {task.status}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
