import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Companies from './pages/Companies';
import OrgChart from './pages/OrgChart';
import Agents from './pages/Agents';
import AgentDetail from './pages/AgentDetail';
import Goals from './pages/Goals';
import Projects from './pages/Projects';
import Issues from './pages/Issues';
import IssueDetail from './pages/IssueDetail';
import Approvals from './pages/Approvals';
import Costs from './pages/Costs';
import Routines from './pages/Routines';
import Settings from './pages/Settings';
import Assets from './pages/Assets';
import Inbox from './pages/Inbox';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="companies" element={<Companies />} />
        <Route path="org" element={<OrgChart />} />
        <Route path="agents" element={<Agents />} />
        <Route path="agents/:id" element={<AgentDetail />} />
        <Route path="goals" element={<Goals />} />
        <Route path="projects" element={<Projects />} />
        <Route path="issues" element={<Issues />} />
        <Route path="issues/:id" element={<IssueDetail />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="costs" element={<Costs />} />
        <Route path="routines" element={<Routines />} />
        <Route path="settings" element={<Settings />} />
        <Route path="assets" element={<Assets />} />
        <Route path="inbox" element={<Inbox />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

export default App;