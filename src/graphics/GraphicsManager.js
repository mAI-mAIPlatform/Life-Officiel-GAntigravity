import * as THREE from 'three';
import { VolumetricFog } from './effects/VolumetricFog.js';
import { RainSystem } from './effects/RainSystem.js';
import { DustParticles } from './effects/DustParticles.js';
import { SkyboxManager } from './environment/SkyboxManager.js';
import { CloudSystem } from './environment/CloudSystem.js';
import { WindSystem } from './environment/WindSystem.js';
import { PBRMaterialLibrary } from './materials/PBRMaterialLibrary.js';
import { ShadowManager } from './optimization/ShadowManager.js';
import { FrustumCuller } from './optimization/FrustumCuller.js';

export class GraphicsManager {
    constructor(scene, camera, renderer, engine) {
        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.engine = engine;

        // Optimization
        this.shadowManager = new ShadowManager(this.renderer);
        this.frustumCuller = new FrustumCuller(this.scene, this.camera);

        // Materials & Textures
        this.pbrLibrary = new PBRMaterialLibrary();

        // Environment & Weather
        this.skyboxManager = new SkyboxManager(this.scene, this.renderer);
        this.cloudSystem = new CloudSystem(this.scene);
        this.windSystem = new WindSystem();

        // Effects
        this.volumetricFog = new VolumetricFog(this.scene, this.camera);
        this.rainSystem = new RainSystem(this.scene, this.camera);
        this.dustParticles = new DustParticles(this.scene, this.camera);

        this.init();
    }

    init() {
        // Appliquer les paramètres graphiques globaux
        this.shadowManager.applyQualitySetting('Ultra'); // Mettre à jour avec paramètre utilisateur 
    }

    update(deltaTime) {
        const time = performance.now() * 0.001;
        this.windSystem.update(time);

        // Update weather/effects
        this.cloudSystem.update(time, this.windSystem.getWindVector());
        this.dustParticles.update(deltaTime, this.windSystem.getWindVector());
        this.rainSystem.update(deltaTime, this.windSystem.getWindVector());

        // Update optimization
        this.frustumCuller.update();
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize(width, height) {
        // Handle any post-processing composer resizes here in the future
    }
}
