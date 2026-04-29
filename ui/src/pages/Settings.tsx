import { useState } from 'react';
import { clsx } from 'clsx';

function Settings() {
  const [activeTab, setActiveTab] = useState('general');
  const tabs = [
    { id: 'general', name: 'General' },
    { id: 'adapters', name: 'Adapters' },
    { id: 'agents', name: 'All Agents' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Settings</h2>
        <p className="text-muted-foreground">Instance configuration</p>
      </div>
      
      <div className="border-b">
        <nav className="flex space-x-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'pb-2 text-sm font-medium',
                activeTab === tab.id
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground'
              )}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border rounded-lg bg-card">
        <p className="text-muted-foreground">{activeTab} settings</p>
      </div>
    </div>
  );
}

export default Settings;