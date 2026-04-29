function Routines() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Routines</h2>
          <p className="text-muted-foreground">Scheduled tasks</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md">
          Create Routine
        </button>
      </div>
    </div>
  );
}

export default Routines;