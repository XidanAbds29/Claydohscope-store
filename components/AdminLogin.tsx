"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminLogin({ onSuccess }: { onSuccess: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message || "Login failed");
        setLoading(false);
        return;
      }

      const user = data?.user;
      const allowed = process.env.NEXT_PUBLIC_ADMIN_USER;
      if (!user || (allowed && user.email !== allowed)) {
        // Not an allowed admin user - sign out and show error
        await supabase.auth.signOut();
        setError("Not authorized as admin");
        setLoading(false);
        return;
      }

      onSuccess();
    } catch (err: any) {
      setError(err?.message || "Network error");
    }

    setLoading(false);
  }

  return (
    <form onSubmit={submit} style={{ maxWidth: 420, display: "grid", gap: 12 }}>
      <label>
        Email
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{
            width: "100%",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #eee",
          }}
        />
      </label>
      <div>
        <button type="submit" className="btn btn--primary" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </div>
      {error && <div style={{ color: "red" }}>{error}</div>}
    </form>
  );
}
