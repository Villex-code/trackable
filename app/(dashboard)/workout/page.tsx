export default function WorkoutPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-bold tracking-tight">Workouts</h2>
        <p className="text-text-muted mt-2 text-lg">Track your physical activity and fitness progress.</p>
      </div>

      <div className="glass p-8 rounded-2xl border border-card-border">
        <div className="flex items-center justify-between mb-8">
          <h3 className="text-xl font-semibold">Recent Sessions</h3>
          <button className="px-4 py-2 bg-accent hover:bg-accent/80 rounded-lg font-medium transition-colors">
            Add Workout
          </button>
        </div>
        
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center text-accent">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m11 11 5 5"/><path d="m11 11-5-5"/><path d="m6.5 17.5 11-11"/></svg>
                </div>
                <div>
                  <p className="font-medium">Strength Training</p>
                  <p className="text-sm text-text-muted">May {i + 1}, 2024 • 45 mins</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">320 kcal</p>
                <p className="text-sm text-text-muted">High Intensity</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
