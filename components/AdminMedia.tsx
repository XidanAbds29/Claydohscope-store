"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import styles from "./admin-media.module.css";

interface MediaItem {
  id: string;
  title: string;
  type: "video" | "gif" | "image";
  src: string;
  caption?: string;
  poster?: string;
  createdAt: string;
}

export default function AdminMedia() {
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [type, setType] = useState<"video" | "gif" | "image">("video");
  const [file, setFile] = useState<File | null>(null);
  const [poster, setPoster] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [media, setMedia] = useState<MediaItem[]>([]);

  // Load existing media on mount
  useState(() => {
    void loadMedia();
  });

  async function loadMedia() {
    const { data, error } = await supabase
      .from("media")
      .select("*")
      .order("createdAt", { ascending: false });
    if (!error && data) {
      setMedia(data as MediaItem[]);
    }
  }

  async function uploadFile(file: File, bucket: string) {
    const fileName = `${Date.now()}_${encodeURIComponent(file.name)}`;
    const { error: upErr } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { 
        cacheControl: "3600",
        upsert: false,
      });
    if (upErr) throw upErr;

    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    return (data as any)?.publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!file) throw new Error("Please select a file to upload");

      // 1. Upload the main media file
      const src = await uploadFile(file, type === "video" ? "media-videos" : "media-images");
      
      // 2. If it's a video and has a poster, upload that too
      let posterUrl = undefined;
      if (type === "video" && poster) {
        posterUrl = await uploadFile(poster, "media-posters");
      }

      // 3. Create the media record
      const session = await supabase.auth.getSession();
      const token = (session as any)?.data?.session?.access_token;
      if (!token) throw new Error("No session token");

      const res = await fetch("/api/admin/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          caption,
          type,
          src,
          poster: posterUrl,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json?.error || res.statusText);
      }

      setMessage("Media added successfully!");
      setTitle("");
      setCaption("");
      setFile(null);
      setPoster(null);
      void loadMedia(); // Refresh the list
    } catch (err: any) {
      setMessage("Error: " + (err?.message || "Upload failed"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className={styles.section}>
      <h2>Upload Media</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.field}>
          <label>Media Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as any)} required>
            <option value="video">Video Loop</option>
            <option value="gif">Animated GIF</option>
            <option value="image">Image</option>
          </select>
        </div>

        <div className={styles.field}>
          <label>Title</label>
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Short title for the media"
          />
        </div>

        <div className={styles.field}>
          <label>Caption (optional)</label>
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Brief description or caption"
          />
        </div>

        <div className={styles.field}>
          <label>{type === "video" ? "Video File (MP4/WebM)" : "Media File"}</label>
          <input
            type="file"
            accept={type === "video" ? "video/mp4,video/webm" : "image/*"}
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
          />
          <small>
            {type === "video"
              ? "Short loops work best (2-10 seconds). Max 8MB."
              : type === "gif"
              ? "Animated GIFs or static images. Max 5MB."
              : "JPEG, PNG, or WebP. Max 5MB."}
          </small>
        </div>

        {type === "video" && (
          <div className={styles.field}>
            <label>Poster Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setPoster(e.target.files ? e.target.files[0] : null)}
            />
            <small>Static preview image shown before video plays</small>
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" disabled={loading} className="btn btn--primary">
            {loading ? "Uploading..." : "Upload Media"}
          </button>
          {message && <span className={styles.message}>{message}</span>}
        </div>
      </form>

      <div className={styles.gallery}>
        <h3>Uploaded Media</h3>
        <div className={styles.grid}>
          {media.map((item) => (
            <div key={item.id} className={styles.item}>
              {item.type === "video" ? (
                <video
                  src={item.src}
                  poster={item.poster}
                  controls
                  loop
                  muted
                  className={styles.preview}
                />
              ) : (
                <img src={item.src} alt={item.title} className={styles.preview} />
              )}
              <div className={styles.meta}>
                <strong>{item.title}</strong>
                {item.caption && <small>{item.caption}</small>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}