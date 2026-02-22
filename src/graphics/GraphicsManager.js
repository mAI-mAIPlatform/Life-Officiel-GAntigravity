import * as THREE from 'three';

export class GraphicsManager {
    constructor(scene, camera, renderer, engine) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.engine = engine;

        this.init();
    }

    init() {
        // Paramètres de base pour assurer la compatibilité
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        // S'assurer que le fond est bien sombre pour éviter le flash
        this.scene.background = new THREE.Color(0x020205);
    }

    update(deltaTime) {
        // On garde ça simple pour déboguer le démarrage
    }

    render() {
        if (!this.renderer || !this.scene || !this.camera) return;
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize(width, height) {
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }
}
