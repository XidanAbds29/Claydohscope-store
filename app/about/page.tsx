export default function AboutPage() {
  return (
    <div style={{ padding: "2rem 0" }}>
      <h1 style={{ marginBottom: "1.5rem" }}>About Claydohscope</h1>
      <div style={{ maxWidth: 800 }}>
        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Welcome to Claydohscope! We specialize in creating unique, handcrafted
          clay products that bring joy and creativity to your everyday life.
          Each piece is carefully made with love and attention to detail.
        </p>

        <p
          style={{
            fontSize: "1.1rem",
            lineHeight: 1.6,
            marginBottom: "1.5rem",
          }}
        >
          Our mission is to share the beauty of handmade clay art while
          maintaining the highest quality standards. Every item in our
          collection is thoughtfully designed and meticulously crafted to ensure
          both beauty and durability.
        </p>

        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "var(--color-surface)",
            borderRadius: "12px",
          }}
        >
          <h2 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
            Contact Us
          </h2>
          <p style={{ color: "var(--color-text-light)" }}>
            Email: claydohscopeofficial@gmail.com
            <br />
            Instagram: claydohscope.co
          </p>
        </div>
      </div>
    </div>
  );
}
