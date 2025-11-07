"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./header.module.css";
import Cart from "./Cart";
import { useCart } from "./CartProvider";

export default function Header({
  cartItemCount = 0,
}: {
  cartItemCount?: number;
}) {
  const [showCart, setShowCart] = useState(false);
  const { items: cartItems, updateQuantity, clearCart, openCheckout } = useCart();

  return (
    <header className={styles.header}>
      <div className={`container ${styles.headerInner}`}>
        <Link href="/" className={styles.brand}>
          <div className={styles.logo} aria-hidden>
            <img
              src="/src/logo.png"
              alt="Claydohscope logo"
              className={styles.logoImage}
              width={48}
              height={48}
              loading="eager"
            />
          </div>

          <div className={styles.brandInfo}>
            <h1>Claydohscope</h1>
            <p>Handmade clay cuteness</p>
          </div>
        </Link>

        <nav className={styles.nav} aria-label="Main navigation">
          <Link href="/" className={styles.navLink}>
            Products
          </Link>
          <Link href="/about" className={styles.navLink}>
            About
          </Link>
          <button
            className={styles.cartButton}
            onClick={() => setShowCart(true)}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 7H20L18 19H6L4 7Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8 7V5C8 3.34315 9.34315 2 11 2H13C14.6569 2 16 3.34315 16 5V7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Cart
            {cartItems.length > 0 && (
              <span className={styles.cartCount}>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </button>
        </nav>
      </div>

      {showCart && (
        <Cart
          items={cartItems}
          onClose={() => setShowCart(false)}
          onUpdateQuantity={(id, quantity) => updateQuantity(id, quantity)}
          onCheckout={() => {
            // Open the global checkout modal and close the cart overlay
            openCheckout();
            setShowCart(false);
          }}
        />
      )}
    </header>
  );
}
