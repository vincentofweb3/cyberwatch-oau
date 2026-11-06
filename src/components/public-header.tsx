import Link from "next/link";
import { Menu, ShieldAlert } from "lucide-react";
import { Brand } from "@/components/brand";

const navigation = [
  { href: "/report", label: "Report" },
  { href: "/track", label: "Track" },
  { href: "/alerts", label: "Alerts" },
  { href: "/learn", label: "Learn" },
];

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      <div className="page-shell flex min-h-18 items-center justify-between gap-6">
        <Brand />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-[#0a1d58]"
            >
              {item.label}
            </Link>
          ))}
          <Link href="/report" className="button-primary ml-2">
            <ShieldAlert className="size-4" aria-hidden="true" />
            Report an incident
          </Link>
        </nav>
        <details className="group relative md:hidden">
          <summary className="grid size-11 list-none place-items-center rounded-xl border border-slate-200 bg-white text-slate-700 [&::-webkit-details-marker]:hidden">
            <Menu className="size-5" aria-hidden="true" />
            <span className="sr-only">Open menu</span>
          </summary>
          <nav
            className="absolute top-13 right-0 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl"
            aria-label="Mobile navigation"
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/login"
              className="mt-1 block rounded-xl px-3 py-2.5 text-sm text-slate-500"
            >
              Responder sign in
            </Link>
          </nav>
        </details>
      </div>
    </header>
  );
}
