import Link from "next/link";
import { ArrowLeft, FileQuestion } from "lucide-react";
import { Brand } from "@/components/brand";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <Brand />
        </div>
        <span className="mx-auto mt-8 grid size-14 place-items-center rounded-2xl bg-blue-50 text-[#1739a8]">
          <FileQuestion className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-5 text-xs font-extrabold tracking-[0.14em] text-slate-400 uppercase">
          404 · Not found
        </p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-[-0.03em] text-[#0a1d58]">
          This page is not available.
        </h1>
        <p className="mt-3 text-sm leading-7 text-slate-500">
          The address may be incorrect, or the resource may no longer exist. No incident information
          has been disclosed.
        </p>
        <Link href="/" className="button-primary mt-6">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Return home
        </Link>
      </div>
    </main>
  );
}
