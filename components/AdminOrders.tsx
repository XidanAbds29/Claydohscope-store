"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import styles from "./admin-orders.module.css";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

interface Order {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  bkash_trxid: string;
  order_details: {
    items: OrderItem[];
    total: number;
    notes?: string;
  };
  status: string;
  created_at?: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    setError(null);
    try {
      const session = await supabase.auth.getSession();
      const token = (session as any)?.data?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/admin/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);
      setOrders((json?.orders as Order[]) || []);
    } catch (err: any) {
      setError(err?.message || "Network error");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id: number, status: string) {
    try {
      const session = await supabase.auth.getSession();
      const token = (session as any)?.data?.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || res.statusText);
      fetchOrders();
    } catch (err: any) {
      setError(err?.message || "Network error");
    }
  }

  return (
    <section className={styles.orderList}>
      <div className="header">
        <h2>Orders</h2>
        <button className="btn" onClick={fetchOrders}>
          Refresh
        </button>
      </div>

      {loading && <p>Loading orders…</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <div className={styles.orderList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.orderCard}>
            <div className={styles.orderHeader}>
              <div className={styles.customerInfo}>
                <h3>{order.customer_name}</h3>
                <div className={styles.customerMeta}>
                  {order.customer_phone} • {order.customer_address}
                </div>
              </div>
              <select
                className={styles.statusSelect}
                value={order.status}
                onChange={(e) => updateStatus(order.id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            <div className={styles.orderMeta}>
              <div className={styles.orderMetaItem}>
                <span>Order ID:</span>
                <span>{order.id}</span>
              </div>
              <div className={styles.orderMetaItem}>
                <span>Date:</span>
                <span>
                  {new Date(order.created_at || "").toLocaleDateString()}
                </span>
              </div>
              <div className={styles.orderMetaItem}>
                <span>bKash TrxID:</span>
                <span>{order.bkash_trxid}</span>
              </div>
            </div>

            <div className={styles.orderItems}>
              <div className={styles.itemsList}>
                {order.order_details.items.map((item, index) => (
                  <div key={index} className={styles.item}>
                    <div className={styles.itemInfo}>
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className={styles.itemImage}
                        />
                      )}
                      <div>
                        <div className={styles.itemName}>{item.name}</div>
                        <div className={styles.itemPrice}>
                          ৳{item.price.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className={styles.itemQuantity}>x{item.quantity}</div>
                  </div>
                ))}
              </div>

              <div className={styles.orderTotal}>
                <span className={styles.totalLabel}>Total:</span>
                <span className={styles.totalAmount}>
                  ৳{order.order_details.total.toFixed(2)}
                </span>
              </div>
            </div>

            {order.order_details.notes && (
              <div className={styles.orderMeta}>
                <div className={styles.orderMetaItem}>
                  <span>Notes:</span>
                  <span>{order.order_details.notes}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
