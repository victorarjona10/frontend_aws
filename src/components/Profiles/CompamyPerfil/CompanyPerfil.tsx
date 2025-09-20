import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import styles from "./CompanyPerfil.module.css";
import { Company } from "../../../models/Company";
import { GetCompanyById } from "../../../service/companiesService";
import MiniMapa from "../../Maps/MiniMapa/MiniMapa";
import StarRating from "../../StarRating/StarRating";
import { RateCompany } from "../../../service/companiesService";
import { IReview } from "../../../models/Review";
import { ReviewCompany } from "../../../service/companiesService";
import { getCompanyReviews } from "../../../service/companiesService";
import ReviewDisplay from "../../Displays/ReviewDisplay/ReviewDisplay";
import  ProductsDisplay from "../../Displays/ProductsDisplay/ProductsDisplay";
import ChatWindow from "../../ChatWindow/ChatWindow";

const CompanyPerfil: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Obtén el ID de la URL
  const [company, setCompany] = useState<Company | null>(null); // Datos originales de la compañía
  const [editedCompany, setEditedCompany] = useState<Company | null>(null); // Datos editados
//   const [isEditing, setIsEditing] = useState(false); // Estado de edición
  const [error, setError] = useState<string | null>(null); // Estado para manejar errores
  const [selectedTab, setSelectedTab] = useState<string>("products");

  const userId = localStorage.getItem("userId");
  const [reviews, setReviews] = useState<IReview[]>([]); // Estado para las reseñas

  
  
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

    const fetchRevies = async () => {
      try {
        const response = await getCompanyReviews(id || "");
        setReviews(response);
        console.log("Reseñas cargadas:", response);
      } catch (error) {
        console.error("Error al cargar las reseñas:", error);
        setError("No se pudieron cargar los datos de las reseñas.");
      }
    }
    fetchRevies();

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

  const renderTabContent = () => {
    switch (selectedTab) {
      
      case "products":
        return (
          <div className={styles.companyProducts}>
            
            {company.products && company.products.length > 0 ? (
              <div>
              <h1>Lista de Productos</h1>
              <ProductsDisplay products={company.products} />
            </div>
            ) : (
              <p>No hay productos disponibles.</p>
            )}
          </div>
        );
      case "photos":
        return (
          <div className={styles.companyPhotos}>
            <strong>Fotos:</strong>
            {company.photos && company.photos.length > 0 ? (
              <div className={styles.photoGallery}>
                {company.photos.map((photo, index) => (
                  <img key={index} src={photo} alt={`Foto ${index + 1}`} className={styles.companyPhoto} />
                ))}
              </div>
            ) : (
              <p>No hay fotos disponibles.</p>
            )}
          </div>
        );
      case "map":
        return (
          <div className={styles.companyMap}>
            <strong>Ubicación en el mapa:</strong>
            <MiniMapa
               lat={company.coordenates_lat}
               lng={company.coordenates_lng}
            />
          </div>
        );
        
      case "reviews":
        return (
          <div className={styles.companyReviews}>

            {company.reviews && company.reviews.length > 0 ? (
              <ul>
                <ReviewDisplay reviews={reviews} />
              </ul>
            ) : (
              <p>No hay reseñas disponibles.</p>
            )}
          </div>
        );

        case "Chats":
          return (
            <div className={styles.companyChats}>
              <ChatWindow companyId={company._id} companyName={company.name || ""} userId={userId || ""} senderId={userId || ""} receiverId={company._id}/>
            </div>
          );
      default:
        return null;
    }
  };
  return (
    <div className={styles.profilePage}>
      {/* Detalles de la compañía a la izquierda */}
      <div className={styles.details}>
        <img
          src={company.icon || "https://via.placeholder.com/150"}
          alt="Logo de la compañía"
          className={styles.companyAvatar}
        />
        <p><strong>ID:</strong> {company._id || 'No disponible'}</p>
        <div className={styles['perfil-divider']}></div>
        <h2 className={styles.companyName}>{company.name || "Nombre no disponible"}</h2>
        <div className={styles.companyRating}>
          <strong>Valoración:</strong>
          <div className={styles.stars}>
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`${styles.star} ${
                  index < Math.round(company.rating || 0) ? styles.filledStar : ""
                }`}
              >
                ★
              </span>
            ))}
          </div>
          <div className={styles.ratingDetails}>
            ({company.rating || "No disponible"} / {company.userRatingsTotal || 0} valoraciones)
          </div>
          
        </div>
        <span className={styles.starRatingContainer}>
          <StarRating onSubmit={handleRatingSubmit} userId= {userId || ""} companyId = {company._id} />
          </span>
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
          <strong>Seguidores:</strong> {company.followers || 0}
        </p>
      </div>

      {/* Pestañas en el centro */}
      <div className={styles.tabs}>
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
          className={`${styles.tabButton} ${selectedTab === "Chats" ? styles.active : ""}`}
          onClick={() => setSelectedTab("Chats")}
        >
          Chat
        </button>
      </div>

      {/* Contenido dinámico a la derecha */}
      <div className={styles.content}>{renderTabContent()}</div>
    </div>
  );
};

export default CompanyPerfil;