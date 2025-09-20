import React from "react";
import styles from "./ProductsDisplay.module.css";

interface Product {
  _id: string; // Recomanat per evitar usar index com a key
  name: string;
  price: number;
  description?: string;
}

interface ProductsDisplayProps {
  products: Product[];
}

const ProductsDisplay: React.FC<ProductsDisplayProps> = ({ products }) => {
  if (!products || products.length === 0) {
    return (
      <div className={styles.productsContainer}>
        <p className={styles.noProducts}>No hay productos disponibles.</p>
      </div>
    );
  }

  return (
    <div className={styles.productsContainer}>
      <h3 className={styles.title}>Productos</h3>
      <ul className={styles.productList}>
        {products.map((product) => (
          <li key={product._id} className={styles.productItem}>
            <div className={styles.productHeader}>
              <strong className={styles.productName}>
                {product.name  || "Producto sin nombre"}
              </strong>
              <span className={styles.productPrice}>
                ${product.price?.toFixed(2) ?? "0.00"}
              </span>
            </div>
            {product.description && (
              <p className={styles.productDescription}>{product.description}</p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductsDisplay;
