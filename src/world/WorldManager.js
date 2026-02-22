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
        this.lodManager = lodManager; // Added lod reference

        this.districtManager = new DistrictManager(this.scene, this.world, this.assets);
        // We assume cityGenerator is passed within `assets` or we pass it directly. Actually, we need cityGenerator.
        // I will let main.js handle passing cityGenerator or I can instantiate ChunkManager in main.js
        this.updateInterval = 1.0; // Check district changes every 1 second
        this.timeSinceLastCheck = this.updateInterval; // Force immediate first update

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
        const landmarks = [
            { name: '1asset.glb', pos: new THREE.Vector3(50, 0, 50), scale: 2 },
            { name: '2asset.glb', pos: new THREE.Vector3(-60, 0, 80), scale: 3 },
            { name: '3asset.glb', pos: new THREE.Vector3(120, 0, -100), scale: 1.5 },
            { name: '4asset.glb', pos: new THREE.Vector3(-150, 0, -150), scale: 4 },
            { name: '5asset.glb', pos: new THREE.Vector3(200, 0, 0), scale: 2.5 },
            { name: '6asset.glb', pos: new THREE.Vector3(-200, 0, 0), scale: 3 },
            { name: '7asset.glb', pos: new THREE.Vector3(0, 0, 250), scale: 5 },
            { name: '8asset.glb', pos: new THREE.Vector3(0, 0, -250), scale: 6 },
            { name: '10asset.glb', pos: new THREE.Vector3(300, 0, 300), scale: 3 },
            { name: '11asset.glb', pos: new THREE.Vector3(-300, 0, 300), scale: 2 },
            { name: '12asset.glb', pos: new THREE.Vector3(350, 0, -350), scale: 1.5 },
            { name: '13asset.gltf', pos: new THREE.Vector3(-350, 0, -350), scale: 10 },
            { name: '14asset.gltf', pos: new THREE.Vector3(400, 0, 100), scale: 5 },
            { name: '15asset.gltf', pos: new THREE.Vector3(-400, 0, -100), scale: 8 },
            { name: '16asset.gltf', pos: new THREE.Vector3(100, 0, 400), scale: 6 },
            { name: '17asset.glb', pos: new THREE.Vector3(-100, 0, -400), scale: 4 },
            { name: '18asset.glb', pos: new THREE.Vector3(450, 0, 450), scale: 3 },
            { name: '19asset.glb', pos: new THREE.Vector3(-450, 0, -450), scale: 2 },

            // --- Zone Plage (Sud-Est) ---
            { name: '20asset.glb', pos: new THREE.Vector3(300, 0, -300), scale: 1.5, zone: 'beach', isSittable: true },
            { name: '21asset.glb', pos: new THREE.Vector3(320, 0, -350), scale: 2.5, zone: 'beach', isSittable: true },
            { name: '22asset.glb', pos: new THREE.Vector3(280, 0, -380), scale: 1.2, zone: 'beach', isSittable: true },
            { name: '23asset.glb', pos: new THREE.Vector3(350, 0, -320), scale: 3, zone: 'beach', isSittable: true },
            { name: '24asset.glb', pos: new THREE.Vector3(400, 0, -400), scale: 5, zone: 'beach', isSittable: true },

            // --- Zone Décharge / Garage (Nord-Ouest) ---
            { name: '25asset.glb', pos: new THREE.Vector3(-300, 0, -300), scale: 1, zone: 'scrap' },
            { name: '26asset.glb', pos: new THREE.Vector3(-320, 0, -350), scale: 1.5, zone: 'scrap' },
            { name: '27asset.glb', pos: new THREE.Vector3(-280, 0, -380), scale: 2, zone: 'scrap' },
            { name: '28asset.glb', pos: new THREE.Vector3(-350, 0, -320), scale: 1.8, zone: 'scrap' },
            { name: '29asset.glb', pos: new THREE.Vector3(-400, 0, -400), scale: 2.2, zone: 'scrap' },
            { name: '30asset.glb', pos: new THREE.Vector3(-450, 0, -350), scale: 6, zone: 'scrap' },

            // --- Nouveaux Assets Majeurs (v0.0.4 Alpha + phase 12) ---
            { name: '31asset.fbx', pos: new THREE.Vector3(250, 0, -150), scale: 1, isSittable: false },
            { name: '32asset.glb', pos: new THREE.Vector3(-250, 0, 150), scale: 3, isSittable: false },
            { name: '33asset.glb', pos: new THREE.Vector3(150, 0, 250), scale: 2, isSittable: false },

            // --- Nouveaux Bâtiments (Asset 34 v0.0.5) ---
            { name: '34asset.glb', pos: new THREE.Vector3(100, 0, -200), scale: 4, isSittable: false },
            { name: '34asset.glb', pos: new THREE.Vector3(-100, 0, 200), scale: 4, isSittable: false },
            { name: '34asset.glb', pos: new THREE.Vector3(200, 0, -100), scale: 4, isSittable: false },
            { name: '34asset.glb', pos: new THREE.Vector3(-200, 0, -100), scale: 4, isSittable: false },

            // --- Mega Structures (from CityGenerator that were removed) ---
            // Hospital, Airports, and Parking are recreated here with generic meshes/colors if no specific asset
            // but we'll stick to the core assets here since the rest of generic generation is handled by DistrictGenerator
        ];

        landmarks.forEach(config => {
            const model = this.assets[config.name];
            if (model) {
                const landmark = model.clone();
                landmark.userData = {
                    name: config.name,
                    isSittable: config.isSittable,
                    zone: config.zone
                };

                // Ombre pour les monuments
                landmark.traverse(child => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                // Positionnement
                landmark.position.copy(config.pos);
                // Compute bounding box accurately for physics BEFORE passing to LOD
                const box = new THREE.Box3().setFromObject(landmark);
                const size = new THREE.Vector3();
                box.getSize(size);

                // Initialize LOD for this landmark instead of raw mesh
                if (this.lodManager) {
                    // Render high res at 0, low res at 150m (will disappear at 300m)
                    this.lodManager.createLODObject(landmark, null, 150);
                } else {
                    this.scene.add(landmark);
                }

                // Physique simplifiée pour le monument
                const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, Math.max(0.1, size.y / 2), size.z / 2));
                const body = new CANNON.Body({
                    mass: 0,
                    position: new CANNON.Vec3(config.pos.x, Math.max(0.1, size.y / 2), config.pos.z)
                });
                body.addShape(shape);
                this.world.addBody(body);
            }
        });
    }
}
