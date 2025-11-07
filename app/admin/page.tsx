"use client";

import { useEffect, useState } from "react";
import AdminOrders from "../../components/AdminOrders";
import AdminAddProduct from "../../components/AdminAddProduct";
import AdminLogin from "../../components/AdminLogin";

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const { data } = await (
          await import("../../lib/supabaseClient")
        ).supabase.auth.getSession();
        const session = (data as any)?.session;
        const allowed = process.env.NEXT_PUBLIC_ADMIN_USER;
        if (
          session &&
          session.user &&
          (!allowed || session.user.email === allowed)
        ) {
          setAuthed(true);
        } else {
          setAuthed(false);
        }
      } catch (err) {
        setAuthed(false);
      }
    }
    check();
  }, []);

  if (authed === null)
    return <div className="container">Checking admin status…</div>;

  if (!authed) {
    return (
      <div className="container" style={{ padding: "2rem 0" }}>
        <h1>Admin Sign In</h1>
        <AdminLogin onSuccess={() => setAuthed(true)} />
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem 0" }}>
      <div className="container">
        <h1 style={{ marginBottom: 12 }}>Admin Dashboard</h1>

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
          <AdminAddProduct />
          <AdminOrders />
        </div>
      </div>
    </div>
  );
}
