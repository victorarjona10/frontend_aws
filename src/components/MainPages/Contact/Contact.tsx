import React, { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Contact.module.css';
import { sendFeedback, FeedbackType } from '../../../service/contactService';

interface FormState {
  title: string;
  message: string;
  type: FeedbackType;
  rating?: number;
}

interface FormErrors {
  title?: string;
  message?: string;
  type?: string;
  rating?: string;
}

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const formSectionRef = useRef<HTMLDivElement>(null);
  const [inViewport, setInViewport] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState<FormState>({
    title: '',
    message: '',
    type: 'suggestion',
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState<FormErrors>({});

  // Estado para mensajes de feedback
  const [submitStatus, setSubmitStatus] = useState<{
    message: string;
    isError: boolean;
  } | null>(null);

  // Estado para indicar si el formulario está enviándose
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      setSubmitStatus({
        message: 'Debes iniciar sesión para enviar feedback.',
        isError: true,
      });
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInViewport(entry.isIntersecting);
      },
      { threshold: 0.1 },
    );

    if (formSectionRef.current) {
      observer.observe(formSectionRef.current);
    }

    return () => {
      if (formSectionRef.current) {
        observer.unobserve(formSectionRef.current);
      }
    };
  }, []);

  // Maneja cambios en los campos de texto del formulario
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpia el error específico cuando el usuario comienza a escribir
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  // Maneja cambios en el tipo de feedback
  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as FeedbackType;

    // Si el tipo no es 'rating', eliminamos el campo rating
    if (type !== 'rating') {
      const { ...rest } = formData;
      setFormData({ ...rest, type });
    } else {
      setFormData((prev) => ({
        ...prev,
        type,
        rating: prev.rating || 5,
      }));
    }
  };

  // Maneja cambios en el rating
  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rating = parseInt(e.target.value);
    setFormData((prev) => ({
      ...prev,
      rating,
    }));
  };

  // Valida el formulario
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validar título
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    }

    // Validar mensaje
    if (!formData.message.trim()) {
      newErrors.message = 'El mensaje es requerido';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'El mensaje debe tener al menos 10 caracteres';
    }

    // Validar rating si el tipo es 'rating'
    if (formData.type === 'rating') {
      if (!formData.rating) {
        newErrors.rating = 'La valoración es requerida';
      } else if (formData.rating < 1 || formData.rating > 5) {
        newErrors.rating = 'La valoración debe estar entre 1 y 5';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Maneja el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Resetea el estado de envío
    setSubmitStatus(null);

    // Comprueba si el usuario está autenticado
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');

    if (!token || !userId) {
      setSubmitStatus({
        message: 'Debes iniciar sesión para enviar feedback. Redirigiendo...',
        isError: true,
      });

      // Redirigir al login después de 2 segundos
      setTimeout(() => {
        navigate('/login');
      }, 2000);

      return;
    }

    // Valida el formulario
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await sendFeedback(formData);

      // Muestra mensaje de éxito
      setSubmitStatus({
        message: '¡Gracias por tu feedback! Lo hemos recibido correctamente.',
        isError: false,
      });

      // Resetea el formulario
      setFormData({
        title: '',
        message: '',
        type: 'suggestion',
      });
    } catch (e: any) {
      // Muestra mensaje de error
      setSubmitStatus({
        message:
          e.message ||
          'Ha ocurrido un error al enviar el feedback. Por favor, inténtalo de nuevo más tarde.',
        isError: true,
      });
      console.error('Error submitting form:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.contactContainer}>
      {/* Primera sección - Solo mensaje */}
      <section className={styles.topSection}>
        <div className={styles.contactHeaderBox}>
          <h1 className={styles.contactTitle}>¡Conectemos!</h1>
          <p className={styles.contactSubtitle}>
            Contáctanos para preguntas, comentarios u oportunidades de
            colaboración.
            <br />
            Estamos aquí para ayudarte a encontrar y conectar con los mejores
            servicios en tu ciudad.
          </p>
        </div>
        <div className={styles.scrollHint}>
          <span>Desplázate hacia abajo para ver más</span>
          <br />
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path
              d="M10 16L20 26L30 16"
              stroke="#bfc7d1"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </section>

      {/* Segunda sección - Formulario */}
      <section ref={formSectionRef} className={styles.formSection}>
        <div
          className={`${styles.formWrapper} ${inViewport ? styles.fadeIn : ''}`}>
          <h2 className={styles.formTitle}>Envíanos tu feedback</h2>

          {/* Mensaje de estado del envío */}
          {submitStatus && (
            <div
              className={`${styles.statusMessage} ${submitStatus.isError ? styles.errorMessage : styles.successMessage}`}>
              {submitStatus.message}
            </div>
          )}

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="type">Tipo de feedback</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                className={styles.selectField}>
                <option value="suggestion">Sugerencia</option>
                <option value="error">Reportar error</option>
                <option value="rating">Valoración</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="title">Título</label>
              <input
                type="text"
                id="title"
                name="title"
                placeholder="Título de tu feedback"
                value={formData.title}
                onChange={handleInputChange}
              />
              {errors.title && (
                <div className={styles.errorText}>{errors.title}</div>
              )}
            </div>

            {formData.type === 'rating' && (
              <div className={styles.formGroup}>
                <label htmlFor="rating">Valoración (1-5)</label>
                <div className={styles.ratingContainer}>
                  <input
                    type="range"
                    id="rating"
                    name="rating"
                    min="1"
                    max="5"
                    value={formData.rating || 5}
                    onChange={handleRatingChange}
                    className={styles.ratingSlider}
                  />
                  <span className={styles.ratingValue}>
                    {formData.rating || 5}
                  </span>
                </div>
                {errors.rating && (
                  <div className={styles.errorText}>{errors.rating}</div>
                )}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="message">Mensaje</label>
              <textarea
                id="message"
                name="message"
                placeholder="Escribe tu mensaje aquí"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}></textarea>
              {errors.message && (
                <div className={styles.errorText}>{errors.message}</div>
              )}
            </div>

            <button
              type="submit"
              className={styles.submitButton}
              disabled={isSubmitting}>
              {isSubmitting ? 'Enviando...' : 'Enviar feedback'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Contact;
