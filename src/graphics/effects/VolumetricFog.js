import * as THREE from 'three';

export class VolumetricFog {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Basic Exponential Fog for performance, but customized parameters
        this.scene.fog = new THREE.FogExp2(0x020205, 0.002);
    }

    setColor(hexColor) {
        this.scene.fog.color.setHex(hexColor);
    }

    setDensity(density) {
        this.scene.fog.density = density;
    }
}
