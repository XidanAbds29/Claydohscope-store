"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function AdminAddProduct() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // If a file was selected, upload it to Supabase Storage first
      let imageUrl = image;
      if (file) {
        const fileName = `${Date.now()}_${encodeURIComponent(file.name)}`;
        const { error: upErr } = await supabase.storage.from('product-images').upload(fileName, file, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
        imageUrl = (data as any)?.publicUrl || imageUrl;
      }

      const session = await supabase.auth.getSession();
      const token = (session as any)?.data?.session?.access_token;
      if (!token) throw new Error('No session token');

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, description, price, image: imageUrl })
      });

      const json = await res.json();
      setLoading(false);
      if (!res.ok) {
        setMessage('Error: ' + (json?.error || res.statusText));
      } else {
        setMessage('Product added successfully');
        setName(''); setDescription(''); setPrice(0); setImage(''); setFile(null);
      }
    } catch (err: any) {
      setLoading(false);
      setMessage('Error: ' + (err?.message || 'Network error'));
    }
  }

  return (
    <section style={{ marginTop: 24 }}>
      <h2>Add Product</h2>
      <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12, maxWidth: 640 }}>
        <label>
          Name
          <input required value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #eee" }} />
        </label>

        <label>
          Description
          <textarea required value={description} onChange={(e) => setDescription(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #eee" }} />
        </label>

        <label>
          Price
          {/* Use a text input with numeric inputMode to avoid browser number spinners and allow only digits */}
          <input
            required
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={price === 0 ? '' : String(price)}
            onChange={(e) => {
              const digits = e.target.value.replace(/[^0-9]/g, '');
              setPrice(digits === '' ? 0 : Number(digits));
            }}
            style={{ width: "200px", padding: 8, borderRadius: 8, border: "1px solid #eee" }}
            placeholder="0"
          />
        </label>

        <label>
          Image URL
          <input value={image} onChange={(e) => setImage(e.target.value)} style={{ width: "100%", padding: 8, borderRadius: 8, border: "1px solid #eee" }} />
        </label>

        <label>
          Or upload image
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} style={{ display: 'block', marginTop: 8 }} />
        </label>

        <div>
          <button className="btn btn--primary" type="submit" disabled={loading}>{loading ? 'Adding...' : 'Add Product'}</button>
          {message && <span style={{ marginLeft: 12 }}>{message}</span>}
        </div>
      </form>
    </section>
  );
}
