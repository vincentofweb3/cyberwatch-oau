export default function DashboardLoading() {
  return (
    <div
      className="mx-auto max-w-7xl animate-pulse"
      aria-busy="true"
      aria-label="Loading responder workspace"
    >
      <div className="h-4 w-32 rounded bg-slate-200" />
      <div className="mt-3 h-9 w-80 max-w-full rounded bg-slate-200" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="h-36 rounded-2xl bg-white" />
        ))}
      </div>
      <div className="mt-8 h-96 rounded-2xl bg-white" />
    </div>
  );
}
