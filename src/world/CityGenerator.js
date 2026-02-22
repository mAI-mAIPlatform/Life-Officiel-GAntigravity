import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Générateur procédural avancé et OPTIMISÉ avec InstancedMesh
export class CityGenerator {
    constructor(scene, world, assets = {}) {
        this.scene = scene;
        this.world = world;
        this.assets = assets;

        // Géométries de base
        this.boxGeo = new THREE.BoxGeometry(1, 1, 1);
        this.cylinderGeo = new THREE.CylinderGeometry(0.5, 0.5, 1, 16);
        this.antennaGeo = new THREE.CylinderGeometry(0.1, 0.3, 1, 8);
        this.benchGeo = new THREE.BoxGeometry(2, 0.4, 0.8);
        this.lampGeo = new THREE.CylinderGeometry(0.1, 0.1, 4, 8);
        this.treeTrunkGeo = new THREE.CylinderGeometry(0.2, 0.4, 3, 8);
        this.treeLeafGeo = new THREE.ConeGeometry(2, 4, 8);
        this.bushGeo = new THREE.SphereGeometry(1, 12, 12);
        this.parkingLineGeo = new THREE.BoxGeometry(0.2, 0.05, 5);

        // Palette de matériaux 'Clair' + Réalisme
        this.materials = {
            base: [
                new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.2, metalness: 0.7 }), // Blanc métallique
                new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.3, metalness: 0.5 }), // Gris très clair
                new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.6, metalness: 0.2 }), // Blanc mat
                new THREE.MeshStandardMaterial({ color: 0x1A202C, roughness: 0.8, metalness: 0.1 })  // Gris Foncé (Nouveau)
            ],
            neon: [ // Neons plus doux et colorés
                new THREE.MeshBasicMaterial({ color: 0x00FFCC }),
                new THREE.MeshBasicMaterial({ color: 0x0088FF }),
                new THREE.MeshBasicMaterial({ color: 0xFF00AA }),
                new THREE.MeshBasicMaterial({ color: 0xFFCC00 })
            ],
            road: new THREE.MeshStandardMaterial({ color: 0x1A202C, roughness: 0.9, metalness: 0.1 }),
            sidewalk: new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.9, metalness: 0.1 }),
            prop: new THREE.MeshStandardMaterial({ color: 0x2D3748, roughness: 0.7, metalness: 0.5 }), // Bancs et lampadaires
            bark: new THREE.MeshStandardMaterial({ color: 0x4B3621, roughness: 0.9 }),
            leaf: new THREE.MeshStandardMaterial({ color: 0x2D5A27, roughness: 0.8 }),
            bush: new THREE.MeshStandardMaterial({ color: 0x3A6A3A, roughness: 0.8 }),
            parkingLine: new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.6 })
        };

        this.buildings = [];
        this.dummy = new THREE.Object3D();

        // Initialisation des tableaux pour l'InstanceMesh
        this.instanceData = {
            sidewalk: [],
            baseBox: [[], [], [], []],
            baseCylinder: [[], [], [], []],
            roof: [[], [], [], []],
            antenna: [[], [], [], []],
            neonBox: [[], [], [], []],
            neonCylinder: [[], [], [], []],
            bench: [],
            lamp: [],
            treeTrunk: [],
            treeLeaf: [],
            bush: [],
            parkingLine: []
        };
    }

    initGlobalFeatures() {
        const citySizeX = 800;
        const citySizeZ = 800;

        // Base ground
        this.createCityGround(citySizeX, citySizeZ);

        // Global Landmarks and thematic grounds are unchanged
        this.placeLandmarks();

        // Custom zones that span multiple chunks or are unique
        this.createParkingZone(-200, 200, 100);
        this.createDarkZone(200, 200, 100);
        this.createHospitalZone(200, 200, 80);
        this.createAirportZone(350, 350, 150);

        // Render initial base generic stuff globally (vegetation is disabled globally, moved to chunks)
        this.buildInstancedMeshes();
    }

    generateChunk(startX, startZ, size, hasPhysics) {
        const blockSize = 25;
        const streetWidth = 12;
        let physicsBodies = [];

        for (let x = startX; x < startX + size; x += blockSize + streetWidth) {
            for (let z = startZ; z < startZ + size; z += blockSize + streetWidth) {
                // Zone de spawn (centre) sans bâtiment
                if (Math.abs(x) < 40 && Math.abs(z) < 40) continue;

                // Unique buildings (simplified generic check for now)
                if (x > 40 && x < 100 && z > 40 && z < 100) {
                    physicsBodies.push(...this.createCityHall(x, z, blockSize));
                    continue;
                }
                if (x < -40 && x > -100 && z > 40 && z < 100) {
                    physicsBodies.push(...this.createPoliceStation(x, z, blockSize));
                    continue;
                }
                if (x > 40 && x < 100 && z < -40 && z > -100) {
                    this.createPark(x, z, blockSize); // Parks don't need massive blockers
                    continue;
                }
                if (Math.random() > 0.85) {
                    physicsBodies.push(...this.createShopBlock(x, z, blockSize));
                    continue;
                }

                if (Math.random() > 0.15) {
                    const blockPhysics = this.createCityBlock(x, z, blockSize);
                    if (blockPhysics) physicsBodies.push(...blockPhysics);
                }
            }
        }

        // Add vegetation locally to this chunk
        for (let i = 0; i < 5; i++) {
            const vx = startX + Math.random() * size;
            const vz = startZ + Math.random() * size;
            if (Math.random() > 0.5) this.addTree(vx, vz);
            else this.addBush(vx, vz);
        }

        // Re-build instance meshes entirely to reflect new matrices
        this.refreshInstanceMeshes(false);

        return {
            physicsBodies: physicsBodies
        };
    }

    refreshInstanceMeshes(immediate = false) {
        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);

        const rebuild = () => {
            // Clear old ones - iterate backwards to safely remove
            for (let i = this.scene.children.length - 1; i >= 0; i--) {
                const child = this.scene.children[i];
                if (child.isInstancedMesh && child.userData.isProceduralCity) {
                    this.scene.remove(child);
                }
            }

            // Rebuild them from current arrays
            this.buildInstancedMeshes();
            this.refreshTimeout = null;
        };

        if (immediate) {
            rebuild();
        } else {
            this.refreshTimeout = setTimeout(rebuild, 32); // Wait 2 frames approximately before rebuilding
        }
    }

    unloadChunkGraphics(chunk) {
        // Advanced: removing matrices from array is complex and slow.
        // For now, since we rebuild InstancedMeshes locally, we don't do complex matrix removal here,
        // we just rely on physics unloading for memory/CPU saving. Memory for matrices is negligible.
    }

    placeLandmarks() {
        const landmarks = [
            { name: '1asset.glb', pos: new THREE.Vector3(50, 0, 50), scale: 2 },
            { name: '2asset.glb', pos: new THREE.Vector3(-60, 0, 80), scale: 3 },
            { name: '3asset.glb', pos: new THREE.Vector3(120, 0, -100), scale: 1.5 },
            { name: '4asset.glb', pos: new THREE.Vector3(-150, 0, -150), scale: 4 },
            { name: '5asset.glb', pos: new THREE.Vector3(200, 0, 0), scale: 2.5 },
            { name: '6asset.glb', pos: new THREE.Vector3(-200, 0, 0), scale: 3 },
            { name: '7asset.glb', pos: new THREE.Vector3(0, 0, 250), scale: 5 },
            { name: '8asset.glb', pos: new THREE.Vector3(0, 0, -250), scale: 6 },
            { name: '9asset.glb', pos: new THREE.Vector3(80, 0, 80), scale: 2.2 },
            { name: '10asset.glb', pos: new THREE.Vector3(300, 0, 300), scale: 3 },
            { name: '11asset.glb', pos: new THREE.Vector3(-300, 0, 300), scale: 2 },
            { name: '13asset.gltf', pos: new THREE.Vector3(-350, 0, -350), scale: 10 },
            { name: '14asset.gltf', pos: new THREE.Vector3(400, 0, 100), scale: 5 },
            { name: '15asset.gltf', pos: new THREE.Vector3(-400, 0, -100), scale: 8 },
            { name: '16asset.gltf', pos: new THREE.Vector3(100, 0, 400), scale: 6 },
            { name: '17asset.glb', pos: new THREE.Vector3(-100, 0, -400), scale: 4 },
            { name: '18asset.glb', pos: new THREE.Vector3(450, 0, 450), scale: 3 },
            { name: '19asset.glb', pos: new THREE.Vector3(-450, 0, -450), scale: 2 },
            { name: '20asset.glb', pos: new THREE.Vector3(300, 0, -300), scale: 1.5, zone: 'beach', isSittable: true },
            { name: '21asset.glb', pos: new THREE.Vector3(320, 0, -350), scale: 2.5, zone: 'beach', isSittable: true },
            { name: '22asset.glb', pos: new THREE.Vector3(280, 0, -380), scale: 1.2, zone: 'beach', isSittable: true },
            { name: '23asset.glb', pos: new THREE.Vector3(350, 0, -320), scale: 3, zone: 'beach', isSittable: true },
            { name: '24asset.glb', pos: new THREE.Vector3(400, 0, -400), scale: 5, zone: 'beach', isSittable: true },
            { name: '25asset.glb', pos: new THREE.Vector3(-300, 0, -300), scale: 1, zone: 'scrap' },
            { name: '26asset.glb', pos: new THREE.Vector3(-320, 0, -350), scale: 1.5, zone: 'scrap' },
            { name: '27asset.glb', pos: new THREE.Vector3(-280, 0, -380), scale: 2, zone: 'scrap' },
            { name: '28asset.glb', pos: new THREE.Vector3(-350, 0, -320), scale: 1.8, zone: 'scrap' },
            { name: '29asset.glb', pos: new THREE.Vector3(-400, 0, -400), scale: 2.2, zone: 'scrap' },
            { name: '30asset.glb', pos: new THREE.Vector3(-450, 0, -350), scale: 6, zone: 'scrap' },
            { name: '31asset.fbx', pos: new THREE.Vector3(250, 0, -150), scale: 1, isSittable: false },
            { name: '32asset.glb', pos: new THREE.Vector3(-250, 0, 150), scale: 3, isSittable: false },
            { name: '33asset.glb', pos: new THREE.Vector3(150, 0, 250), scale: 2, isSittable: false },
            { name: '34asset.obj', pos: new THREE.Vector3(100, 0, -200), scale: 4, isSittable: false },
            { name: '35asset.fbx', pos: new THREE.Vector3(500, 0, 0), scale: 1 },
            { name: '36asset.fbx', pos: new THREE.Vector3(-500, 0, 0), scale: 1.5 },
            { name: '37asset.fbx', pos: new THREE.Vector3(0, 0, 500), scale: 2 },
            { name: '38asset.fbx', pos: new THREE.Vector3(0, 0, -500), scale: 2.5 },
            { name: '39asset.fbx', pos: new THREE.Vector3(550, 0, 550), scale: 3 },
            { name: '40asset.fbx', pos: new THREE.Vector3(-550, 0, 550), scale: 1 },
            { name: '41asset.fbx', pos: new THREE.Vector3(550, 0, -550), scale: 1.2 },
            { name: '42asset.fbx', pos: new THREE.Vector3(-550, 0, -550), scale: 1.8 },
            { name: '43asset.fbx', pos: new THREE.Vector3(600, 0, 200), scale: 2.2 },
            { name: '44asset.fbx', pos: new THREE.Vector3(-600, 0, 200), scale: 0.8 },
            { name: '45asset.fbx', pos: new THREE.Vector3(200, 0, 600), scale: 1.5 },
            { name: '46asset.fbx', pos: new THREE.Vector3(200, 0, -600), scale: 2 },
            { name: '47asset.fbx', pos: new THREE.Vector3(650, 0, 100), scale: 1.4 },
            { name: '48asset.fbx', pos: new THREE.Vector3(-650, 0, 100), scale: 2.6 },
            { name: '49asset.fbx', pos: new THREE.Vector3(100, 0, 650), scale: 1.9 },
            { name: '50asset.obj', pos: new THREE.Vector3(100, 0, -650), scale: 3 }
        ];

        this.unplacedLandmarks = landmarks;

        // Process landmarks in batches of 5 every frame to prevent blocking
        let index = 0;
        const batchSize = 5;

        const loadBatch = () => {
            let processedThisBatch = 0;

            while (index < this.unplacedLandmarks.length && processedThisBatch < batchSize) {
                const config = this.unplacedLandmarks[index];
                const model = this.assets[config.name];

                if (model) {
                    // It's loaded, place it
                    this.placeSingleLandmark(config, model);
                    // Remove from unplaced list
                    this.unplacedLandmarks.splice(index, 1);
                    processedThisBatch++;
                } else {
                    // Not loaded yet (probably a secondary asset), skip for now
                    index++;
                }
            }

            // If we still have unchecked items, queue next batch
            if (index < this.unplacedLandmarks.length) {
                setTimeout(loadBatch, 30); // Next batch on next tick (30ms to breathe)
            } else {
                this.addThematicGrounds();
            }
        };

        loadBatch();
    }

    placeSingleLandmark(config, model) {
        const landmark = model.clone();
        landmark.userData = { name: config.name, isSittable: config.isSittable, zone: config.zone };

        // Appliquer position et scale
        landmark.position.copy(config.pos);
        if (config.scale) landmark.scale.setScalar(config.scale);

        this.scene.add(landmark);

        landmark.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        // Calculer la bounding box après scaling
        const box = new THREE.Box3().setFromObject(landmark);
        const size = new THREE.Vector3();
        box.getSize(size);
        const center = new THREE.Vector3();
        box.getCenter(center);

        const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
        const body = new CANNON.Body({
            mass: 0,
            position: new CANNON.Vec3(center.x, center.y, center.z)
        });
        body.addShape(shape);
        this.world.addBody(body);
    }

    onBackgroundAssetLoaded(assetName) {
        // Called by main.js when a secondary asset finishes loading
        if (!this.unplacedLandmarks) return;

        // Find all configurations waiting for this asset
        for (let i = this.unplacedLandmarks.length - 1; i >= 0; i--) {
            const config = this.unplacedLandmarks[i];
            if (config.name === assetName) {
                const model = this.assets[assetName];
                if (model) {
                    this.placeSingleLandmark(config, model);
                    this.unplacedLandmarks.splice(i, 1);
                }
            }
        }
    }

    addThematicGrounds() {
        // Sol Plage (Sable)
        const sandGeo = new THREE.PlaneGeometry(300, 300);
        const sandMat = new THREE.MeshStandardMaterial({
            color: 0xE2C48E, // Sand color
            roughness: 0.8
        });
        const sandMesh = new THREE.Mesh(sandGeo, sandMat);
        sandMesh.rotation.x = -Math.PI / 2;
        sandMesh.position.set(350, 0.1, -350); // Un peu décalé pour la zone plage
        sandMesh.receiveShadow = true;
        this.scene.add(sandMesh);

        // Sol Décharge (Béton taché)
        const scrapGeo = new THREE.PlaneGeometry(300, 300);
        const scrapMat = new THREE.MeshStandardMaterial({
            color: 0x333333,
            roughness: 0.9,
            metalness: 0.1
        });
        const scrapMesh = new THREE.Mesh(scrapGeo, scrapMat);
        scrapMesh.rotation.x = -Math.PI / 2;
        scrapMesh.position.set(-350, 0.1, -350);
        scrapMesh.receiveShadow = true;
        this.scene.add(scrapMesh);
    }

    createCityGround(width, depth) {
        const roadGeo = new THREE.PlaneGeometry(width, depth);
        const road = new THREE.Mesh(roadGeo, this.materials.road);
        road.rotation.x = -Math.PI / 2;
        road.position.y = 0.05;
        road.receiveShadow = true;
        this.scene.add(road);
    }

    addInstanceContent(array, position, scale) {
        this.dummy.position.copy(position);
        this.dummy.scale.copy(scale);
        this.dummy.updateMatrix();
        array.push(this.dummy.matrix.clone());
    }

    createCityBlock(startX, startZ, blockSize) {
        let blockBodies = [];

        // Ajoute un trottoir
        this.addInstanceContent(
            this.instanceData.sidewalk,
            new THREE.Vector3(startX + blockSize / 2, 0.25, startZ + blockSize / 2),
            new THREE.Vector3(blockSize, 0.5, blockSize)
        );

        // Ajouter des props génériques (bancs, lampes)
        const cx = startX + blockSize / 2;
        const cz = startZ + blockSize / 2;
        if (Math.random() > 0.3) {
            this.addInstanceContent(this.instanceData.bench, new THREE.Vector3(cx + blockSize / 2 - 2, 0.7, cz), new THREE.Vector3(1, 1, 1));
        }
        if (Math.random() > 0.5) {
            this.addInstanceContent(this.instanceData.lamp, new THREE.Vector3(cx - blockSize / 2 + 1, 2.5, cz - blockSize / 2 + 1), new THREE.Vector3(1, 1, 1));
        }

        const numBuildings = Math.floor(Math.random() * 4) + 1;

        for (let i = 0; i < numBuildings; i++) {
            const body = this.createComplexBuilding(startX, startZ, blockSize, numBuildings);
            if (body) blockBodies.push(body);
        }

        // Végétation de rue
        if (Math.random() > 0.4) {
            this.addTree(startX + 2, startZ + 2);
        }

        return blockBodies;
    }

    addTree(x, z) {
        const height = 2 + Math.random() * 2;
        this.addInstanceContent(this.instanceData.treeTrunk, new THREE.Vector3(x, height / 2, z), new THREE.Vector3(1, height / 3, 1));
        this.addInstanceContent(this.instanceData.treeLeaf, new THREE.Vector3(x, height + 1.5, z), new THREE.Vector3(1.2 + Math.random() * 0.5, 1, 1.2 + Math.random() * 0.5));
    }

    addBush(x, z) {
        const scale = 0.5 + Math.random();
        this.addInstanceContent(this.instanceData.bush, new THREE.Vector3(x, scale / 2, z), new THREE.Vector3(scale, scale, scale));
    }

    placeVegetationGlobal() {
        // Ajouter du végétal un peu partout aléatoirement
        for (let i = 0; i < 200; i++) {
            const x = (Math.random() - 0.5) * 750;
            const z = (Math.random() - 0.5) * 750;
            // Éviter le centre
            if (Math.abs(x) < 50 && Math.abs(z) < 50) continue;

            if (Math.random() > 0.5) {
                this.addTree(x, z);
            } else {
                this.addBush(x, z);
            }
        }
    }

    createParkingZone(startX, startZ, size) {
        // Sol de parking
        const parkGeo = new THREE.PlaneGeometry(size, size);
        const parkMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
        const parkMesh = new THREE.Mesh(parkGeo, parkMat);
        parkMesh.rotation.x = -Math.PI / 2;
        parkMesh.position.set(startX + size / 2, 0.1, startZ + size / 2);
        this.scene.add(parkMesh);

        // Lignes de parking
        for (let i = 0; i < size; i += 6) {
            for (let j = 0; j < size; j += 10) {
                this.addInstanceContent(this.instanceData.parkingLine, new THREE.Vector3(startX + i, 0.15, startZ + j), new THREE.Vector3(1, 1, 1));
            }
        }
    }

    createDarkZone(startX, startZ, size) {
        // ... (code existant)
    }

    createHospitalZone(startX, startZ, size) {
        this.addInstanceContent(this.instanceData.sidewalk, new THREE.Vector3(startX + size / 2, 0.25, startZ + size / 2), new THREE.Vector3(size, 0.5, size));
        const cx = startX + size / 2;
        const cz = startZ + size / 2;

        // Bâtiment Hôpital (Blanc pur avec néons bleus)
        this.addInstanceContent(this.instanceData.baseBox[0], new THREE.Vector3(cx, 15, cz), new THREE.Vector3(size * 0.8, 30, size * 0.8));
        this.addInstanceContent(this.instanceData.neonBox[1], new THREE.Vector3(cx, 25, cz), new THREE.Vector3(size * 0.82, 2, size * 0.82));

        // Physics for global landmark
        const body = this.addSimplePhysics(cx, 15, cz, size * 0.8, 30, size * 0.8);
        this.world.addBody(body);
    }

    createAirportZone(startX, startZ, size) {
        // Piste d'atterrissage
        const runwayGeo = new THREE.PlaneGeometry(size * 0.5, size * 2);
        const runwayMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 1.0 });
        const runway = new THREE.Mesh(runwayGeo, runwayMat);
        runway.rotation.x = -Math.PI / 2;
        runway.position.set(startX, 0.15, startZ);
        this.scene.add(runway);

        // Lignes de piste
        for (let i = -size; i < size; i += 20) {
            this.addInstanceContent(this.instanceData.parkingLine, new THREE.Vector3(startX, 0.2, startZ + i), new THREE.Vector3(2, 1, 4));
        }
        console.log("Airport/Runway Created at", startX, startZ);
    }

    createCityHall(startX, startZ, blockSize) {
        this.addInstanceContent(this.instanceData.sidewalk, new THREE.Vector3(startX + blockSize / 2, 0.25, startZ + blockSize / 2), new THREE.Vector3(blockSize, 0.5, blockSize));
        const cx = startX + blockSize / 2;
        const cz = startZ + blockSize / 2;

        // Base massive
        this.addInstanceContent(this.instanceData.baseBox[0], new THREE.Vector3(cx, 15, cz), new THREE.Vector3(blockSize * 0.8, 30, blockSize * 0.8));
        this.addInstanceContent(this.instanceData.baseBox[2], new THREE.Vector3(cx, 35, cz), new THREE.Vector3(blockSize * 0.6, 10, blockSize * 0.6));

        // Entrée majestueuse
        this.addInstanceContent(this.instanceData.baseBox[3], new THREE.Vector3(cx, 5, cz + (blockSize / 2) - 2), new THREE.Vector3(10, 10, 4));

        // Physics
        const body = this.addSimplePhysics(cx, 20, cz, blockSize * 0.8, 40, blockSize * 0.8);
        return [body];
    }

    createPoliceStation(startX, startZ, blockSize) {
        this.addInstanceContent(this.instanceData.sidewalk, new THREE.Vector3(startX + blockSize / 2, 0.25, startZ + blockSize / 2), new THREE.Vector3(blockSize, 0.5, blockSize));
        const cx = startX + blockSize / 2;
        const cz = startZ + blockSize / 2;

        // Bâtiment de la Police
        this.addInstanceContent(this.instanceData.baseBox[1], new THREE.Vector3(cx, 12.5, cz), new THREE.Vector3(blockSize * 0.9, 25, blockSize * 0.9));
        // Antenne massive sur le toit
        this.addInstanceContent(this.instanceData.antenna[1], new THREE.Vector3(cx, 35, cz), new THREE.Vector3(2, 20, 2));

        const body = this.addSimplePhysics(cx, 12.5, cz, blockSize * 0.9, 25, blockSize * 0.9);
        return [body];
    }

    createPark(startX, startZ, blockSize) {
        this.addInstanceContent(this.instanceData.sidewalk, new THREE.Vector3(startX + blockSize / 2, 0.1, startZ + blockSize / 2), new THREE.Vector3(blockSize, 0.2, blockSize));
        const cx = startX + blockSize / 2;
        const cz = startZ + blockSize / 2;

        // Bancs et arbres proceduraux
        for (let i = 0; i < 15; i++) {
            const rx = (Math.random() - 0.5) * (blockSize - 5);
            const rz = (Math.random() - 0.5) * (blockSize - 5);
            this.addInstanceContent(this.instanceData.bench, new THREE.Vector3(cx + rx, 0.7, cz + rz), new THREE.Vector3(1, 1, 1));
            this.addTree(cx + rx + 2, cz + rz + 2);
            this.addBush(cx + rx - 2, cz + rz - 2);
        }
        console.log("Park Created at", cx, cz);
    }

    createShopBlock(startX, startZ, blockSize) {
        this.addInstanceContent(this.instanceData.sidewalk, new THREE.Vector3(startX + blockSize / 2, 0.25, startZ + blockSize / 2), new THREE.Vector3(blockSize, 0.5, blockSize));
        const cx = startX + blockSize / 2;
        const cz = startZ + blockSize / 2;

        // Boutiques alignées
        this.addInstanceContent(this.instanceData.baseBox[2], new THREE.Vector3(cx - 5, 5, cz - 5), new THREE.Vector3(10, 10, 10));
        this.addInstanceContent(this.instanceData.baseBox[3], new THREE.Vector3(cx + 6, 6, cz + 5), new THREE.Vector3(12, 12, 12));

        const body1 = this.addSimplePhysics(cx - 5, 5, cz - 5, 10, 10, 10);
        const body2 = this.addSimplePhysics(cx + 6, 6, cz + 5, 12, 12, 12);
        return [body1, body2];
    }

    createComplexBuilding(blockX, blockZ, blockSize, count) {
        const offsetX = (Math.random() - 0.5) * (blockSize * 0.5);
        const offsetZ = (Math.random() - 0.5) * (blockSize * 0.5);

        const width = (blockSize * 0.3) + Math.random() * (blockSize * 0.4);
        const depth = (blockSize * 0.3) + Math.random() * (blockSize * 0.4);
        const height = 20 + Math.random() * 80;

        const posX = blockX + blockSize / 2 + offsetX;
        const posZ = blockZ + blockSize / 2 + offsetZ;

        // Base building
        const matIndex = Math.floor(Math.random() * this.materials.base.length);
        const isCylinder = Math.random() > 0.8;

        const pos = new THREE.Vector3(posX, height / 2, posZ);
        const scale = new THREE.Vector3(width, height, depth);

        if (isCylinder) {
            this.addInstanceContent(this.instanceData.baseCylinder[matIndex], pos, scale);
        } else {
            this.addInstanceContent(this.instanceData.baseBox[matIndex], pos, scale);
        }

        // Details: Roof
        if (Math.random() > 0.5) {
            const roofHeight = 2 + Math.random() * 5;
            this.addInstanceContent(
                this.instanceData.roof[matIndex],
                new THREE.Vector3(posX, height + roofHeight / 2, posZ),
                new THREE.Vector3(width * 0.8, roofHeight, depth * 0.8)
            );

            // Antenna
            if (Math.random() > 0.5) {
                const antennaHeight = 5 + Math.random() * 15;
                this.addInstanceContent(
                    this.instanceData.antenna[matIndex],
                    new THREE.Vector3(posX, height + roofHeight + antennaHeight / 2, posZ),
                    new THREE.Vector3(1, antennaHeight, 1) // antennaGeo height is 1, so Y scaling handles height
                );

                // Optionnel : Très peu de lampes rouges (coûteux)
                if (Math.random() > 0.98) {
                    const beaconLight = new THREE.PointLight(0xFF0000, 1, 50);
                    beaconLight.position.set(posX, height + roofHeight + antennaHeight, posZ);
                    this.scene.add(beaconLight);
                }
            }
        }

        // Neons
        const numNeons = Math.floor(Math.random() * 3);
        const neonMatIndex = Math.floor(Math.random() * this.materials.neon.length);

        for (let j = 0; j < numNeons; j++) {
            const neonHeight = 0.5 + Math.random();
            const neonPos = new THREE.Vector3(posX, (height * 0.1) + Math.random() * (height * 0.8), posZ);
            const neonScale = new THREE.Vector3(width + 0.2, neonHeight, depth + 0.2);

            if (isCylinder) {
                this.addInstanceContent(this.instanceData.neonCylinder[neonMatIndex], neonPos, neonScale);
            } else {
                this.addInstanceContent(this.instanceData.neonBox[neonMatIndex], neonPos, neonScale);
            }
        }

        // --- Physique (Cannon-es) ---
        // Une seule bounding box par bâtiment pour des perfs ultimes
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            position: new CANNON.Vec3(posX, height / 2, posZ)
        });

        // We DO NOT add to world here, we return it to ChunkManager to hold
        this.buildings.push({ body });
        return body;
    }

    addSimplePhysics(x, y, z, w, h, d) {
        const shape = new CANNON.Box(new CANNON.Vec3(w / 2, h / 2, d / 2));
        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            position: new CANNON.Vec3(x, y, z)
        });
        this.buildings.push({ body });
        return body;
    }

    buildInstancedMeshes() {
        const createIMesh = (matricesArray, geometry, material, castShadow = true, receiveShadow = true) => {
            if (matricesArray.length === 0) return;
            const imesh = new THREE.InstancedMesh(geometry, material, matricesArray.length);
            imesh.userData.isProceduralCity = true;
            for (let i = 0; i < matricesArray.length; i++) {
                imesh.setMatrixAt(i, matricesArray[i]);
            }
            imesh.castShadow = castShadow;
            imesh.receiveShadow = receiveShadow;

            // InstancedMesh cast shadows but might be very heavy if too large, we enable them for quality
            this.scene.add(imesh);
        };

        createIMesh(this.instanceData.sidewalk, this.boxGeo, this.materials.sidewalk, true, true);
        createIMesh(this.instanceData.bench, this.benchGeo, this.materials.prop, true, true);
        createIMesh(this.instanceData.lamp, this.lampGeo, this.materials.prop, true, true);
        createIMesh(this.instanceData.treeTrunk, this.treeTrunkGeo, this.materials.bark, true, true);
        createIMesh(this.instanceData.treeLeaf, this.treeLeafGeo, this.materials.leaf, true, true);
        createIMesh(this.instanceData.bush, this.bushGeo, this.materials.bush, true, true);
        createIMesh(this.instanceData.parkingLine, this.parkingLineGeo, this.materials.parkingLine, false, true);

        for (let i = 0; i < this.materials.base.length; i++) {
            createIMesh(this.instanceData.baseBox[i], this.boxGeo, this.materials.base[i], true, true);
            createIMesh(this.instanceData.baseCylinder[i], this.cylinderGeo, this.materials.base[i], true, true);
            createIMesh(this.instanceData.roof[i], this.boxGeo, this.materials.base[i], true, true);
            createIMesh(this.instanceData.antenna[i], this.antennaGeo, this.materials.base[i], true, true);
        }

        for (let i = 0; i < this.materials.neon.length; i++) {
            createIMesh(this.instanceData.neonBox[i], this.boxGeo, this.materials.neon[i], false, false);
            createIMesh(this.instanceData.neonCylinder[i], this.cylinderGeo, this.materials.neon[i], false, false);
        }
    }
}
