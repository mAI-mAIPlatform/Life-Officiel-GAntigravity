import React, { ReactNode } from 'react';
import { Physics } from '@react-three/rapier';

interface PhysicsProviderProps {
    children: ReactNode;
    gravity?: [number, number, number];
}

export const PhysicsProvider: React.FC<PhysicsProviderProps> = ({
    children,
    gravity = [0, -9.81, 0]
}) => {
    // Activation du mode debug via les variables d'environnement Vite
    const isDebugActive = import.meta.env.VITE_PHYSICS_DEBUG === 'true';

    return (
        <Physics gravity={gravity} debug={isDebugActive}>
            {children}
        </Physics>
    );
};
