"use client";

import { useActionState } from "react";
import { LogIn } from "lucide-react";
import { loginAction, type LoginState } from "@/app/actions/auth";
import { FieldError } from "@/components/field-error";

export function LoginForm() {
  const initialState: LoginState = { success: false };
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="mt-7" noValidate>
      <div>
        <label htmlFor="email" className="field-label">
          Work email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          className="form-control"
          placeholder="analyst@cyberwatch.local"
          required
          aria-invalid={Boolean(state.errors?.email)}
        />
        <FieldError errors={state.errors?.email} />
      </div>
      <div className="mt-5">
        <label htmlFor="password" className="field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="form-control"
          required
          aria-invalid={Boolean(state.errors?.password)}
        />
        <FieldError errors={state.errors?.password} />
      </div>
      {state.message && (
        <p
          className="mt-5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800"
          role="alert"
        >
          {state.message}
        </p>
      )}
      <button type="submit" disabled={pending} className="button-primary mt-6 w-full">
        <LogIn className="size-4" aria-hidden="true" />
        {pending ? "Signing in…" : "Sign in securely"}
      </button>
    </form>
  );
}
