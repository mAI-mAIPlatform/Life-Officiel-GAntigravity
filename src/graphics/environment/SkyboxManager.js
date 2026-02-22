import * as THREE from 'three';

export class SkyboxManager {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.init();
    }

    init() {
        // Un skybox simple génératif sans charger de HDRI lourde pour le web
        this.scene.background = new THREE.Color(0x88ccff);
    }

    setColors(colorHex) {
        this.scene.background.setHex(colorHex);
    }
}
