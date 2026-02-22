import * as THREE from 'three';

export class SkyboxManager {
    constructor(scene, renderer) {
        this.scene = scene;
        this.renderer = renderer;
        this.init();
    }

    init() {
        // Initialiser avec une couleur sombre (charcoal) pour éviter le flash bleu au démarrage
        this.scene.background = new THREE.Color(0x020205);
    }

    setColors(colorHex) {
        this.scene.background.setHex(colorHex);
    }
}
