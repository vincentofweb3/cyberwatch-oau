import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { cn } from "@/lib/cn";

export function Brand({
  compact = false,
  inverse = false,
}: {
  compact?: boolean;
  inverse?: boolean;
}) {
  return (
    <Link href="/" className="inline-flex items-center gap-3" aria-label="CyberWatch OAU home">
      <span
        className={cn(
          "relative grid size-10 shrink-0 place-items-center rounded-xl border",
          inverse
            ? "border-white/20 bg-white/10 text-white"
            : "border-blue-200 bg-blue-50 text-[#1739a8]",
        )}
      >
        <ShieldCheck className="size-5" strokeWidth={2.2} aria-hidden="true" />
        <span className="absolute -right-1 -bottom-1 size-2.5 rounded-full border-2 border-white bg-[#0b8f79]" />
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block text-[0.98rem] leading-none font-extrabold tracking-[-0.02em]",
            inverse ? "text-white" : "text-[#0a1d58]",
          )}
        >
          CyberWatch <span className={inverse ? "text-[#f4c862]" : "text-[#1739a8]"}>OAU</span>
        </span>
        {!compact && (
          <span
            className={cn(
              "mt-1 block text-[0.67rem] font-semibold tracking-[0.08em] uppercase",
              inverse ? "text-blue-100" : "text-slate-500",
            )}
          >
            Report · Track · Learn
          </span>
        )}
      </span>
    </Link>
  );
}
