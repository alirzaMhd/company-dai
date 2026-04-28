const express = require('express')
const router = express.Router()
const storage = require('../lib/storage')

// Get all issues
router.get('/', async (req, res) => {
  try {
    const issues = await storage.readData('issues.json') || []
    res.json(issues)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new issue
router.post('/', async (req, res) => {
  try {
    const { title, description, projectId, priority } = req.body
    const issues = await storage.readData('issues.json') || []
    
    const newIssue = {
      id: Date.now(),
      number: issues.length + 1,
      title,
      description,
      status: 'todo',
      priority: priority || 'medium',
      assignee: null,
      projectId,
      labels: [],
      createdAt: new Date().toISOString(),
    }
    
    issues.push(newIssue)
    await storage.writeData('issues.json', issues)
    
    res.status(201).json(newIssue)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Update issue (assign, change status)
router.put('/:id', async (req, res) => {
  try {
    const issues = await storage.readData('issues.json') || []
    const index = issues.findIndex(i => i.id === parseInt(req.params.id))
    
    if (index === -1) {
      return res.status(404).json({ error: 'Issue not found' })
    }
    
    issues[index] = { ...issues[index], ...req.body }
    await storage.writeData('issues.json', issues)
    
    res.json(issues[index])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete issue
router.delete('/:id', async (req, res) => {
  try {
    const issues = await storage.readData('issues.json') || []
    const filtered = issues.filter(i => i.id !== parseInt(req.params.id))
    await storage.writeData('issues.json', filtered)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
