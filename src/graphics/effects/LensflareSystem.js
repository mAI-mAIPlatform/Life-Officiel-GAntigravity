import * as THREE from 'three';

export class LensflareSystem {
    constructor(scene, sunLight) {
        this.scene = scene;
        this.sun = sunLight;

        // Simule un lensflare avec des sprites attchés au soleil
        const flareColor = new THREE.Color(0xffffff);
        flareColor.setHSL(0.55, 0.9, 0.5);
        // Requires external textures so minimal implementation for now
    }
}
