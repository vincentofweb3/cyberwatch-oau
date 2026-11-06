import Link from "next/link";
import { LogOut, Menu, ShieldCheck } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";
import { Brand } from "@/components/brand";
import { DashboardNav } from "@/components/dashboard-nav";
import { requireResponder } from "@/lib/dal/session";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const responder = await requireResponder();

  return (
    <div className="min-h-screen bg-slate-100 lg:grid lg:grid-cols-[250px_1fr]">
      <aside className="security-grid fixed inset-y-0 left-0 z-30 hidden w-[250px] flex-col bg-[#07133b] text-white lg:flex">
        <div className="border-b border-white/10 px-5 py-5">
          <Brand inverse />
        </div>
        <div className="px-6 pt-6 pb-3 text-[0.65rem] font-extrabold tracking-[0.14em] text-blue-200/60 uppercase">
          Operations desk
        </div>
        <DashboardNav />
        <div className="mt-auto border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3">
            <p className="truncate text-sm font-bold">{responder.fullName}</p>
            <p className="mt-1 text-xs text-blue-100/60">
              {responder.role === "ADMIN" ? "Administrator" : "Security analyst"}
            </p>
          </div>
          <form action={logoutAction}>
            <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-100/70 hover:bg-white/10 hover:text-white">
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className="flex min-h-16 items-center justify-between px-4">
            <Brand compact />
            <details className="group relative">
              <summary className="grid size-10 list-none place-items-center rounded-xl border border-slate-200 [&::-webkit-details-marker]:hidden">
                <Menu className="size-5" aria-hidden="true" />
                <span className="sr-only">Open workspace menu</span>
              </summary>
              <div className="absolute top-12 right-0 w-64 rounded-2xl bg-[#07133b] p-3 shadow-2xl">
                <div className="mb-2 border-b border-white/10 px-3 pb-3">
                  <p className="truncate text-sm font-bold text-white">{responder.fullName}</p>
                  <p className="mt-1 text-xs text-blue-100/60">{responder.role}</p>
                </div>
                <DashboardNav mobile />
                <form action={logoutAction}>
                  <button className="mt-2 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-bold text-blue-100/75 hover:bg-white/10">
                    <LogOut className="size-4" aria-hidden="true" />
                    Sign out
                  </button>
                </form>
              </div>
            </details>
          </div>
        </header>
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-[0.7rem] font-semibold text-amber-900">
          <ShieldCheck className="mr-1 inline size-3.5" aria-hidden="true" />
          Academic prototype — do not enter real incident data or secrets.
        </div>
        <main id="main-content" className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
        <footer className="px-6 pb-8 text-center text-xs text-slate-400">
          CyberWatch OAU independent academic prototype ·{" "}
          <Link href="/" className="font-semibold hover:text-[#1739a8]">
            Public site
          </Link>
        </footer>
      </div>
    </div>
  );
}
