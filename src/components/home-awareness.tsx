import Link from "next/link";
import { ArrowRight, ChevronDown, KeyRound, ShieldAlert, WalletCards } from "lucide-react";

export function ScamSpotlight() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="scam-spotlight-title">
      <div className="page-shell grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#1739a8] uppercase">
            Learn to spot it
          </p>
          <h2
            id="scam-spotlight-title"
            className="font-display mt-3 text-3xl font-bold tracking-[-0.03em] text-[#0a1d58] sm:text-4xl"
          >
            A familiar name. Three warning signs.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
            Scam messages often borrow the language of campus life: fee payments, results,
            scholarships, and clearance. Check what the message asks you to do, even when the sender
            looks familiar.
          </p>
          <ol className="mt-6 grid gap-5">
            {[
              ["Pressure to act", "A short deadline is meant to stop you from checking the story."],
              [
                "An unusual payment",
                "Confirm fees and payment destinations through a known official channel.",
              ],
              [
                "A request for a secret",
                "Never share an OTP, password, or recovery code with someone asking for it.",
              ],
            ].map(([title, text], index) => (
              <li key={title} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-amber-100 text-xs font-extrabold text-amber-900">
                  {index + 1}
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-[#0a1d58]">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <div className="paper-grid rounded-3xl border border-slate-200 p-5 sm:p-8">
          <p className="mb-4 text-xs font-bold tracking-widest text-slate-500 uppercase">
            Fictional message · learning example
          </p>
          <div className="card-shadow rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <span className="grid size-10 place-items-center rounded-full bg-blue-50 text-[#1739a8]">
                <ShieldAlert className="size-5" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-extrabold text-[#0a1d58]">“Student Support”</p>
                <p className="mt-0.5 text-xs text-slate-500">
                  Display name only · identity unverified
                </p>
              </div>
            </div>
            <blockquote className="mt-5 text-lg leading-9 text-slate-700">
              Your bursary refund{" "}
              <mark className="rounded bg-amber-100 px-1 text-amber-950">
                expires in 30 minutes
              </mark>
              . Pay a{" "}
              <mark className="rounded bg-amber-100 px-1 text-amber-950">
                verification fee to this personal account
              </mark>{" "}
              and <mark className="rounded bg-amber-100 px-1 text-amber-950">send your OTP</mark> to
              release it.
            </blockquote>
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950">
            <strong>Your next move:</strong> pause, do not pay or reply with a code, and verify
            using contact details you already trust. A logo or profile photo is not proof.
          </div>
          <Link
            href="/learn#quiz"
            className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-[#1739a8]"
          >
            Try the two-minute quiz <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export function RecoveryGuide() {
  return (
    <section
      className="security-grid bg-[#07133b] py-16 text-white sm:py-20"
      aria-labelledby="recovery-title"
    >
      <div className="page-shell">
        <p className="text-xs font-extrabold tracking-[0.14em] text-blue-200 uppercase">
          Take the next safe step
        </p>
        <h2
          id="recovery-title"
          className="font-display mt-3 max-w-2xl text-3xl font-bold tracking-[-0.03em] sm:text-4xl"
        >
          Already clicked? Focus on what you can do now.
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-blue-100/80">
          These messages are designed to catch people off guard. Stop interacting, keep the details
          you already have, and take the action that fits what happened.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: ShieldAlert,
              title: "Opened a suspicious link?",
              text: "Close the page and do not revisit it for evidence. If you downloaded a file, do not open it. If the device shows signs of compromise, disconnect it from networks and seek technical help.",
              href: "/learn#handle-links",
              link: "Read link safety steps",
            },
            {
              icon: KeyRound,
              title: "Shared a password or OTP?",
              text: "Go directly to the real service from a trusted device. Change exposed or reused passwords, sign out other sessions, review recovery details, and enable multi-factor authentication.",
              href: "/learn#protect-account",
              link: "Read account recovery steps",
            },
            {
              icon: WalletCards,
              title: "Sent money or card details?",
              text: "Contact your bank or payment provider immediately using its official app or a known number. Ask about securing the account and reporting the transaction. Keep the receipt and conversation.",
              href: "/learn#preserve-evidence",
              link: "Read evidence safety steps",
            },
          ].map(({ icon: Icon, title, text, href, link }) => (
            <article
              key={title}
              className="flex flex-col rounded-2xl border border-white/15 bg-white/5 p-6"
            >
              <Icon className="size-6 text-[#f4c862]" aria-hidden="true" />
              <h3 className="mt-5 text-lg font-extrabold">{title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-blue-100/85">{text}</p>
              <Link
                href={href}
                className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-blue-100 hover:text-white"
              >
                {link} <ArrowRight className="size-4 shrink-0" aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
        <p className="mt-6 text-sm leading-6 text-blue-100/75">
          For an active incident, contact the relevant service provider or a trusted support channel
          directly. This academic demo does not provide emergency response.
        </p>
      </div>
    </section>
  );
}

export function ReportingQuestions() {
  return (
    <section className="bg-white py-16 sm:py-20" aria-labelledby="reporting-questions-title">
      <div className="page-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-[#1739a8] uppercase">
            Before you report
          </p>
          <h2
            id="reporting-questions-title"
            className="font-display mt-3 text-3xl font-bold tracking-[-0.03em] text-[#0a1d58] sm:text-4xl"
          >
            A little clarity goes a long way.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-7 text-slate-600">
            Understand what to share, how tracking works, and what stays private. Use fictional
            information when exploring this prototype.
          </p>
        </div>
        <div className="divide-y divide-slate-200 border-y border-slate-200">
          {[
            [
              "Do I need an account to report?",
              "No. You can submit a report anonymously or choose to provide contact details. Include the type of concern, what happened, when it happened, and what was affected. Avoid unrelated personal information.",
            ],
            [
              "Who can see a report?",
              "Signed-in analysts and administrators can review reports. Someone with both the report reference and private tracking key can see its title, status, severity, and deliberately shared updates. Reports are not listed on the public site.",
            ],
            [
              "What should I keep out of a report?",
              "Never include passwords, OTPs, recovery codes, financial PINs, or full card details. File uploads are not available in this version. Describe the evidence safely and keep original messages privately; do not reopen harmful links.",
            ],
            [
              "What if I lose my tracking key?",
              "The key is shown once and cannot be recovered from the database. Save it with your report reference in a private, secure place. The reference alone cannot unlock the tracking page.",
            ],
            [
              "Are my quiz answers saved?",
              "No. The awareness quiz is a practice exercise. Your answers and score remain on the current page only; leaving or refreshing clears them. Analysts cannot see individual quiz results.",
            ],
          ].map(([question, answer]) => (
            <details key={question} className="group py-1">
              <summary className="flex list-none items-center justify-between gap-4 rounded-lg py-5 text-sm font-extrabold text-[#0a1d58] [&::-webkit-details-marker]:hidden">
                {question}
                <ChevronDown
                  className="size-4 shrink-0 text-[#1739a8] transition-transform group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="max-w-2xl pb-5 pr-5 text-sm leading-7 text-slate-600">{answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
