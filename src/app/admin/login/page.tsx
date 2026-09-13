"use client";

import { useActionState } from "react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = null;

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-sm flex-col justify-center px-6">
      <h1 className="text-xl font-semibold">Logg inn</h1>
      <p className="mt-1 text-sm text-black/60">
        Admin-panel for konsulentbloggen.
      </p>
      <form action={formAction} className="mt-6 space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            E-post
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Passord
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border border-black/15 px-3 py-2 text-sm outline-none focus:border-black/40"
          />
        </div>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 disabled:opacity-50"
        >
          {pending ? "Logger inn…" : "Logg inn"}
        </button>
      </form>
    </div>
  );
}
