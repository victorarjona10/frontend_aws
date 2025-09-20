import React, { useState } from 'react';
import AccessibilityPanel from './AccessibilityPanel';
import styles from './AccessibilityButton.module.css';

const AccessibilityButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <button
                className={styles.accessibilityFloatingButton}
                onClick={() => setIsOpen(true)}
                aria-label="Opciones de accesibilidad"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 16v.01M12 8v4"></path>
                </svg>
            </button>
            <AccessibilityPanel isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};

export default AccessibilityButton;