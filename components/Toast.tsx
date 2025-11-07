"use client";

import React, { useEffect } from "react";
import styles from "./toast.module.css";

export default function Toast({
  message,
  visible,
  onClose,
}: {
  message: string;
  visible: boolean;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [visible, onClose]);

  return (
    <div
      className={`${styles.toast} ${visible ? styles.show : ""}`}
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
