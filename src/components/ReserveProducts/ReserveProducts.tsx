import React, { useState, useEffect,  useRef } from "react";
import styles from "./ReserveProducts.module.css";
import { Product } from "../../models/Product";
import { Company } from "../../models/Company";
import { GetCompanyById } from "../../service/companiesService";
import { createOrder } from "../../service/orderService";
import { create } from "domain";
import { IOrder } from "../../models/Order";
import { useParams, useSearchParams  } from "react-router-dom";

// interface ReserveProductsProps {
//   companyId: string;
//   //onReserve: (productId: string) => void;
// }

const ReserveProducts: React.FC = () => {
  const { id } = useParams<{ id: string }>(); 
    const [searchParams] = useSearchParams();
  const highlightedProductId = searchParams.get("productId");

  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orderedProducts, setOrderedProducts] = useState<Product[]>([]);
    const productRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
    
  const handleReserve = (productId: string) => {
    setSelectedProduct(productId);
    onReserve(productId);
    alert(`Product with ID ${productId} reserved successfully!`);
  };


  useEffect(() => {
    const fetchCompany = async () => {
      try {
        if (!id) {
          console.error("Company ID is not provided.");
            return;
        }
        const company: Company = await GetCompanyById(id);
        setProducts(company.products);
        setCompany(company);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchCompany();
  }
    , [id]);

     useEffect(() => {
    if (highlightedProductId && productRefs.current[highlightedProductId]) {
      productRefs.current[highlightedProductId]?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [products, highlightedProductId]);

  const shareProduct = (product: Product) => {
    const url = `${window.location.origin}/ReserveProducts/${id}?productId=${product._id}`;
    const text = `Check out this product:\n${product.name}\n${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, "_blank");
  };

  const copyLinkToClipboard = (product: Product) => {
    const url = `${window.location.origin}/ReserveProducts/${id}?productId=${product._id}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        alert("Link copied to clipboard!");
      })
      .catch(() => {
        alert("Failed to copy link.");
      });
  };


    const pushToOrderedProducts = (product: Product) => {
        setOrderedProducts((prev) => [...prev, product]);
    }

    const onReserve = async (productId: string) => {
      try {
        if (!company) {
          console.error("Company data is not loaded.");
          return;
        }
    
        const selectedProduct = products.find((product) => product._id === productId);
    
        if (!selectedProduct) {
          console.error("Product not found.");
          return;
        }
    
        // Obtener los datos existentes en localStorage
        const storedData = JSON.parse(localStorage.getItem("products") || "[]");

        if (!Array.isArray(storedData)) {
          console.error("Invalid data format in localStorage. Expected an array.");
          return;
        }

        // Buscar si ya existe una entrada para esta empresa
        const companyEntry = storedData.find((entry: any) => entry.companyId === company._id);

        if (companyEntry) {
          // Si ya existe, añadir el producto a la lista de productos
          const existingProduct = companyEntry.products.find((p: any) => p._id === selectedProduct._id);
          if (existingProduct) {
            existingProduct.quantity += 1;
          } else {
            companyEntry.products.push({ ...selectedProduct, quantity: 1 });
          }
        } else {
          // Si no existe, crear una nueva entrada para esta empresa
          storedData.push({
            companyId: company._id,
            products: [{ ...selectedProduct, quantity: 1 }],
          });
        }

        // Guardar los datos actualizados en localStorage
        localStorage.setItem("products", JSON.stringify(storedData));

        alert(`Product ${selectedProduct.name} added to cart!`);
      } catch (error) {
        console.error("Error adding product to cart:", error);
        alert("Failed to add the product to the cart. Please try again.");
      }
    };

  if (!company) {
    return <div>Loading...</div>;
  }
  return (
    <div className={styles.reserveWrapper}>
      <h1 className={styles.title}>Reserve Products from {company.name}</h1>
      <div className={styles.productsContainer}>
        {products.map((product) => (
          <div
            key={product._id}
            ref={(el) => {
              productRefs.current[product._id] = el;
            }}
            className={`${styles.productCard} ${
              product._id === highlightedProductId ? styles.highlighted : ""
            }`}
          >
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p>
              <strong>Price:</strong> {product.price}€
            </p>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                marginTop: "12px",
              }}
            >
              <button
                className={styles.reserveButton}
                onClick={() => handleReserve(product._id)}
                disabled={!product.available}
              >
                {product.available ? "Reserve" : "Not Available"}
              </button>

              <button
                onClick={() => shareProduct(product)}
                style={{
                  width: "100%",
                  backgroundColor: "#25D366",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Share via WhatsApp
              </button>

              <button
                onClick={() => copyLinkToClipboard(product)}
                style={{
                  width: "100%",
                  backgroundColor: "#6366f1",
                  color: "white",
                  border: "none",
                  padding: "10px 15px",
                  borderRadius: "5px",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Copy Link
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReserveProducts;