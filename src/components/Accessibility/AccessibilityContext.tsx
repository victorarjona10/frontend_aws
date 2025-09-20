import React, { createContext, useState, useEffect, ReactNode } from 'react';

export type ColorMode = 'default' | 'dark' | 'high-contrast' | 'protanopia' | 'deuteranopia' | 'tritanopia';
export type FontSize = 'normal' | 'large' | 'x-large';
export type Language = 'es' | 'en' | 'ca';

export interface AccessibilitySettings {
    colorMode: ColorMode;
    fontSize: FontSize;
    dyslexicFont: boolean;
    reducedMotion: boolean;
    language: Language;
}

const defaultSettings: AccessibilitySettings = {
    colorMode: 'default',
    fontSize: 'normal',
    dyslexicFont: false,
    reducedMotion: false,
    language: 'es'
};

interface AccessibilityContextType {
    settings: AccessibilitySettings;
    updateSettings: (newSettings: Partial<AccessibilitySettings>) => void;
    resetSettings: () => void;
}

export const AccessibilityContext = createContext<AccessibilityContextType>({
    settings: defaultSettings,
    updateSettings: () => console.warn('AccessibilityProvider not initialized'), // Implementación básica
    resetSettings: () => console.warn('AccessibilityProvider not initialized')  // Implementación básica
});

export const AccessibilityProvider = ({ children }: { children: ReactNode }) => {
    const [settings, setSettings] = useState<AccessibilitySettings>(() => {
        const saved = localStorage.getItem('accessibility-settings');
        return saved ? JSON.parse(saved) : defaultSettings;
    });

    useEffect(() => {
        localStorage.setItem('accessibility-settings', JSON.stringify(settings));

        // Limpiar todas las clases de color anteriores
        const classesToRemove = ['default', 'dark', 'high-contrast', 'protanopia', 'deuteranopia', 'tritanopia'];
        classesToRemove.forEach(cls => document.documentElement.classList.remove(cls));

        // Aplicar configuración al documento HTML
        document.documentElement.classList.add(settings.colorMode);
        document.documentElement.setAttribute('data-color-mode', settings.colorMode);
        document.documentElement.setAttribute('data-font-size', settings.fontSize);

        // Aplicar variables CSS específicas para cada modo de color
        const root = document.documentElement;

        // Restablecer variables CSS
        root.style.removeProperty('--bg-color');
        root.style.removeProperty('--text-color');
        root.style.removeProperty('--bg-color-secondary');
        root.style.removeProperty('--border-color');

        // Establecer variables específicas por modo
        switch (settings.colorMode) {
            case 'dark':
                root.style.setProperty('--bg-color', '#121212');
                root.style.setProperty('--text-color', '#e0e0e0');
                root.style.setProperty('--bg-color-secondary', '#333');
                root.style.setProperty('--border-color', '#444');
                break;
            case 'high-contrast':
                root.style.setProperty('--bg-color', '#000');
                root.style.setProperty('--text-color', '#fff');
                root.style.setProperty('--bg-color-secondary', '#000');
                root.style.setProperty('--border-color', '#fff');
                break;
            case 'protanopia':
            case 'deuteranopia':
            case 'tritanopia':
                // Mantener el fondo y texto similares al default para no interferir con los filtros SVG
                root.style.setProperty('--bg-color', '#ffffff');
                root.style.setProperty('--text-color', '#000000');
                break;
            default: // default
                root.style.setProperty('--bg-color', '#ffffff');
                root.style.setProperty('--text-color', '#000000');
                root.style.setProperty('--bg-color-secondary', '#f5f5f5');
                root.style.setProperty('--border-color', '#e0e0e0');
        }

        if (settings.dyslexicFont) {
            document.documentElement.classList.add('dyslexic-font');
        } else {
            document.documentElement.classList.remove('dyslexic-font');
        }

        if (settings.reducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        } else {
            document.documentElement.classList.remove('reduced-motion');
        }
    }, [settings]);

    const updateSettings = (newSettings: Partial<AccessibilitySettings>) => {
        setSettings(prev => ({ ...prev, ...newSettings }));
    };

    const resetSettings = () => {
        setSettings(defaultSettings);
    };

    return (
        <AccessibilityContext.Provider value={{ settings, updateSettings, resetSettings }}>
            {children}
        </AccessibilityContext.Provider>
    );
};

export const useAccessibility = () => React.useContext(AccessibilityContext);