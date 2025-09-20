import React from 'react';
import { useNavigate } from 'react-router-dom';
import QuickPerfil from '../Profiles/QuickPerfil/QuickPerfil';
import styles from './Navbar.module.css';
import { useEffect, useRef } from 'react';
import { getUserById } from '../../service/userService';
import NotificationBell from '../Notifications/NotificationBell';
import { useTranslation } from 'react-i18next';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [showQuickPerfil, setShowQuickPerfil] = React.useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = React.useState<any>(null);

  const handleNavClick = (path: string) => {
    navigate(path);
  };

  const toggleQuickPerfil = () => {
    setShowQuickPerfil((prev) => !prev);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn('No user ID found. Redirecting to login...');
        navigate('/login');
        return;
      }

      try {
        const updatedUser = await getUserById(userId);
        setUser(updatedUser);
        console.log('User data fetched:', updatedUser);
      } catch (error) {
        console.error('Error fetching user data:', error);
        navigate('/login');
      }
    };

    fetchUser();
  }, [navigate]);

  const [menuOpen, setMenuOpen] = React.useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo */}
        <a href="#" className={styles.navLogo}>
          <img
            src="/quickfind_logo.png"
            className={styles.logoImage}
            alt="Logo"
          />
        </a>

        {/* Menú Hamburguesa */}
        <div
          className={styles.menuToggle}
          onClick={toggleMenu}
          role="button"
          aria-label="Toggle navigation menu">
          ☰
        </div>

        {/* Menú de navegación */}
        <div
          ref={menuRef}
          className={`${styles.navMenu} ${menuOpen ? styles.active : ''}`}>
          <ul className={styles.navLinks}>
            <li>
              <a
                href="#"
                className={styles.navLink}
                onClick={() => handleNavClick('/home')}>
                {t('navbar.home', 'Home')}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={styles.navLink}
                onClick={() => handleNavClick('/services')}>
                {t('navbar.services')}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={styles.navLink}
                onClick={() => handleNavClick('/contact')}>
                {t('navbar.contact')}
              </a>
            </li>
            <li>
              <button
                className={styles.cartButton}
                onClick={() => navigate('/cart')}>
                🛒 {/* El emoji del carrito no necesita traducción */}
              </button>
            </li>
          </ul>
        </div>
        <div className={styles.rightSection}>
          <NotificationBell count={0} />
          <div className={styles.profileIconContainer}>
            <img
              src={user?.avatar || 'https://via.placeholder.com/50'}
              alt={t('navbar.profile')}
              className={styles.profileIcon}
              onClick={toggleQuickPerfil}
            />
          </div>
        </div>

        {/* Componente QuickPerfil */}
        {showQuickPerfil && user && (
          <div className={styles.quickPerfilOverlay}>
            <QuickPerfil user={user} onClose={toggleQuickPerfil} />
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;