import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAccessibility, ColorMode, FontSize, Language } from './AccessibilityContext';
import styles from './AccessibilityPanel.module.css';

interface AccessibilityPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

const AccessibilityPanel: React.FC<AccessibilityPanelProps> = ({ isOpen, onClose }) => {
    const { t, i18n } = useTranslation();
    const { settings, updateSettings, resetSettings } = useAccessibility();
    const panelRef = useRef<HTMLDivElement>(null);

    // Manejador de idioma
    useEffect(() => {
        if (isOpen) {
            i18n.changeLanguage(settings.language);
        }
    }, [settings.language, i18n, isOpen]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Prevenir scroll del body cuando el modal está abierto
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleLanguageChange = (lang: Language) => {
        updateSettings({ language: lang });
        i18n.changeLanguage(lang);
    };

    return (
        <div className={styles.accessibilityOverlay} data-testid="accessibility-overlay">
            <div ref={panelRef} className={styles.accessibilityModal} data-testid="accessibility-modal">
                <div className={styles.accessibilityPanelHeader}>
                    <h2>{t('accessibility.title')}</h2>
                    <button onClick={onClose} className={styles.closeButton} aria-label="Cerrar">×</button>
                </div>

                <div className={styles.accessibilityPanelContent}>
                    {/* Tamaño de texto */}
                    <div className={styles.accessibilityOption}>
                        <label>{t('accessibility.fontSize')}</label>
                        <div className={styles.accessibilitySelect}>
                            <select
                                value={settings.fontSize}
                                onChange={(e) => updateSettings({ fontSize: e.target.value as FontSize })}
                            >
                                <option value="normal">{t('accessibility.fontSizes.normal')}</option>
                                <option value="large">{t('accessibility.fontSizes.large')}</option>
                                <option value="x-large">{t('accessibility.fontSizes.xlarge')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Modo de color */}
                    <div className={styles.accessibilityOption}>
                        <label>{t('accessibility.colorMode')}</label>
                        <div className={styles.accessibilitySelect}>
                            <select
                                value={settings.colorMode}
                                onChange={(e) => updateSettings({ colorMode: e.target.value as ColorMode })}
                            >
                                <option value="default">{t('accessibility.colorModes.default')}</option>
                                <option value="dark">{t('accessibility.colorModes.dark')}</option>
                                <option value="high-contrast">{t('accessibility.colorModes.highContrast')}</option>
                                <option value="protanopia">{t('accessibility.colorModes.protanopia')}</option>
                                <option value="deuteranopia">{t('accessibility.colorModes.deuteranopia')}</option>
                                <option value="tritanopia">{t('accessibility.colorModes.tritanopia')}</option>
                            </select>
                        </div>
                    </div>

                    {/* Fuente para dislexia */}
                    <div className={styles.accessibilityOption}>
                        <label className={styles.accessibilityCheckbox}>
                            <input
                                type="checkbox"
                                checked={settings.dyslexicFont}
                                onChange={(e) => updateSettings({ dyslexicFont: e.target.checked })}
                            />
                            <span>{t('accessibility.dyslexicFont')}</span>
                        </label>
                    </div>

                    {/* Reducción de movimiento */}
                    <div className={styles.accessibilityOption}>
                        <label className={styles.accessibilityCheckbox}>
                            <input
                                type="checkbox"
                                checked={settings.reducedMotion}
                                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                            />
                            <span>{t('accessibility.reducedMotion')}</span>
                        </label>
                    </div>

                    {/* Selector de idioma */}
                    <div className={styles.accessibilityOption}>
                        <label>{t('accessibility.language')}</label>
                        <div className={styles.accessibilityLanguageButtons}>
                            <button
                                className={settings.language === 'es' ? styles.active : ''}
                                onClick={() => handleLanguageChange('es')}
                            >
                                {t('accessibility.languages.es')}
                            </button>
                            <button
                                className={settings.language === 'en' ? styles.active : ''}
                                onClick={() => handleLanguageChange('en')}
                            >
                                {t('accessibility.languages.en')}
                            </button>
                            <button
                                className={settings.language === 'ca' ? styles.active : ''}
                                onClick={() => handleLanguageChange('ca')}
                            >
                                {t('accessibility.languages.ca')}
                            </button>
                        </div>
                    </div>

                    {/* Botón de reset */}
                    <button className={styles.accessibilityResetButton} onClick={resetSettings}>
                        {t('accessibility.reset')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AccessibilityPanel;