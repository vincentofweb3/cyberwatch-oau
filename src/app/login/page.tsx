import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LockKeyhole, ShieldCheck } from "lucide-react";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { getCurrentResponder } from "@/lib/dal/session";

export const metadata: Metadata = {
  title: "Responder sign in",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getCurrentResponder()) redirect("/dashboard");

  return (
    <main className="security-grid grid min-h-screen bg-[#07133b] px-4 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10">
      <section className="mx-auto hidden max-w-xl text-white lg:block">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-bold text-blue-100">
          <ShieldCheck className="size-4 text-[#f4c862]" aria-hidden="true" />
          Authorized responder workspace
        </div>
        <h1 className="font-display mt-7 text-5xl font-bold tracking-[-0.04em]">
          Triage clearly. Respond consistently. Record every change.
        </h1>
        <p className="mt-5 text-base leading-8 text-blue-100/75">
          The responder workspace separates internal analysis from reporter-visible updates and
          keeps privileged actions in an audit trail.
        </p>
        <div className="mt-8 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-blue-100/80">
          <LockKeyhole className="mt-0.5 size-5 shrink-0 text-[#f4c862]" aria-hidden="true" />
          Development credentials are for local demonstration only. Institutional deployment
          requires OAU SSO, MFA, managed identity lifecycle, and approved access reviews.
        </div>
      </section>

      <section className="mx-auto w-full max-w-md rounded-3xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
        <Brand />
        <div className="mt-8">
          <p className="text-xs font-extrabold tracking-[0.13em] text-[#1739a8] uppercase">
            Responder access
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#0a1d58]">
            Sign in to the operations desk
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Use an active analyst or administrator account.
          </p>
        </div>
        <LoginForm />
        <div className="mt-6 border-t border-slate-100 pt-5">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-[#1739a8]"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Return to public site
          </Link>
        </div>
      </section>
    </main>
  );
}
