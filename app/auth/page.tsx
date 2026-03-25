"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Mode = "login" | "signup";

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const supabase = createClient();

    if (!supabase) {
      setError(
        "Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file."
      );
      setLoading(false);
      return;
    }

    try {
      if (mode === "signup") {
        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (signUpError) throw signUpError;
        setSuccess(
          "Account created! Check your email for a confirmation link, then come back to sign in."
        );
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (signInError) throw signInError;
        router.push("/");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = [
    "w-full px-4 py-3 rounded-xl text-sm",
    "bg-[#141414] border border-[#222] text-[#f0f0f0]",
    "placeholder-[#333] outline-none transition-colors",
    "focus:border-[#10b981]",
  ].join(" ");

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#0a0a0a" }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold mb-4"
            style={{ background: "#10b981", color: "#000" }}
          >
            N
          </div>
          <h1
            className="font-heading text-2xl font-bold tracking-tight"
            style={{ color: "#f0f0f0" }}
          >
            Nestly
          </h1>
          <p className="text-sm mt-1" style={{ color: "#555" }}>
            STR Profit Intelligence
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7"
          style={{ background: "#111", border: "1px solid #1e1e1e" }}
        >
          {/* Mode toggle */}
          <div
            className="flex rounded-lg overflow-hidden mb-6"
            style={{ border: "1px solid #1e1e1e" }}
          >
            {(["login", "signup"] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(""); setSuccess(""); }}
                className="flex-1 py-2 text-sm font-semibold transition-colors"
                style={{
                  background: mode === m ? "#10b981" : "#161616",
                  color: mode === m ? "#000" : "#666",
                }}
              >
                {m === "login" ? "Log In" : "Sign Up"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div>
              <label
                htmlFor="email"
                className="block text-xs mb-1.5 font-medium"
                style={{ color: "#555" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-xs mb-1.5 font-medium"
                style={{ color: "#555" }}
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                required
                minLength={6}
                placeholder={mode === "signup" ? "At least 6 characters" : "Your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls}
              />
            </div>

            {/* Error / success messages */}
            {error && (
              <div
                className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{ background: "#1a0d0d", border: "1px solid #3a1515", color: "#f87171" }}
              >
                {error}
              </div>
            )}
            {success && (
              <div
                className="rounded-xl px-4 py-3 text-xs leading-relaxed"
                style={{ background: "#0d1a14", border: "1px solid #1a3a28", color: "#34d399" }}
              >
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-sm font-bold mt-1 transition-opacity"
              style={{
                background: "#10b981",
                color: "#000",
                opacity: loading ? 0.6 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading
                ? mode === "signup" ? "Creating account…" : "Signing in…"
                : mode === "signup" ? "Create free account" : "Sign in"}
            </button>
          </form>

          {/* Footer link */}
          <p className="text-center text-xs mt-5" style={{ color: "#444" }}>
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); setSuccess(""); }}
              className="font-semibold transition-colors hover:text-[#10b981]"
              style={{ color: "#10b981" }}
            >
              {mode === "login" ? "Sign up free" : "Log in"}
            </button>
          </p>
        </div>

        {/* Back link */}
        <p className="text-center text-xs mt-5">
          <a href="/" className="transition-colors" style={{ color: "#3a3a3a" }}>
            ← Back to deal discovery
          </a>
        </p>
      </div>
    </div>
  );
}
