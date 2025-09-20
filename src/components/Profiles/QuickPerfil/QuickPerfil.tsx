import React, { useEffect, useRef } from 'react';
import styles from './QuickPerfil.module.css';
import { useNavigate } from 'react-router-dom';

interface QuickPerfilProps {
    user: {
        _id: string;
        name: string;
        email: string;
        avatar?: string;
        phone: string;
        description: string;
        
    };
    onClose: () => void; // Función para cerrar el desplegable
}



const QuickPerfil: React.FC<QuickPerfilProps> = ({ user, onClose }) => {
    const navigate = useNavigate();
    const perfilRef = useRef<HTMLDivElement>(null); // Ref para el contenedor del perfil


    console.log("Dades del perfil:", user);
    const handlePerfil = async () => {
            try {
            navigate('/perfil', { state: { user } });
            } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please check your credentials.');
            }
    };

    const handleLogout = () => {
        // Eliminar todos los datos del localStorage
        localStorage.clear();

        // Redirigir al usuario a la página de login
        navigate('/login');

        // Cerrar el desplegable después de cerrar sesión
        onClose();
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
          if (perfilRef.current && !perfilRef.current.contains(event.target as Node)) {
            console.log('Clicked outside the perfil!');
            onClose(); // Cierra el perfil si se hace clic fuera
          }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

        return (
      <div
        className={styles['quick-perfil-overlay']}
        onClick={onClose} // Detecta clics fuera del perfil
      >
        <div
          ref={perfilRef}
          className={styles['quick-perfil-container']}
          onClick={(e) => e.stopPropagation()} // Evita que los clics dentro del perfil cierren el componente
        >
          <button className={styles['close-button']} onClick={onClose}>
            X
          </button>
          <div className={styles['quick-perfil-header']}>
            <img
              src={user.avatar || 'https://via.placeholder.com/150'}
              alt="Avatar"
              className={styles['quick-perfil-avatar']}
            />
            <h2 className={styles['quick-perfil-name']}>{user.name || 'Nombre no disponible'}</h2>
            <p className={styles['quick-perfil-email']}>{user.email || 'Email no disponible'}</p>
          </div>
          <div className={styles['quick-perfil-actions']}>
            <button className={styles['action-button']} onClick={handlePerfil}>
              Perfil
            </button>
            <button className={styles['action-button']} onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>
    );
};

export default QuickPerfil;