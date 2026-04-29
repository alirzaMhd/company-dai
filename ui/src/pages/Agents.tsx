function Agents() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Agents</h2>
          <p className="text-muted-foreground">Manage AI agents</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Create Agent
        </button>
      </div>
    </div>
  );
}

export default Agents;