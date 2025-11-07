"use client";

import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";
import { useCart } from "../components/CartProvider";
import { playSuccess, playError } from "../components/sound";
import styles from "./page.module.css"; // This is our stylesheet

// Define the type for a Product
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

export default function Home() {
  // --- Component State ---
  const [products, setProducts] = useState<Product[]>([]);
  const { items: cart, addToCart, cartTotal, clearCart, showCheckout, closeCheckout } = useCart();

  // --- Form State ---
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [bkashTrxID, setBkashTrxID] = useState("");

  // --- UI State ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  // --- Fetch Products ---
  useEffect(() => {
    async function fetchProducts() {
      setIsFetching(true);
      const { data, error } = await supabase.from("products").select("*");

      if (error) {
        console.error("Error fetching products:", error);
      } else {
        setProducts(data as Product[]);
      }
      setIsFetching(false);
    }
    fetchProducts();
  }, []);

  // --- Cart Functions ---
  // addToCart provided by CartProvider (increments quantity if exists)

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

  // --- Checkout Function ---
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSuccess(false);

    const orderDetails = {
      items: cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: cartTotal,
    };

    const { error } = await supabase.from("orders").insert({
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_address: customerAddress,
      bkash_trxid: bkashTrxID,
      order_details: orderDetails,
      status: "pending",
    });

    setIsLoading(false);

    if (error) {
      playError();
      alert("Error placing order: " + error.message);
    } else {
  setIsSuccess(true);
  clearCart();
  setCustomerName("");
  setCustomerPhone("");
  setCustomerAddress("");
  setBkashTrxID("");
  closeCheckout();
      playSuccess();
    }
  };

  // --- JSX Render ---
  return (
    <main className={styles.main}>
      {/* ===== HEADER ===== */}
      <header className={styles.header}>
        <h1>
          Welcome to <span>Claydohscope</span>!
        </h1>
        <p>Your one-stop shop for cute clay creations ✨</p>
      </header>
      {/* NOTE: Cart bar removed from home page; header cart is used for checkout */}

      {/* ===== SUCCESS MESSAGE ===== */}
      {isSuccess && (
        <div className={styles.successMessage}>
          <strong>Order Placed!</strong> We will verify your payment and contact
          you soon.
        </div>
      )}

      {/* ===== CHECKOUT MODAL ===== */}
      {showCheckout && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <button
              onClick={() => closeCheckout()}
              className={styles.closeButton}
            >
              &times;
            </button>

            <h2 className={styles.modalHeader}>Complete Your Order</h2>

            <div className={styles.instructions}>
              <h3>Payment Instructions</h3>
              <ol className={styles.instructionsList}>
                <li>
                  Open your bKash App and select <strong>'Send Money'</strong>.
                </li>
                <li>
                  Enter our number:{" "}
                  <strong style={{ color: "#8B5E3C" }}>01998079515</strong>
                </li>
                <li>
                  Enter the total amount:{" "}
                  <strong style={{ color: "#8B5E3C" }}>
                    <data value={cartTotal}>{formatPrice(cartTotal)}</data>
                  </strong>
                </li>
                <li>
                  Copy the <strong>Transaction ID (TrxID)</strong> and paste it
                  below.
                </li>
              </ol>
            </div>

            <form onSubmit={handlePlaceOrder} className={styles.form}>
              <div>
                <label htmlFor="name" className={styles.formLabel}>
                  Full Name
                </label>
                <input
                  required
                  type="text"
                  id="name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label htmlFor="phone" className={styles.formLabel}>
                  Phone Number
                </label>
                <input
                  required
                  type="text"
                  id="phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label htmlFor="address" className={styles.formLabel}>
                  Shipping Address
                </label>
                <input
                  required
                  type="text"
                  id="address"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className={styles.formInput}
                />
              </div>
              <div>
                <label htmlFor="trxid" className={styles.formLabel}>
                  bKash Transaction ID (TrxID)
                </label>
                <input
                  required
                  type="text"
                  id="trxid"
                  value={bkashTrxID}
                  onChange={(e) => setBkashTrxID(e.target.value)}
                  className={styles.formInput}
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className={styles.submitButton}
                >
                  {isLoading
                    ? "Placing Order..."
                    : `Place Order (${formatPrice(cartTotal)})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== PRODUCT GRID ===== */}
      <div className={styles.productGrid}>
        {isFetching ? (
          <p style={{ textAlign: "center" }}>Loading cute things...</p>
        ) : (
          products.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productImageContainer}>
                <span className={styles.priceBadge}>
                  <data value={product.price}>
                    {formatPrice(product.price)}
                  </data>
                </span>
                <img
                  src={product.image || "https://via.placeholder.com/400"}
                  alt={product.name}
                  className={styles.productImage}
                />
              </div>

              <div className={styles.productInfo}>
                <h2>{product.name}</h2>
                <p>{product.description}</p>

                <div className={styles.productFooter}>
                  <p className={styles.price}>
                    <data value={product.price}>
                      {formatPrice(product.price)}
                    </data>
                  </p>
                  <button
                    onClick={() => addToCart(product)}
                    className={`btn-primary ${styles.cartButton}`}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
