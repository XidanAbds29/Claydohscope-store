"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem as CartItemType } from "./Cart";
import { playAdd, playRemove } from "./sound";

interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

interface CartContextValue {
  items: CartItemType[];
  addToCart: (product: Product) => void;
  updateQuantity: (id: number, quantity: number) => void;
  removeItem: (id: number) => void;
  clearCart: () => void;
  cartTotal: number;
  showCheckout: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
  showToast: (message: string) => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("claydoh_cart");
      if (raw) setItems(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, []);

  // persist
  useEffect(() => {
    try {
      localStorage.setItem("claydoh_cart", JSON.stringify(items));
    } catch (e) {
      // ignore
    }
  }, [items]);

  const addToCart = (product: Product) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.id === product.id);
      if (existing) {
        playAdd();
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      const next: CartItemType = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      };
      // show toast when added first time
      showToast(`${product.name} added to cart`);
      playAdd();
      return [...prev, next];
    });
    // if item exists, also show toast (handled above)
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
    window.setTimeout(() => setToastVisible(false), 3000);
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) {
        const removed = prev.find((p) => p.id === id);
        if (removed) {
          playRemove();
          showToast(`${removed.name} removed from cart`);
        }
        return prev.filter((p) => p.id !== id);
      }
      return prev.map((p) => (p.id === id ? { ...p, quantity } : p));
    });
  };

  const removeItem = (id: number) =>
    setItems((prev) => {
      const removed = prev.find((p) => p.id === id);
      if (removed) {
        playRemove();
        showToast(`${removed.name} removed from cart`);
      }
      return prev.filter((p) => p.id !== id);
    });

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        cartTotal,
        showCheckout,
        openCheckout: () => setShowCheckout(true),
        closeCheckout: () => setShowCheckout(false),
        showToast,
      }}
    >
      {children}
      {/* Toast rendered at provider level so it's available everywhere */}
      {/* Dynamically import small Toast component to keep provider simple */}
      {typeof window !== "undefined" && (
        // lazy render to avoid SSR mismatch
        require("./Toast").default({ message: toastMessage, visible: toastVisible, onClose: () => setToastVisible(false) })
      )}
    </CartContext.Provider>
  );
}
