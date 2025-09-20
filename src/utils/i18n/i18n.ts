import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar archivos de traducción
import translationES from './locales/es/translation.json';
import translationEN from './locales/en/translation.json';
import translationCA from './locales/ca/translation.json';

// Recursos de idioma
const resources = {
    es: {
        translation: translationES,
    },
    en: {
        translation: translationEN,
    },
    ca: {
        translation: translationCA,
    },
};

i18n
    // Detectar idioma del navegador
    .use(LanguageDetector)
    // Usar react-i18next
    .use(initReactI18next)
    // Inicializar i18next
    .init({
        resources,
        fallbackLng: 'es', // Idioma de respaldo
        interpolation: {
            escapeValue: false, // No es necesario para React
        },
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'],
        },
    });

export default i18n;