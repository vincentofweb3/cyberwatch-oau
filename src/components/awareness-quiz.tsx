"use client";

import { useState } from "react";
import { CheckCircle2, RotateCcw, XCircle } from "lucide-react";

const questions = [
  {
    question:
      "A message that appears to come from a lecturer asks for your OTP to confirm a result update. What should you do?",
    options: [
      "Send it because the name is familiar",
      "Verify through a known channel and never share the OTP",
      "Reply and ask why it is needed",
    ],
    correct: 1,
    explanation:
      "An OTP is an authentication secret. A name or profile photo does not prove who controls an account.",
  },
  {
    question:
      "You clicked a suspicious link but did not enter any information. What is the safest next step?",
    options: [
      "Visit it again to take screenshots",
      "Ignore it completely",
      "Close it, preserve what you already have, and report it",
    ],
    correct: 2,
    explanation:
      "Do not create more exposure by revisiting a hostile page. Preserve existing details and report safely.",
  },
  {
    question:
      "A WhatsApp account using an officer's photograph requests an urgent payment to a personal account. What is the strongest warning sign?",
    options: [
      "The message arrived in the evening",
      "Urgency plus an unofficial payment destination",
      "The profile has a photograph",
    ],
    correct: 1,
    explanation:
      "Urgency, secrecy, and payment to an unrelated personal account are common social-engineering signals.",
  },
] as const;

export function AwarenessQuiz() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const score = questions.reduce(
    (total, item, index) => total + (answers[index] === item.correct ? 1 : 0),
    0,
  );

  function reset() {
    setAnswers({});
    setSubmitted(false);
  }

  return (
    <section
      id="quiz"
      className="card-shadow scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-6 sm:p-8"
      aria-labelledby="quiz-title"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-[0.13em] text-[#1739a8] uppercase">
            Two-minute check
          </p>
          <h2
            id="quiz-title"
            className="mt-1 text-2xl font-extrabold tracking-[-0.03em] text-[#0a1d58]"
          >
            Would you spot the warning signs?
          </h2>
        </div>
        <p className="max-w-xs text-xs leading-5 text-slate-500">
          Practice only. Answers and scores stay on this page and reset when you leave or reload.
          Nothing is saved to the database.
        </p>
      </div>

      <div className="mt-7 grid gap-7">
        {questions.map((item, questionIndex) => (
          <fieldset
            key={item.question}
            className="border-t border-slate-100 pt-6 first:border-0 first:pt-0"
          >
            <legend className="font-bold leading-6 text-slate-900">
              <span className="mr-2 text-[#1739a8]">{questionIndex + 1}.</span>
              {item.question}
            </legend>
            <div className="mt-4 grid gap-2">
              {item.options.map((option, optionIndex) => {
                const selected = answers[questionIndex] === optionIndex;
                const isCorrect = item.correct === optionIndex;
                const resultStyle =
                  submitted && selected
                    ? isCorrect
                      ? "border-emerald-300 bg-emerald-50"
                      : "border-rose-300 bg-rose-50"
                    : selected
                      ? "border-blue-400 bg-blue-50"
                      : "border-slate-200 hover:border-blue-200 hover:bg-blue-50/40";
                return (
                  <label
                    key={option}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 text-sm leading-6 transition ${resultStyle}`}
                  >
                    <input
                      type="radio"
                      name={`question-${questionIndex}`}
                      value={optionIndex}
                      checked={selected}
                      onChange={() => {
                        setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }));
                        setSubmitted(false);
                      }}
                      className="mt-1 size-4 accent-[#1739a8]"
                    />
                    <span>{option}</span>
                  </label>
                );
              })}
            </div>
            {submitted && (
              <div
                className={`mt-3 flex items-start gap-2 rounded-xl p-3 text-sm leading-6 ${answers[questionIndex] === item.correct ? "bg-emerald-50 text-emerald-900" : "bg-rose-50 text-rose-900"}`}
              >
                {answers[questionIndex] === item.correct ? (
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                ) : (
                  <XCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                )}
                {item.explanation}
              </div>
            )}
          </fieldset>
        ))}
      </div>

      {submitted ? (
        <div className="mt-7 flex flex-col gap-4 rounded-2xl bg-[#07133b] p-5 text-white sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold tracking-widest text-blue-200 uppercase">Your score</p>
            <p className="mt-1 text-xl font-extrabold">
              {score} of {questions.length} correct
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            className="button-secondary border-white/20 bg-white/10 text-white hover:bg-white/20"
          >
            <RotateCcw className="size-4" aria-hidden="true" />
            Try again
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setSubmitted(true)}
          disabled={Object.keys(answers).length !== questions.length}
          className="button-primary mt-7"
        >
          Check my answers
        </button>
      )}
    </section>
  );
}
