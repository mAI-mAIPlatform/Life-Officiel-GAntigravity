import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, BakeShadows } from '@react-three/drei';

const MainScene: React.FC = () => {
    return (
        <div style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <Canvas shadows dpr={[1, 1.5]} camera={{ position: [0, 5, 10], fov: 50 }}>
                {/* Optimisations de performances pour mobile */}
                <AdaptiveDpr pixelated />
                <BakeShadows />

                {/* Environnement de base */}
                <ambientLight intensity={0.5} />
                <directionalLight
                    position={[10, 20, 10]}
                    intensity={1}
                    castShadow
                    shadow-mapSize={[1024, 1024]}
                />

                <Suspense fallback={null}>
                    {/* Exemple de contenu */}
                    <mesh castShadow receiveShadow position={[0, 0.5, 0]}>
                        <boxGeometry args={[1, 1, 1]} />
                        <meshStandardMaterial color="#00ffcc" />
                    </mesh>
                    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#333333" />
                    </mesh>
                </Suspense>
            </Canvas>
        </div>
    );
};

export default MainScene;
