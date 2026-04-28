const express = require('express')
const router = express.Router()
const storage = require('../lib/storage')

// Process chat message with natural language parsing
router.post('/message', async (req, res) => {
  try {
    const { message } = req.body
    
    // Parse @mentions
    const mentionRegex = /@(\w+)/g
    const mentions = []
    let match
    
    while ((match = mentionRegex.exec(message)) !== null) {
      mentions.push(match[1])
    }
    
    // Parse issue numbers
    const issueRegex = /#(\d+)/g
    const issues = []
    
    while ((match = issueRegex.exec(message)) !== null) {
      issues.push(match[1])
    }
    
    // Simple command parsing
    let action = null
    let response = ''
    
    if (message.toLowerCase().includes('assign') && issues.length > 0 && mentions.length > 0) {
      // Assign issue to agent
      const issueNumber = issues[0]
      const agentName = mentions[0]
      
      action = {
        type: 'assign_issue',
        issueNumber,
        agentName,
      }
      
      response = `Issue #${issueNumber} has been assigned to @${agentName}. The agent has been notified.`
      
      // Update issue in data store
      const issues = await storage.readData('issues.json') || []
      const issue = issues.find(i => i.number === parseInt(issueNumber))
      if (issue) {
        issue.assignee = agentName
        issue.status = 'in-progress'
        await storage.writeData('issues.json', issues)
      }
    } else if (message.toLowerCase().includes('status') && issues.length > 0) {
      // Check issue status
      const issueNumber = issues[0]
      const issuesData = await storage.readData('issues.json') || []
      const issue = issuesData.find(i => i.number === parseInt(issueNumber))
      
      if (issue) {
        response = `Issue #${issueNumber} is currently ${issue.status}${issue.assignee ? ` and assigned to ${issue.assignee}` : ''}.`
      } else {
        response = `Issue #${issueNumber} not found.`
      }
    } else {
      response = 'I understand you\'re trying to communicate with the agents. Try commands like "Assign issue #123 to @Agent-Name" or "What\'s the status of issue #456?"'
    }
    
    // Store message in chat history
    const chatHistory = await storage.readData('chat-history.json') || []
    chatHistory.push({
      id: Date.now().toString(),
      message,
      mentions,
      issues,
      action,
      response,
      timestamp: new Date().toISOString(),
    })
    await storage.writeData('chat-history.json', chatHistory)
    
    res.json({
      message: response,
      action,
      mentions,
      issues,
    })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Get chat history
router.get('/history', async (req, res) => {
  try {
    const history = await storage.readData('chat-history.json') || []
    res.json(history)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

module.exports = router
