import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { useLocation, useNavigate } from "react-router-dom";
import BarcelonaMap from "../../Maps/MapBarcelona/MapBarcelona";
import { getUserById } from "../../../service/userService";
import styles from "./Home.module.css";
import { useTranslation } from 'react-i18next';

const Home: React.FC = () => {
  const fotoLupa = "https://cdn-icons-png.flaticon.com/512/4715/4715177.png";
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const mapRef = useRef<HTMLDivElement>(null);

  const prov_user = location.state?.user;
  const userFromStorage = localStorage.getItem("user")
    ? JSON.parse(localStorage.getItem("user")!)
    : null;

  const [user, setUser] = useState(prov_user || userFromStorage);
  const [showQuickPerfil, setShowQuickPerfil] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const userName: string = user?.name || "Guest";
  // Mantiene el mismo formato pero usa la traducción
  const text = `${t('home.welcome')} ${userName.toUpperCase()}`;

  const toggleQuickPerfil = () => {
    setShowQuickPerfil((prev) => !prev);
  };

  useEffect(() => {
    const fetchUser = async () => {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.warn("No user ID found. Redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        const updatedUser = await getUserById(userId);
        setUser(updatedUser);
        console.log("User data fetched:", updatedUser);
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      }
    };

    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (headingRef.current) {
        const spans = headingRef.current.querySelectorAll("span");
        if (spans.length > 0) {
          animate(spans, {
            y: [
              { to: "-2.75rem", ease: "outExpo", duration: 600 },
              { to: 0, ease: "outBounce", duration: 800, delay: 100 },
            ],
            rotate: {
              from: "-1turn",
              delay: 0,
            },
            delay: (_, i) => i * 50,
            ease: "inOutCirc",
            loopDelay: 1000,
            loop: true,
          });
        }
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="App">
      <div className={styles.homeWrapper}>
        <header className={styles.heroSection}>
          <img src="/quickfind_logo.png" alt="Logo" className={styles.heroLogo} />
          <h1 ref={headingRef}>
            {text.split("").map((char, index) => (
              <span key={index}>{char === " " ? "\u00A0" : char}</span>
            ))}
          </h1>
          <p className={styles.heroSubtitle}>
            {t('home.subtitle')}
          </p>
          <button
            className={styles.ctaButton}
            onClick={() => {
              mapRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            {t('home.exploreButton')}
          </button>
        </header>

        <section className={styles.featuresSection}>
          <h2>{t('home.whatCanYouDo')}</h2>
          <div className={styles.featuresGrid}>
            <div className={styles.featureCard}>
              <span role="img" aria-label="Buscar" className={styles.featureIcon}>🔍</span>
              <h3>{t('home.searchCompanies')}</h3>
              <p>{t('home.searchDescription')}</p>
            </div>
            <div className={styles.featureCard}>
              <span role="img" aria-label="Comparar" className={styles.featureIcon}>⚖️</span>
              <h3>{t('home.compareServices')}</h3>
              <p>{t('home.compareDescription')}</p>
            </div>
            <div className={styles.featureCard}>
              <span role="img" aria-label="Contactar" className={styles.featureIcon}>💬</span>
              <h3>{t('home.contactEasily')}</h3>
              <p>{t('home.contactDescription')}</p>
            </div>
          </div>
        </section>

        <section className={styles.statsSection}>
          <h2>{t('home.stats')}</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>+500</span>
              <span className={styles.statLabel}>{t('home.companies')}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>+2000</span>
              <span className={styles.statLabel}>{t('home.users')}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>+1000</span>
              <span className={styles.statLabel}>{t('home.reviews')}</span>
            </div>
          </div>
        </section>

        <section className={styles.statsSection}>
          <h2>{t('home.finder')}</h2>
          <div ref={mapRef} className={styles.mapContainer}>
            <BarcelonaMap />
          </div>
        </section>

        <footer className={styles.footer}>
          <p className={styles.heroSubtitle}>© {new Date().getFullYear()} QuickFind. {t('common.rights')}</p>
        </footer>
      </div>
    </div>
  );
};

export default Home;