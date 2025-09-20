import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, useLocation } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/Navbar/Navbar';
import {
  initializeSocket,
  authenticateSocket,
  disconnectSocket,
} from './service/notificationsService';
import { AccessibilityButton, AccessibilityFilters } from './components/Accessibility';


// Componente contenedor para usar useLocation
const AppContent = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const socketInitialized = useRef(false);

  // Verificar si el usuario está autenticado al cargar la aplicación
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      const wasAuthenticated = isAuthenticated;
      const isNowAuthenticated = !!token;

      setIsAuthenticated(isNowAuthenticated);

      // Si el usuario acaba de iniciar sesión (y el socket no está inicializado)
      if (isNowAuthenticated && userId && !socketInitialized.current) {
        console.log('Inicializando socket para usuario:', userId);
        initializeSocket();
        authenticateSocket(userId);
        socketInitialized.current = true;
      }
      // Si el usuario cerró sesión (y el socket estaba inicializado)
      else if (
        !isNowAuthenticated &&
        wasAuthenticated &&
        socketInitialized.current
      ) {
        console.log('Desconectando socket debido a cierre de sesión');
        disconnectSocket();
        socketInitialized.current = false;
      }
    };

    checkAuth();

    // Escuchar cambios en localStorage para actualizar el estado cuando se inicie o cierre sesión
    const handleStorageChange = () => {
      checkAuth();
    };

    window.addEventListener('storage', handleStorageChange);

    // También revisar el token cada vez que la ventana recibe el foco
    window.addEventListener('focus', checkAuth);

    // Desconectar socket al desmontar el componente
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', checkAuth);

      if (socketInitialized.current) {
        console.log('Desconectando socket al desmontar App');
        disconnectSocket();
        socketInitialized.current = false;
      }
    };
  }, [isAuthenticated]); // Dependencia para detectar cambios de autenticación

  // No mostrar Navbar en la página de login
  const isLoginPage =
    location.pathname === '/login' || location.pathname === '/';

  return (
    <>
      {isAuthenticated && !isLoginPage && <Navbar />}
      <AppRoutes />
    </>
  );
};

function App() {
  return (

    <Router>
      <AppContent />
      <AccessibilityFilters />
      <AccessibilityButton />
    </Router>

  );
}

export default App;
