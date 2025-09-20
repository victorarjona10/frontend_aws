import React from 'react';

const AccessibilityFilters: React.FC = () => {
    return (
        <svg
            style={{ position: 'absolute', height: 0, width: 0, overflow: 'hidden' }}
            aria-hidden="true"
        >
            <defs>
                {/* Filtro para protanopia (deficiencia rojo) */}
                <filter id="protanopia-filter">
                    <feColorMatrix
                        type="matrix"
                        values="0.567, 0.433, 0, 0, 0
                    0.558, 0.442, 0, 0, 0
                    0, 0.242, 0.758, 0, 0
                    0, 0, 0, 1, 0"
                    />
                </filter>

                {/* Filtro para deuteranopia (deficiencia verde) */}
                <filter id="deuteranopia-filter">
                    <feColorMatrix
                        type="matrix"
                        values="0.625, 0.375, 0, 0, 0
                    0.7, 0.3, 0, 0, 0
                    0, 0.3, 0.7, 0, 0
                    0, 0, 0, 1, 0"
                    />
                </filter>

                {/* Filtro para tritanopia (deficiencia azul) */}
                <filter id="tritanopia-filter">
                    <feColorMatrix
                        type="matrix"
                        values="0.95, 0.05, 0, 0, 0
                    0, 0.433, 0.567, 0, 0
                    0, 0.475, 0.525, 0, 0
                    0, 0, 0, 1, 0"
                    />
                </filter>
            </defs>
        </svg>
    );
};

export default AccessibilityFilters;