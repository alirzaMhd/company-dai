import { BrowserRouter, Routes, Route } from 'react-router-dom'
import DashboardLayout from './components/layout/DashboardLayout'
import Dashboard from './pages/Dashboard'
import Agents from './pages/Agents'
import Projects from './pages/Projects'
import Chat from './pages/Chat'
import Issues from './pages/Issues'
import Skills from './pages/Skills'
import MCP from './pages/MCP'
import Plugins from './pages/Plugins'
import Sessions from './pages/Sessions'
import Sync from './pages/Sync'
import Tasks from './pages/Tasks'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="agents" element={<Agents />} />
          <Route path="projects" element={<Projects />} />
          <Route path="chat" element={<Chat />} />
          <Route path="issues" element={<Issues />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="skills" element={<Skills />} />
          <Route path="mcp" element={<MCP />} />
          <Route path="plugins" element={<Plugins />} />
          <Route path="sessions" element={<Sessions />} />
          <Route path="sync" element={<Sync />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
