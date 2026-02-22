import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { DistrictManager } from './DistrictManager.js';
import { ChunkManager } from './ChunkManager.js';

export class WorldManager {
    constructor(scene, world, player, assets, lodManager) {
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.assets = assets;
        this.lodManager = lodManager;

        this.districtManager = new DistrictManager(this.scene, this.world, this.assets);
        this.updateInterval = 1.0;
        this.timeSinceLastCheck = this.updateInterval;

        this.initGlobalLandmarks();
    }

    initChunkManager(cityGenerator) {
        this.chunkManager = new ChunkManager(this.scene, this.world, cityGenerator);
    }

    update(deltaTime) {
        this.timeSinceLastCheck += deltaTime;
        if (this.timeSinceLastCheck >= this.updateInterval) {
            this.timeSinceLastCheck = 0;
            if (this.player && this.player.mesh) {
                this.districtManager.update(this.player.mesh.position);
                if (this.chunkManager) {
                    this.chunkManager.update(this.player.mesh.position);
                }
            }
        }
    }

    initGlobalLandmarks() {
        // Points de repère maintenant gérés par CityGenerator
        // pour éviter la duplication des objets.
    }
}
