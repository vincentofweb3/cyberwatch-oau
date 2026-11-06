import { Brand } from "@/components/brand";

export default function Loading() {
  return (
    <main
      className="grid min-h-screen place-items-center bg-slate-50 p-6"
      aria-busy="true"
      aria-label="Loading page"
    >
      <div className="text-center">
        <Brand />
        <span className="mx-auto mt-7 block size-8 animate-spin rounded-full border-4 border-blue-100 border-t-[#1739a8]" />
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading CyberWatch…</p>
      </div>
    </main>
  );
}
