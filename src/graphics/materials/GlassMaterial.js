import * as THREE from 'three';

export class GlassMaterial {
    static create() {
        return new THREE.MeshPhysicalMaterial({
            color: 0xffffff,
            metalness: 0.1,
            roughness: 0.05,
            transmission: 0.9, // glass-like transparency
            thickness: 0.5,
            transparent: true,
            opacity: 1
        });
    }
}
