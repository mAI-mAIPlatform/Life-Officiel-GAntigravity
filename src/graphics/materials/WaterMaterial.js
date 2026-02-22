import * as THREE from 'three';

export class WaterMaterial {
    static create() {
        return new THREE.MeshStandardMaterial({
            color: 0x0055ff,
            transparent: true,
            opacity: 0.8,
            roughness: 0.1,
            metalness: 0.8
        });
    }

    // To be called in update loop to animate UVs
    static animate(mat, time) {
        if (mat.map) {
            mat.map.offset.x = time * 0.05;
            mat.map.offset.y = time * 0.05;
        }
    }
}
