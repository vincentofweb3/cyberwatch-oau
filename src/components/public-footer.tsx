import Link from "next/link";
import { ArrowUpRight, LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";

export function PublicFooter() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-[#07133b] text-white">
      <div className="page-shell grid gap-10 py-12 lg:grid-cols-[1.3fr_0.7fr_0.7fr]">
        <div className="max-w-md">
          <Brand inverse />
          <p className="mt-5 text-sm leading-7 text-blue-100/80">
            An independent academic prototype designed for SIWES research and demonstration. It is
            not an official OAU reporting channel and does not guarantee institutional response.
          </p>
          <div className="mt-5 flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-xs leading-5 text-blue-100">
            <LockKeyhole className="mt-0.5 size-4 shrink-0 text-[#f4c862]" aria-hidden="true" />
            Never submit passwords, OTPs, recovery codes, financial PINs, or active malware.
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.13em] text-blue-200 uppercase">
            Use CyberWatch
          </h2>
          <div className="mt-4 grid gap-2 text-sm text-blue-100/80">
            <Link href="/report" className="hover:text-white">
              Report an incident
            </Link>
            <Link href="/track" className="hover:text-white">
              Track a report
            </Link>
            <Link href="/alerts" className="hover:text-white">
              Security alerts
            </Link>
            <Link href="/learn" className="hover:text-white">
              Awareness centre
            </Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold tracking-[0.13em] text-blue-200 uppercase">
            Official resources
          </h2>
          <div className="mt-4 grid gap-3 text-sm text-blue-100/80">
            <a
              className="inline-flex items-center gap-1 hover:text-white"
              href="https://oauife.edu.ng/cybersecurity-tips/"
              target="_blank"
              rel="noreferrer"
            >
              OAU cybersecurity tips <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <a
              className="inline-flex items-center gap-1 hover:text-white"
              href="https://oauife.edu.ng/"
              target="_blank"
              rel="noreferrer"
            >
              OAU official website <ArrowUpRight className="size-3.5" aria-hidden="true" />
            </a>
            <Link href="/login" className="hover:text-white">
              Responder sign in
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="page-shell flex flex-col gap-2 py-5 text-xs text-blue-100/60 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} CyberWatch OAU academic prototype.</span>
          <span>Built with privacy, clarity, and safe escalation in mind.</span>
        </div>
      </div>
    </footer>
  );
}
