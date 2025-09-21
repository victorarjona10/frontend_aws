import axios from 'axios';

const api = axios.create({
  baseURL: 'http://edu:4000/api', // Base URL de tu API
});

let isRefreshing = false; // Lock para evitar múltiples solicitudes de refresh
let refreshSubscribers: ((token: string) => void)[] = []; // Lista de suscriptores para reintentar solicitudes

// Función para notificar a las solicitudes en espera
const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Interceptor para añadir el token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // Obtén el token del almacenamiento
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`; // Añade el token al encabezado
    }

    console.log(
      `To: ${config.baseURL}${config.url} | With Method: ${config.method?.toUpperCase()}`,
    );

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => {
    console.log(
      `Code: ${response.status} | Message: ${response.data.message || ''} }`,
    );
    return response;
  },
  async (error) => {
    if (error.response) {
      console.log(
        `Code: ${error.response.status} | Error: ${error.response.data.message || ''}`,
      );
      if (error.response.status !== 401) {
        return Promise.reject(error);
      }
    }
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken'); // Obtén el refresh token
      if (refreshToken) {
        if (!isRefreshing) {
          isRefreshing = true; // Activa el lock
          try {
            console.log(
              'Solicitando nuevo token con refresh token:',
              refreshToken,
            );
            const { data } = await axios.post(
              '/api/users/auth/refresh',
              {
                refreshToken,
              },
            );

            // Guarda el nuevo token en localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('refreshToken', data.refreshToken);

            // Notifica a las solicitudes en espera
            onRefreshed(data.token);

            isRefreshing = false; // Libera el lock
          } catch (refreshError) {
            console.error('Error al refrescar el token:', refreshError);
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login'; // Redirige al login
            isRefreshing = false; // Libera el lock
            return Promise.reject(refreshError);
          }
        }

        // Espera a que el token sea actualizado
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            originalRequest._retry = true; // Marca la solicitud como reintentada
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            resolve(api(originalRequest)); // Reintenta la solicitud original
          });
        });
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login'; // Redirige al login
      }
    }

    return Promise.reject(error);
  },
);

export default api;
