"use client";

import { useState } from "react";
import styles from "./cart.module.css";

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onUpdateQuantity: (id: number, quantity: number) => void;
  onCheckout: () => void;
}

export default function Cart({
  items,
  onClose,
  onUpdateQuantity,
  onCheckout,
}: CartProps) {
  const [loading, setLoading] = useState(false);

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const formatPrice = (v: number) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency: "BDT",
        maximumFractionDigits: 0,
      }).format(v);
    } catch (e) {
      return `৳${v}`;
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2>Your Cart</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close cart"
          >
            ×
          </button>
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>Your cart is empty</div>
        ) : (
          <>
            <div className={styles.items}>
              {items.map((item) => (
                <div key={item.id} className={styles.item}>
                  {item.image && (
                    <img src={item.image} alt="" className={styles.itemImage} />
                  )}
                  <div className={styles.itemInfo}>
                    <div className={styles.itemName}>{item.name}</div>
                    <div className={styles.itemPrice}>
                      {formatPrice(item.price)}
                    </div>
                  </div>
                  <div className={styles.quantity}>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity - 1)
                      }
                      disabled={item.quantity <= 1}
                      className={styles.quantityButton}
                    >
                      −
                    </button>
                    <span className={styles.quantityText}>{item.quantity}</span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(item.id, item.quantity + 1)
                      }
                      className={styles.quantityButton}
                    >
                      +
                    </button>
                  </div>
                  <button
                    onClick={() => onUpdateQuantity(item.id, 0)}
                    className={styles.removeButton}
                    aria-label="Remove item"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>

            <footer className={styles.footer}>
              <div className={styles.total}>
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
              <button
                onClick={() => {
                  setLoading(true);
                  onCheckout();
                }}
                disabled={loading}
                className="btn btn--primary"
                style={{ width: "100%" }}
              >
                {loading ? "Processing..." : "Checkout"}
              </button>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
