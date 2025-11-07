import styles from "./product-card.module.css";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({
  product,
  onAddToCart,
}: ProductCardProps) {
  const { name, description, price, image } = product;
  const formatPrice = (v: number) => {
    try {
      // Use Intl to format local currency; fallback to BDT symbol if not available
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
    <article className={styles.card}>
      <div className={styles.imageContainer}>
        <img
          src={image || "https://via.placeholder.com/400"}
          alt={name}
          className={styles.image}
          loading="lazy"
        />
        <div className={styles.priceBadge}>
          <data value={price}>{formatPrice(price)}</data>
        </div>
      </div>

      <div className={styles.content}>
        <h2 className={styles.title}>{name}</h2>
        <p className={styles.description}>{description}</p>

        <div className={styles.footer}>
          <div className={styles.price}>
            <data value={price}>{formatPrice(price)}</data>
          </div>
          <button
            onClick={() => onAddToCart(product)}
            className="btn btn--primary"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </article>
  );
}
