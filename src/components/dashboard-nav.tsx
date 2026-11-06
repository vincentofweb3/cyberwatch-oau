"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BellRing, LayoutDashboard, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/cn";

const items = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/incidents", label: "Incidents", icon: ShieldAlert },
  { href: "/dashboard/alerts", label: "Alerts", icon: BellRing },
];

export function DashboardNav({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Responder workspace" className={cn(mobile ? "grid gap-1" : "grid gap-1 px-3")}>
      {items.map((item) => {
        const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition",
              active
                ? "bg-white text-[#0a1d58] shadow-sm"
                : "text-blue-100/75 hover:bg-white/10 hover:text-white",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
