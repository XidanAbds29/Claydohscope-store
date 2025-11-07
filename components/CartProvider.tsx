"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem as CartItemType } from "./Cart";

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
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemType[]>([]);

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
        return prev.map((p) => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p));
      }
      const next: CartItemType = {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      };
      return [...prev, next];
    });
  };

  const updateQuantity = (id: number, quantity: number) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((p) => p.id !== id);
      return prev.map((p) => (p.id === id ? { ...p, quantity } : p));
    });
  };

  const removeItem = (id: number) => setItems((prev) => prev.filter((p) => p.id !== id));

  const clearCart = () => setItems([]);

  const cartTotal = items.reduce((s, it) => s + it.price * it.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, updateQuantity, removeItem, clearCart, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}
