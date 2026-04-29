function Companies() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Companies</h2>
          <p className="text-muted-foreground">Manage companies</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Create Company
        </button>
      </div>
    </div>
  );
}

export default Companies;