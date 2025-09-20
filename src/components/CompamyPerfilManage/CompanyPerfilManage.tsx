import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./CompanyPerfilManage.module.css";
import { Company } from "../../models/Company";
import { AddProductToCompany, GetCompanyById, GetPendingOrders, updateCompanyPhotos } from "../../service/companiesService";
import MiniMapa from "../Maps/MiniMapa/MiniMapa";
import { IReview } from "../../models/Review";
import { ReviewCompany } from "../../service/companiesService";
import { getCompanyReviews } from "../../service/companiesService";
import ReviewDisplay from "../Displays/ReviewDisplay/ReviewDisplay";
import { GetAllCompanyOrders, updateOrderStatus } from "../../service/orderService";
import { IProduct } from "../../models/Product";
import { CreateProduct } from "../../service/companiesService";
import Cloudinary from "../Cloudinary/Cloudinary";
import { Order, IOrder } from "../../models/Order";
import { updateProduct } from "../../service/productService";
import { getFollowersCompanies } from "../../service/companiesService";
import ChatDisplays from "../Displays/ChatDisplay/ChatDisplay";


const CompanyPerfilManage: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtén el ID de la URL
  const [company, setCompany] = useState<Company | null>(null); // Datos originales de la compañía
  const [editedCompany, setEditedCompany] = useState<Company | null>(null); // Datos editados
  //   const [isEditing, setIsEditing] = useState(false); // Estado de edición
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [selectedTab, setSelectedTab] = useState<string>("products");
  const [orders, setOrders] = useState<IOrder[]>([]); // Estado para las reseñas
  const userId = localStorage.getItem("userId");
  const [reviews, setReviews] = useState<IReview[]>([]); // Estado para las reseñas
  const [showProductForm, setShowProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState<IProduct>({ name: "", description: "", price: 0, companyId: company?._id || "" });
  const [Error, setProductError] = useState<string | null>(null);
  const [Success, setProductSuccess] = useState<string | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]); // Estado para las reseñas
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editProductData, setEditProductData] = useState<IProduct | null>(null);
  const [showPhotoUpload, setShowPhotoUpload] = useState(false);
  const [followers, setFollowers] = useState<any[]>([]); // Nuevo estado para followers




  useEffect(() => {
    if (!userId) {
      console.error("El ID del usuario no está disponible en localStorage.");
      setError("No se pudo cargar el ID del usuario.");
      return;
    }
    const fetchCompany = async () => {
      try {
        const response = await GetCompanyById(id || "");
        setCompany(response);
        console.log("Compañía cargada:", response);
      } catch (error) {
        console.error("Error al cargar la compañía:", error);
        setError("No se pudieron cargar los datos de la compañía.");
      }
    };

    const fetchPendingOrders = async () => {
      try {
        const response = await GetPendingOrders(id || "");
        setPendingOrders(response);
        console.log("Órdenes pendientes cargadas:", response);
      } catch (error) {
        console.error("Error al cargar las órdenes pendientes:", error);
        setError("No se pudieron cargar los datos de las órdenes.");
      }
    }

    const fetchRevies = async () => {
      try {
        const response = await getCompanyReviews(id || "");
        setReviews(response);
        console.log("Reseñas cargadas:", response);
      } catch (error) {
        console.error("Error al cargar las reseñas:", error);
        setError("No se pudieron cargar los datos de las reseñas.");
      }
    };

    const fetchOrders = async () => {
      try {
        const response = await GetAllCompanyOrders(id || "");
        setOrders(response as unknown as IOrder[]);
        //console.log("Reseñas cargadas:", response);

        
      } catch (error) {
        console.error("Error al cargar las reseñas:", error);
        setError("No se pudieron cargar los datos de las reseñas.");
      }
      
    };

    // ...existing code...
    const fetchFollowers = async () => {
      try {
        const response = await getFollowersCompanies(id || "");
        console.log("Followers cargados:", response);
        setFollowers(response);

      } catch (error) {
        console.error("Error al cargar los seguidores:", error);
      }
    };

    fetchOrders();
    fetchPendingOrders();
    fetchRevies();
    fetchFollowers();
    fetchCompany();
  }, [id]);

  //   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
  //     const { name, value } = e.target;
  //     setEditedCompany((prev) => (prev ? { ...prev, [name]: value } : null));
  //   };

  //   const handleSave = () => {
  //     // Aquí puedes implementar la lógica para guardar los cambios en el backend
  //     console.log("Datos guardados:", editedCompany);
  //     setCompany(editedCompany); // Actualiza los datos originales con los editados
  //     setIsEditing(false);
  //   };

  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

  if (!company) {
    return <p>Cargando datos de la compañía...</p>;
  }

  const handleRatingSubmit = async (review: IReview) => {
    try {
      console.log("Reseña enviada:", review);
      const response = await ReviewCompany(review);
      console.log("Reseña enviada:", response);
      alert("¡Gracias por tu reseña!");
    } catch (error) {
      console.error("Error al enviar la reseña:", error);
      alert("Hubo un error al enviar tu reseña.");
    }
  };

  const handleProductChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({ ...prev, [name]: value }));
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductError(null);
    setProductSuccess(null);

    if (!newProduct.name || !newProduct.description || !newProduct.price) {
      setProductError("Todos los campos son obligatorios.");
      return;
    }

    try {
      newProduct.companyId = company._id;
      console.log("Nuevo producto:", newProduct);
      await CreateProduct(newProduct);
      setProductSuccess("Producto creado correctamente.");
      setNewProduct({ name: "", description: "", price: 0, companyId: company._id });
      setShowProductForm(false);
      // Recarga los productos
      const response = await GetCompanyById(company._id);
      setCompany(response);
    } catch (error: any) {
      setProductError(error.message || "Error al crear el producto.");
    }
  };

  const renderTabContent = () => {
    switch (selectedTab) {
      case "details":
        console.log("Detalles de la compañía:", company.icon);
        return (
          <div>
            <Cloudinary initialImage={company.icon} userEmail={company.email} model="company" />
            <h2 className={styles.companyName}>{company.name || "Nombre no disponible"}</h2>
            <p className={styles.companyDescription}>
              <strong>Descripción:</strong> {company.description || "No disponible"}
            </p>
            <p className={styles.companyEmail}>
              <strong>Email:</strong> {company.email || "No disponible"}
            </p>
            <p className={styles.companyPhone}>
              <strong>Teléfono:</strong> {company.phone || "No disponible"}
            </p>
            <p className={styles.companyLocation}>
              <strong>Ubicación:</strong> {company.location || "No disponible"}
            </p>

            <p className={styles.companyFollowers}>
              <strong>Seguidores:</strong> {followers.length}
            </p>
            {followers.length > 0 && (
              <ul className={styles.followersList}>
                {followers.map((follower) => (
                  <li key={follower._id} className={styles.followerItem}>
                    <img
                      src={follower.avatar || "https://via.placeholder.com/40"}
                      alt={follower.name}
                      className={styles.followerAvatar}
                      width={40}
                      height={40}
                    />
                    <span className={styles.followerName}>{follower.name}</span>
                    <span className={styles.followerEmail}>{follower.email}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      case "products":
        return (
          <div className={styles.companyProducts}>
            <button
              className={styles.createProductButton}
              onClick={() => setShowProductForm((prev) => !prev)}
            >
              {showProductForm ? "Cancelar" : "Crear nuevo producto"}
            </button>
            {showProductForm && (
              <form onSubmit={handleProductSubmit} className={styles.productForm}>
                <input
                  type="text"
                  name="name"
                  placeholder="Nombre"
                  value={newProduct.name}
                  onChange={handleProductChange}
                  required
                />
                <textarea
                  name="description"
                  placeholder="Descripción"
                  value={newProduct.description}
                  onChange={handleProductChange}
                  required
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Precio"
                  value={newProduct.price}
                  onChange={handleProductChange}
                  required
                  min="0"
                  step="any"
                />
                <button className={styles.createProductButton}>Crear producto</button>
                {Error && <div className={styles.error}>{Error}</div>}
                {Success && <div className={styles.success}>{Success}</div>}
              </form>
            )}
            {company.products && company.products.length > 0 ? (
              <div>
                <h1 className={styles.title}>Lista de Productos</h1>
                {company.products.map((product) => (
                  <div key={product._id} className={styles.productItem}>
                    {editingProductId === product._id ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          // Llama a tu servicio para actualizar el producto aquí
                          if (editProductData && editProductData._id) {
                            await updateProduct(editProductData._id.toString(), editProductData); // Debes implementar esta función
                            setEditingProductId(null);
                            // Recarga productos si es necesario
                          }
                          else {
                            console.error("No se puede actualizar el producto, ID no disponible.");
                          }
                        }}
                        className={styles.editProductForm}
                      >
                        <input
                          type="text"
                          name="name"
                          value={editProductData?.name || ""}
                          onChange={e => setEditProductData(prev => prev ? { ...prev, name: e.target.value } : prev)}
                          placeholder="Nombre"
                          required
                        />
                        <input
                          type="number"
                          name="price"
                          value={editProductData?.price || ""}
                          onChange={e => setEditProductData(prev => prev ? { ...prev, price: Number(e.target.value) } : prev)}
                          placeholder="Precio"
                          required
                        />
                        <input
                          type="number"
                          name="stock"
                          value={editProductData?.stock || ""}
                          onChange={e => setEditProductData(prev => prev ? { ...prev, stock: Number(e.target.value) } : prev)}
                          placeholder="Stock"
                        />
                        <input
                          type="text"
                          name="category"
                          value={editProductData?.category || ""}
                          onChange={e => setEditProductData(prev => prev ? { ...prev, category: e.target.value } : prev)}
                          placeholder="Categoría"
                        />
                        <input
                          type="text"
                          name="image"
                          value={editProductData?.image || ""}
                          onChange={e => setEditProductData(prev => prev ? { ...prev, image: e.target.value } : prev)}
                          placeholder="URL Imagen"
                        />
                        <textarea
                          name="description"
                          value={editProductData?.description || ""}
                          onChange={e => setEditProductData(prev => prev ? { ...prev, description: e.target.value } : prev)}
                          placeholder="Descripción"
                        />
                        <label>
                          Disponible:
                          <input
                            type="checkbox"
                            checked={editProductData?.available || false}
                            onChange={e => setEditProductData(prev => prev ? { ...prev, available: e.target.checked } : prev)}
                          />
                        </label>
                        <button type="submit">Guardar</button>
                        <button type="button" onClick={() => setEditingProductId(null)}>Cancelar</button>
                      </form>
                    ) : (
                      <div className={styles.productInfoRow}>
                        <img
                          src={product.image || "https://via.placeholder.com/80"}
                          alt={product.name}
                          className={styles.productAvatar}
                        />
                        <div className={styles.productDetails}>
                          <p className={styles.productName}><strong>{product.name}</strong></p>
                          <p className={styles.productPrice}>💶 <strong>{product.price} €</strong></p>
                          <p className={styles.productStock}>Stock: <strong>{product.stock ?? 0}</strong></p>
                          <div className={styles.productRating}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < (product.rating ?? 0) ? styles.filledStar : styles.emptyStar}>★</span>
                            ))}
                          </div>
                        </div>
                        <button
                          className={styles.editButton}
                          onClick={() => {
                            setEditingProductId(product._id);
                            setEditProductData(product);
                          }}
                        >
                          Editar
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p>No hay productos disponibles.</p>
            )}
          </div>
        );
      case "photos":
        return (
          <div style={{ position: "relative" }}>
            <div className={styles.photoGalleryGrid}>
              {company.photos && company.photos.length > 0 ? (
                company.photos.map((url, idx) => (
                  <div key={idx} className={styles.photoGalleryItem}>
                    <img src={url} alt={`Foto ${idx + 1}`} className={styles.galleryPhoto} />
                    <button
                      className={styles.deletePhotoButton}
                      onClick={async () => {
                        // Lógica para eliminar la foto
                        const updatedPhotos = (company.photos ?? []).filter((_, i) => i !== idx);
                        // Aquí deberías llamar a tu servicio backend para actualizar las fotos de la empresa
                        await updateCompanyPhotos(company._id, updatedPhotos);
                        // Recarga la empresa para actualizar la galería
                        const updated = await GetCompanyById(company._id);
                        setCompany(updated);
                      }}
                      title="Eliminar foto"
                      type="button"
                    >
                      ×
                    </button>
                  </div>
                ))
              ) : (
                <p>No hay fotos subidas aún.</p>
              )}
            </div>
            <button
              className={styles.fabUploadPhoto}
              onClick={() => setShowPhotoUpload(true)}
              title="Subir foto"
            >
              +
            </button>
            {showPhotoUpload && (
              <Cloudinary
                userEmail={company._id}
                model="companyphoto"
                onImageUploaded={async (url) => {
                  // Recarga las fotos de la empresa tras subir
                  const updated = await GetCompanyById(company._id);
                  setCompany(updated);
                  setShowPhotoUpload(false);
                }}
              />
            )}
          </div>
        );
      case "map":
        return (
          <div className={styles.companyMap}>
            <strong>Ubicación en el mapaaa:</strong>
            <MiniMapa
              lat={company.coordenates_lat}
              lng={company.coordenates_lng}
            />
          </div>
        );
      case "followers":
        return (<div className={styles.companyMap}>
          <strong>Ubicación en el mapaaa:</strong>
          <MiniMapa
            lat={company.coordenates_lat}
            lng={company.coordenates_lng}
          />
        </div>);
      case "reviews":
        return (
          <div className={styles.companyReviews}>
            <strong>Reseñas:</strong>
            {company.reviews && company.reviews.length > 0 ? (
              <ul>
                <ReviewDisplay reviews={reviews} />
              </ul>
            ) : (
              <p>No hay reseñas disponibles.</p>
            )}
          </div>
        );
      case "orders":
        return (
          <div className={styles.companyOrders}>
            <h3>Órdenes Pendientes</h3>
            {pendingOrders.filter(order => order.status === "Pendiente").length > 0 ? (
              <ul>
                {pendingOrders
                  .filter(order => order.status === "Pendiente")
                  .map((order, index) => (
                    <li key={order._id || index} className={styles.orderItem}>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString()
                          : "Sin fecha"}
                      </p>
                      <p>
                        <strong>Usuario:</strong> {order.user_id}
                      </p>
                      <p>
                        <strong>Estado:</strong> {order.status}
                      </p>
                      <div>
                        <strong>Productos:</strong>
                        <ul>
                          {order.products.map((prod, idx) => {
                            // Busca el producto en la lista de productos de la empresa
                            const productInfo = company.products?.find(
                              (p) => p._id === prod.product_id
                            );
                            return (
                              <li key={prod.product_id + idx}>
                                {productInfo ? (
                                  <>
                                    <span>
                                      <strong>{productInfo.name}</strong>
                                    </span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                    {" | "}
                                    <span>Precio unitario: {productInfo.price} €</span>
                                    {" | "}
                                    <span>
                                      Subtotal: {Number(productInfo.price) * Number(prod.quantity)} €
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>Producto ID: {prod.product_id}</span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <p>
                          <strong>Total orden: </strong>
                          {order.products
                            .map((prod) => {
                              const productInfo = company.products?.find(
                                (p) => p._id === prod.product_id
                              );
                              return productInfo
                                ? Number(productInfo.price) * Number(prod.quantity)
                                : 0;
                            })
                            .reduce((acc, curr) => acc + curr, 0)}{" "}
                          €
                        </p>
                      </div>
                      <div>
                        <button
                          className={styles.orderActionButton}
                          onClick={async () => {
                            if (order._id) {
                              await updateOrderStatus(order._id.toString(), "Procesando");
                              const updated = await GetPendingOrders(company._id);
                              setPendingOrders(updated);
                            }
                          }}
                        >
                          Pasar a Procesando
                        </button>
                        <button
                          className={styles.orderActionButton}
                          style={{ background: "#ef4444", marginLeft: 8 }}
                          onClick={async () => {
                            if (order._id) {
                              await updateOrderStatus(order._id.toString(), "Rechazada");
                              const updated = await GetPendingOrders(company._id);
                              setPendingOrders(updated);
                            }
                          }}
                        >
                          Rechazar
                        </button>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No hay órdenes pendientes.</p>
            )}

            <h3>Órdenes Procesando</h3>
            {pendingOrders.filter(order => order.status === "Procesando").length > 0 ? (
              <ul>
                {pendingOrders
                  .filter(order => order.status === "Procesando")
                  .map((order, index) => (
                    <li key={order._id || index} className={styles.orderItem}>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString()
                          : "Sin fecha"}
                      </p>
                      <p>
                        <strong>Usuario:</strong> {order.user_id}
                      </p>
                      <p>
                        <strong>Estado:</strong> {order.status}
                      </p>
                      <div>
                        <strong>Productos:</strong>
                        <ul>
                          {order.products.map((prod, idx) => {
                            // Busca el producto en la lista de productos de la empresa
                            const productInfo = company.products?.find(
                              (p) => p._id === prod.product_id
                            );
                            return (
                              <li key={prod.product_id + idx}>
                                {productInfo ? (
                                  <>
                                    <span>
                                      <strong>{productInfo.name}</strong>
                                    </span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                    {" | "}
                                    <span>Precio unitario: {productInfo.price} €</span>
                                    {" | "}
                                    <span>
                                      Subtotal: {Number(productInfo.price) * Number(prod.quantity)} €
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>Producto ID: {prod.product_id}</span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <p>
                          <strong>Total orden: </strong>
                          {order.products
                            .map((prod) => {
                              const productInfo = company.products?.find(
                                (p) => p._id === prod.product_id
                              );
                              return productInfo
                                ? Number(productInfo.price) * Number(prod.quantity)
                                : 0;
                            })
                            .reduce((acc, curr) => acc + curr, 0)}{" "}
                          €
                        </p>
                      </div>
                      <button
                        className={styles.orderActionButton}
                        onClick={async () => {
                          if (order._id) {
                            await updateOrderStatus(order._id.toString(), "Finalizada");
                            const updated = await GetPendingOrders(company._id);
                            setPendingOrders(updated);
                          }
                        }}
                      >
                        Pasar a Finalizada
                      </button>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No hay órdenes procesando.</p>
            )}

            <h3>Órdenes Finalizadas</h3>
            {pendingOrders.filter(order => order.status === "Finalizada").length > 0 ? (
              <ul>
                {pendingOrders
                  .filter(order => order.status === "Finalizada")
                  .map((order, index) => (
                    <li key={order._id || index} className={styles.orderItem}>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString()
                          : "Sin fecha"}
                      </p>
                      <p>
                        <strong>Usuario:</strong> {order.user_id}
                      </p>
                      <p>
                        <strong>Estado:</strong> {order.status}
                      </p>
                      <div>
                        <strong>Productos:</strong>
                        <ul>
                          {order.products.map((prod, idx) => {
                            // Busca el producto en la lista de productos de la empresa
                            const productInfo = company.products?.find(
                              (p) => p._id === prod.product_id
                            );
                            return (
                              <li key={prod.product_id + idx}>
                                {productInfo ? (
                                  <>
                                    <span>
                                      <strong>{productInfo.name}</strong>
                                    </span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                    {" | "}
                                    <span>Precio unitario: {productInfo.price} €</span>
                                    {" | "}
                                    <span>
                                      Subtotal: {Number(productInfo.price) * Number(prod.quantity)} €
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>Producto ID: {prod.product_id}</span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <p>
                          <strong>Total orden: </strong>
                          {order.products
                            .map((prod) => {
                              const productInfo = company.products?.find(
                                (p) => p._id === prod.product_id
                              );
                              return productInfo
                                ? Number(productInfo.price) * Number(prod.quantity)
                                : 0;
                            })
                            .reduce((acc, curr) => acc + curr, 0)}{" "}
                          €
                        </p>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No hay órdenes finalizadas.</p>
            )}

            <h3>Órdenes Rechazadas</h3>
            {pendingOrders.filter(order => order.status === "Rechazada").length > 0 ? (
              <ul>
                {pendingOrders
                  .filter(order => order.status === "Rechazada")
                  .map((order, index) => (
                    <li key={order._id || index} className={styles.orderItem}>
                      <p>
                        <strong>Fecha:</strong>{" "}
                        {order.orderDate
                          ? new Date(order.orderDate).toLocaleString()
                          : "Sin fecha"}
                      </p>
                      <p>
                        <strong>Usuario:</strong> {order.user_id}
                      </p>
                      <p>
                        <strong>Estado:</strong> {order.status}
                      </p>
                      <div>
                        <strong>Productos:</strong>
                        <ul>
                          {order.products.map((prod, idx) => {
                            // Busca el producto en la lista de productos de la empresa
                            const productInfo = company.products?.find(
                              (p) => p._id === prod.product_id
                            );
                            return (
                              <li key={prod.product_id + idx}>
                                {productInfo ? (
                                  <>
                                    <span>
                                      <strong>{productInfo.name}</strong>
                                    </span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                    {" | "}
                                    <span>Precio unitario: {productInfo.price} €</span>
                                    {" | "}
                                    <span>
                                      Subtotal: {Number(productInfo.price) * Number(prod.quantity)} €
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <span>Producto ID: {prod.product_id}</span>
                                    {" | "}
                                    <span>Cantidad: {prod.quantity}</span>
                                  </>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                        <p>
                          <strong>Total orden: </strong>
                          {order.products
                            .map((prod) => {
                              const productInfo = company.products?.find(
                                (p) => p._id === prod.product_id
                              );
                              return productInfo
                                ? Number(productInfo.price) * Number(prod.quantity)
                                : 0;
                            })
                            .reduce((acc, curr) => acc + curr, 0)}{" "}
                          €
                        </p>
                      </div>
                      <button
                        className={styles.orderActionButton}
                        onClick={async () => {
                          if (order._id) {
                            await updateOrderStatus(order._id.toString(), "Pendiente");
                            const updated = await GetPendingOrders(company._id);
                            setPendingOrders(updated);
                          }
                        }}
                      >
                        Retomar Orden
                      </button>
                    </li>
                  ))}
              </ul>
            ) : (
              <p>No hay órdenes procesando.</p>
            )}

          </div>
        );
        case "Chats":
        return (
          <ChatDisplays companies={followers} companyId={company._id}></ChatDisplays>
 
        );
      default:
        return null;
    }
  };
  return (
  <div className={styles.profilePageUnified}>
    {/* PESTAÑAS FIJAS ARRIBA */}
    <div className={styles.tabsNav}>
      <button
        className={`${styles.tabButton} ${selectedTab === "details" ? styles.active : ""}`}
        onClick={() => setSelectedTab("details")}
      >
        Detalles
      </button>
      <button
        className={`${styles.tabButton} ${selectedTab === "products" ? styles.active : ""}`}
        onClick={() => setSelectedTab("products")}
      >
        Productos
      </button>
      <button
        className={`${styles.tabButton} ${selectedTab === "photos" ? styles.active : ""}`}
        onClick={() => setSelectedTab("photos")}
      >
        Fotos
      </button>
      <button
        className={`${styles.tabButton} ${selectedTab === "map" ? styles.active : ""}`}
        onClick={() => setSelectedTab("map")}
      >
        Mapa
      </button>
      <button
        className={`${styles.tabButton} ${selectedTab === "reviews" ? styles.active : ""}`}
        onClick={() => setSelectedTab("reviews")}
      >
        Reseñas
      </button>
      <button
        className={`${styles.tabButton} ${selectedTab === "orders" ? styles.active : ""}`}
        onClick={() => setSelectedTab("orders")}
      >
        Orders
      </button>

      <button
        className={`${styles.tabButton} ${selectedTab === "Chats" ? styles.active : ""}`}
        onClick={() => setSelectedTab("Chats")}
      >
        Chats
      </button>
    </div>

      {/* CONTENIDO DE LA PESTAÑA SELECCIONADA */}
      <div className={styles.tabContentUnified}>
        {renderTabContent()}
      </div>
    </div>
  );
};

export default CompanyPerfilManage;
