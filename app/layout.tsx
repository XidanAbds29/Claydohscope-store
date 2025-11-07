import type { Metadata } from "next";
import "./globals.css";
import Header from "../components/Header";
import CartProvider from "../components/CartProvider";

export const metadata: Metadata = {
  title: "Claydohscope",
  description: "Handmade clay cuteness — small batch clay creations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="container">{children}</main>
        </CartProvider>
      </body>
    </html>
  );
}
