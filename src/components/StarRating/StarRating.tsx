import React, { useState } from "react";
import styles from "./StarRating.module.css";
import { IReview } from "../../models/Review"; // Importa la interfaz IReview

interface StarRatingProps {
  onSubmit: (review: IReview) => void; // Función para manejar el envío de la reseña
  userId: string; // ID del usuario que envía la reseña
  companyId: string; // ID de la compañía que se está valorando
}

const StarRating: React.FC<StarRatingProps> = ({ onSubmit, userId, companyId }) => {
  const [rating, setRating] = useState<number>(0); // Calificación seleccionada
  const [hover, setHover] = useState<number>(0); // Calificación al pasar el mouse
  const [reviewText, setReviewText] = useState<string>(""); // Texto de la reseña
  const [isRating, setIsRating] = useState<boolean>(false); // Estado para mostrar las estrellas y el input

  const handleSubmit = () => {
    if (rating > 0 && reviewText.trim() !== "") {
      const review: IReview = {
        _id: "", 
        user_id: userId,
        company_id: companyId,
        rating,
        description: reviewText,
        date: new Date(),
      };
      onSubmit(review); // Llama a la función de envío con el objeto IReview
      resetForm();
    } else {
      alert("Por favor selecciona una calificación y escribe una reseña.");
    }
  };

  const resetForm = () => {
    setRating(0);
    setHover(0);
    setReviewText("");
    setIsRating(false);
  };

  return (
    <div className={styles.starRatingContainer}>
      {!isRating ? (
        <button
          onClick={() => setIsRating(true)}
          className={styles.startRatingButton}
        >
          Valorar
        </button>
      ) : (
        <div className={styles.starRating}>
          <div className={styles.stars}>
            {Array.from({ length: 5 }, (_, index) => (
              <span
                key={index}
                className={`${styles.star} ${
                  index < (hover || rating) ? styles.filledStar : ""
                }`}
                onClick={() => setRating(index + 1)} // Selecciona la calificación
                onMouseEnter={() => setHover(index + 1)} // Muestra el hover
                onMouseLeave={() => setHover(0)} // Quita el hover
              >
                ★
              </span>
            ))}
          </div>
          <textarea
            className={styles.reviewInput}
            placeholder="Escribe tu reseña aquí..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
          />
          <div className={styles.buttons}>
            <button onClick={handleSubmit} className={styles.submitButton}>
              Enviar Reseña
            </button>
            <button onClick={resetForm} className={styles.cancelButton}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StarRating;