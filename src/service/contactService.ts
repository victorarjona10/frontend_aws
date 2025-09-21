import axios from 'axios';

// Definición de tipos para el feedback
export type FeedbackType = 'error' | 'suggestion' | 'rating';

export interface FeedbackFormData {
  title: string;
  message: string;
  type: FeedbackType;
  rating?: number;
}

interface FeedbackRequest extends FeedbackFormData {
  user_id: string;
}

/**
 * Envía un feedback al servidor
 * @param formData Datos del formulario de feedback
 * @returns Respuesta del servidor
 */
export const sendFeedback = async (formData: FeedbackFormData) => {
  try {
    // Obtener el token JWT del localStorage
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error(
        'No hay sesión activa. Por favor, inicia sesión para enviar feedback.',
      );
    }

    // Obtener el ID del usuario del localStorage
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No se pudo obtener la información del usuario.');
    }

    // Preparar los datos del feedback
    const feedbackData: FeedbackRequest = {
      ...formData,
      user_id: userId,
    };

    // Enviar la petición al servidor
    const response = await axios.post(
      '/api/feedback',
      feedbackData,
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error('Error sending feedback:', error);
    throw error;
  }
};
