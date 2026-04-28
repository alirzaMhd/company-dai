const fs = require('fs').promises
const path = require('path')
const { getDataPath, readJSON, writeJSON } = require('./storage')
const { getAgents } = require('./opencode-cli')

const TASKS_FILE = 'tasks.json'

async function getTasksFile() {
  return getDataPath(TASKS_FILE)
}

async function loadTasks() {
  const filePath = await getTasksFile()
  const data = await readJSON(filePath)
  return data || { tasks: [] }
}

async function saveTasks(data) {
  const filePath = await getTasksFile()
  await writeJSON(filePath, data)
}

async function createTask(taskData) {
  const data = await loadTasks()
  
  const task = {
    id: `task_${Date.now()}`,
    name: taskData.name,
    description: taskData.description || '',
    steps: taskData.steps.map((step, idx) => ({
      id: `step_${Date.now()}_${idx}`,
      agentName: step.agentName,
      prompt: step.prompt,
      dependsOn: step.dependsOn || null,
      status: 'pending',
      result: null,
      nextStep: step.nextStep || null,
    })),
    status: 'pending',
    createdAt: new Date().toISOString(),
    completedAt: null,
  }
  
  data.tasks.push(task)
  await saveTasks(data)
  return task
}

async function getTask(id) {
  const data = await loadTasks()
  return data.tasks.find(t => t.id === id)
}

async function getTasks() {
  const data = await loadTasks()
  return data.tasks
}

async function updateTaskStep(taskId, stepId, updates) {
  const data = await loadTasks()
  const task = data.tasks.find(t => t.id === taskId)
  if (!task) throw new Error('Task not found')
  
  const step = task.steps.find(s => s.id === stepId)
  if (!step) throw new Error('Step not found')
  
  Object.assign(step, updates)
  
  // Check if all steps completed
  if (task.steps.every(s => s.status === 'completed')) {
    task.status = 'completed'
    task.completedAt = new Date().toISOString()
  }
  
  await saveTasks(data)
  return task
}

async function executeTask(taskId) {
  const task = await getTask(taskId)
  if (!task) throw new Error('Task not found')
  
  task.status = 'running'
  
  // Find steps that can be executed (no dependencies or dependencies completed)
  const pendingSteps = task.steps.filter(step => 
    step.status === 'pending' && 
    (!step.dependsOn || task.steps.find(s => s.id === step.dependsOn)?.status === 'completed')
  )
  
  // Execute first pending step (in real implementation, this would trigger the agent)
  for (const step of pendingSteps) {
    step.status = 'running'
    // Here you would actually call the agent
    // For now, we'll simulate with a placeholder
    await saveTasks({ tasks: (await loadTasks()).tasks })
    break // Execute one step at a time
  }
  
  const data = await loadTasks()
  const taskIndex = data.tasks.findIndex(t => t.id === taskId)
  data.tasks[taskIndex] = task
  await saveTasks(data)
  
  return task
}

async function cancelTask(taskId) {
  const data = await loadTasks()
  const task = data.tasks.find(t => t.id === taskId)
  if (!task) throw new Error('Task not found')
  
  task.status = 'failed'
  task.steps.forEach(step => {
    if (step.status === 'running' || step.status === 'pending') {
      step.status = 'failed'
    }
  })
  
  await saveTasks(data)
  return task
}

async function deleteTask(taskId) {
  const data = await loadTasks()
  data.tasks = data.tasks.filter(t => t.id !== taskId)
  await saveTasks(data)
  return { success: true }
}

module.exports = {
  createTask,
  getTask,
  getTasks,
  updateTaskStep,
  executeTask,
  cancelTask,
  deleteTask,
}
