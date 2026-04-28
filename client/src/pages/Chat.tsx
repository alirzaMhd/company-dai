import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Paperclip } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Avatar, AvatarFallback } from '../components/ui/avatar'
import { api } from '../lib/api'
import type { Agent } from '../lib/api'

interface Message {
  id: string
  role: 'user' | 'system' | 'agent'
  content: string
  timestamp: Date
  agentName?: string
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showMentions, setShowMentions] = useState(false)
  const [mentionFilter, setMentionFilter] = useState('')
  const [mentionIndex, setMentionIndex] = useState(0)
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadAgents()
    loadChatHistory()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadAgents = async () => {
    try {
      const data = await api.getAgents()
      setAgents(data)
    } catch (error) {
      console.error('Failed to load agents:', error)
    }
  }

  const loadChatHistory = async () => {
    try {
      const history = await api.getChatHistory()
      if (history && history.length > 0) {
        setMessages(history.map((msg: any) => ({
          id: msg.id,
          role: msg.role || 'system',
          content: msg.content || msg.message || '',
          timestamp: new Date(msg.timestamp),
          agentName: msg.agentName,
        })))
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
    }
  }

  const filteredAgents = agents.filter(agent =>
    agent.name.toLowerCase().includes(mentionFilter.toLowerCase())
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)

    // Check for @mention
    const cursorPos = e.target.selectionStart
    const textBeforeCursor = value.slice(0, cursorPos)
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/)

    if (mentionMatch) {
      setShowMentions(true)
      setMentionFilter(mentionMatch[1])
      setMentionIndex(0)
    } else {
      setShowMentions(false)
    }
  }

  const handleMentionSelect = (agentName: string) => {
    const cursorPos = textareaRef.current?.selectionStart || 0
    const textBeforeCursor = input.slice(0, cursorPos)
    const textAfterCursor = input.slice(cursorPos)

    // Replace the @partial with @agentName
    const newTextBefore = textBeforeCursor.replace(/@\w*$/, `@${agentName} `)
    const newInput = newTextBefore + textAfterCursor

    setInput(newInput)
    setShowMentions(false)

    // Focus back on textarea
    setTimeout(() => {
      textareaRef.current?.focus()
    }, 0)
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, newMessage])
    setInput('')
    setLoading(true)

    try {
      const response = await api.sendMessage(input)
      
      const systemMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: response.message,
        timestamp: new Date(),
      }
      
      setMessages(prev => [...prev, systemMessage])
    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setMentionIndex(prev => (prev + 1) % filteredAgents.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setMentionIndex(prev => (prev - 1 + filteredAgents.length) % filteredAgents.length)
      } else if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        if (filteredAgents.length > 0) {
          handleMentionSelect(filteredAgents[mentionIndex].name)
        }
      } else if (e.key === 'Escape') {
        setShowMentions(false)
      }
    } else if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chat</h2>
        <p className="text-muted-foreground">
          Use natural language to assign issues. Type @ to mention an agent.
        </p>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5" />
            Agent Command Center
          </CardTitle>
        </CardHeader>

        {/* Messages Area */}
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.role !== 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    {message.role === 'agent' ? message.agentName?.[0] : 'S'}
                  </AvatarFallback>
                </Avatar>
              )}

              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : message.role === 'system'
                    ? 'bg-muted'
                    : 'bg-accent'
                }`}
              >
                {message.role === 'agent' && (
                  <p className="text-xs font-semibold mb-1">{message.agentName}</p>
                )}
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </CardContent>

        {/* Input Area */}
        <div className="border-t p-4 relative">
          {/* Mention Dropdown */}
          {showMentions && filteredAgents.length > 0 && (
            <div className="absolute bottom-full left-4 right-4 mb-2 bg-popover border rounded-lg shadow-lg max-h-48 overflow-y-auto z-10">
              {filteredAgents.map((agent, index) => (
                <div
                  key={agent.id}
                  className={`flex items-center gap-3 px-4 py-2 cursor-pointer hover:bg-accent ${
                    index === mentionIndex ? 'bg-accent' : ''
                  }`}
                  onClick={() => handleMentionSelect(agent.name)}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">{agent.avatar || agent.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-sm">{agent.name}</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2">
            <Button variant="ghost" size="icon" className="shrink-0">
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... Use @ to mention agents"
                className="w-full min-h-[60px] max-h-[120px] resize-none rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                rows={2}
              />
            </div>
            <Button onClick={handleSend} size="icon" className="shrink-0" disabled={loading}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Tip: Try "Assign issue #123 to @Agent-Name" or "What's the status of issue #456?"
          </p>
        </div>
      </Card>
    </div>
  )
}
