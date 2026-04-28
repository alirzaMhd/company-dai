const express = require('express')
const router = express.Router()
const { createTask, getTask, getTasks, updateTaskStep, executeTask, cancelTask, deleteTask } = require('../lib/task-engine')

// Get all tasks
router.get('/', async (req, res) => {
  try {
    const tasks = await getTasks()
    res.json(tasks)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create a new task
router.post('/', async (req, res) => {
  try {
    const { name, description, steps } = req.body
    if (!name || !steps || !Array.isArray(steps)) {
      return res.status(400).json({ error: 'Invalid task data' })
    }
    const task = await createTask({ name, description, steps })
    res.status(201).json(task)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get a specific task
router.get('/:id', async (req, res) => {
  try {
    const task = await getTask(req.params.id)
    if (!task) {
      return res.status(404).json({ error: 'Task not found' })
    }
    res.json(task)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete a task
router.delete('/:id', async (req, res) => {
  try {
    const result = await deleteTask(req.params.id)
    res.json(result)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Execute a task (start or continue)
router.post('/:id/execute', async (req, res) => {
  try {
    const task = await executeTask(req.params.id)
    res.json(task)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Cancel a task
router.post('/:id/cancel', async (req, res) => {
  try {
    const task = await cancelTask(req.params.id)
    res.json(task)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update a task step (called when an agent completes its work)
router.put('/:id/steps/:stepId', async (req, res) => {
  try {
    const { result, status } = req.body
    const task = await updateTaskStep(req.params.id, req.params.stepId, {
      result,
      status: status || 'completed',
    })
    res.json(task)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
