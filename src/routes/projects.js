const express = require('express')
const router = express.Router()
const storage = require('../lib/storage')

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await storage.readData('projects.json')
    res.json(projects || [])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Create new project
router.post('/', async (req, res) => {
  try {
    const { name, description, type, repoUrl } = req.body
    const projects = await storage.readData('projects.json') || []
    
    const newProject = {
      id: `proj_${Date.now()}`,
      name,
      description,
      type: type || 'local',
      repo: repoUrl || null,
      issues: [],
      createdAt: new Date().toISOString(),
      lastSynced: null,
    }
    
    projects.push(newProject)
    await storage.writeData('projects.json', projects)
    
    res.status(201).json(newProject)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Sync GitHub project
router.post('/:id/sync', async (req, res) => {
  try {
    const github = require('../lib/github')
    const project = await github.syncProject(req.params.id)
    res.json(project)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Delete project
router.delete('/:id', async (req, res) => {
  try {
    const projects = await storage.readData('projects.json') || []
    const filtered = projects.filter(p => p.id !== req.params.id)
    await storage.writeData('projects.json', filtered)
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
