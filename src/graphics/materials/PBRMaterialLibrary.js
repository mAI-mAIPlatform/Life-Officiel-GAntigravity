import * as THREE from 'three';

export class PBRMaterialLibrary {
    constructor() {
        this.materials = new Map();

        // Pre-create standard materials to avoid duplication
        this.createMaterial('road', { color: 0x333333, roughness: 0.9, metalness: 0.1 });
        this.createMaterial('glass', { color: 0xaaccff, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.5 });
        this.createMaterial('neon', { color: 0x00FF80, emissive: 0x00FF80, emissiveIntensity: 2.0 });
    }

    createMaterial(name, params) {
        const mat = new THREE.MeshStandardMaterial(params);
        this.materials.set(name, mat);
        return mat;
    }

    getMaterial(name) {
        return this.materials.get(name);
    }
}
