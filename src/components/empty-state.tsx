import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export function EmptyState({
  icon: Icon,
  title,
  description,
  href,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
  action?: string;
}) {
  return (
    <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-8 text-center">
      <div className="max-w-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-white text-slate-500 shadow-sm">
          <Icon className="size-5" aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-lg font-extrabold text-[#0a1d58]">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
        {href && action && (
          <Link href={href} className="button-secondary mt-5">
            {action}
          </Link>
        )}
      </div>
    </div>
  );
}
