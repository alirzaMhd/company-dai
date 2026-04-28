import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Agents } from './pages/Agents'
import { MCPServers } from './pages/MCPServers'
import { Skills } from './pages/Skills'
import { Plugins } from './pages/Plugins'
import { Sessions } from './pages/Sessions'
import { GitSync } from './pages/GitSync'
import { Status } from './pages/Status'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/agents" replace />} />
        <Route path="agents" element={<Agents />} />
        <Route path="mcp" element={<MCPServers />} />
        <Route path="skills" element={<Skills />} />
        <Route path="plugins" element={<Plugins />} />
        <Route path="sessions" element={<Sessions />} />
        <Route path="sync" element={<GitSync />} />
        <Route path="status" element={<Status />} />
      </Route>
    </Routes>
  )
}

export default App
