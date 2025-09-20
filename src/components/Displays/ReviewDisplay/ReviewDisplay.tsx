import React from "react";
import styles from "./ReviewDisplay.module.css";
import { IReview } from "../../../models/Review";
import { useNavigate } from "react-router-dom";

interface ReviewDisplayProps {
  reviews: IReview[];
}

const ReviewDisplay: React.FC<ReviewDisplayProps> = ({ reviews }) => {
  const navigate = useNavigate();

  if (!reviews || reviews.length === 0) {
    return (
      <div className={styles.reviewContainer}>
        <p className={styles.noReviews}>No hay reseñas disponibles.</p>
      </div>
    );
  }

  return (
    <div className={styles.reviewContainer}>
      <h3 className={styles.title}>Reseñas</h3>
      <ul className={styles.reviewList}>
        {reviews.map((review) => {
          const user =
            typeof review.user_id === "string"
              ? null
              : review.user_id;

          return (
            <li key={review._id} className={styles.reviewItem}>
              <div className={styles.reviewHeader}>
                <strong className={styles.userId}>
                  {user ? (
                    <span
                      onClick={() => navigate(`/perfilExterno/${user._id}`)}
                      style={{ cursor: "pointer", textDecoration: "underline" }}
                    >
                      {user.name}
                    </span>
                  ) : (
                    "Usuario desconocido"
                  )}
                </strong>
                <span className={styles.rating}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <span
                      key={i}
                      className={`${styles.star} ${
                        i < review.rating ? styles.filledStar : ""
                      }`}
                    >
                      ★
                    </span>
                  ))}
                </span>
              </div>
              <p className={styles.reviewText}>
                {review.description || "Sin descripción"}
              </p>
              <p className={styles.date}>
                {new Date(review.date).toLocaleDateString()}
              </p>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ReviewDisplay;
