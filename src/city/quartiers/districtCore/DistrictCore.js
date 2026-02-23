import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class DistrictCore {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.buildings = [];

        // Matériaux premium pour le District Core
        this.materials = {
            glass: new THREE.MeshStandardMaterial({
                color: 0x88ccff,
                metalness: 0.9,
                roughness: 0.1,
                transparent: true,
                opacity: 0.6
            }),
            metal: new THREE.MeshStandardMaterial({
                color: 0x333333,
                metalness: 1.0,
                roughness: 0.2
            }),
            neon: new THREE.MeshBasicMaterial({
                color: 0x00ffff
            }),
            concrete: new THREE.MeshStandardMaterial({
                color: 0x555555,
                roughness: 0.9
            })
        };
    }

    generate(centerX = 0, centerZ = 0) {
        console.log("Génération du District Core...");

        // Création d'une place centrale
        this.createPlaza(centerX, centerZ);

        // Gratte-ciels principaux
        this.createSkyscraper(centerX + 30, centerZ + 30, 80, 20, 20);
        this.createSkyscraper(centerX - 30, centerZ + 30, 100, 25, 25);
        this.createSkyscraper(centerX + 30, centerZ - 30, 120, 15, 30);
        this.createSkyscraper(centerX - 30, centerZ - 30, 90, 30, 15);

        // Bâtiments de bureaux
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const radius = 60 + Math.random() * 20;
            const x = centerX + Math.cos(angle) * radius;
            const z = centerZ + Math.sin(angle) * radius;
            this.createOfficeBuilding(x, z, 30 + Math.random() * 40);
        }
    }

    createPlaza(x, z) {
        const geo = new THREE.CylinderGeometry(20, 20, 0.5, 32);
        const mesh = new THREE.Mesh(geo, this.materials.concrete);
        mesh.position.set(x, 0.25, z);
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Monument central
        const monumentGeo = new THREE.TorusKnotGeometry(4, 1.5, 100, 16);
        const monumentMesh = new THREE.Mesh(monumentGeo, this.materials.neon);
        monumentMesh.position.set(x, 8, z);
        this.scene.add(monumentMesh);

        // Lumière monument
        const light = new THREE.PointLight(0x00ffff, 2, 30);
        light.position.set(x, 10, z);
        this.scene.add(light);
    }

    createSkyscraper(x, z, height, width, depth) {
        const group = new THREE.Group();

        // Structure principale
        const bodyGeo = new THREE.BoxGeometry(width, height, depth);
        const bodyMesh = new THREE.Mesh(bodyGeo, this.materials.glass);
        bodyMesh.position.y = height / 2;
        bodyMesh.castShadow = true;
        bodyMesh.receiveShadow = true;
        group.add(bodyMesh);

        // Détails métalliques (colonnes aux coins)
        const columnGeo = new THREE.BoxGeometry(1, height, 1);
        for (let i = -1; i <= 1; i += 2) {
            for (let j = -1; j <= 1; j += 2) {
                const col = new THREE.Mesh(columnGeo, this.materials.metal);
                col.position.set((width / 2) * i, height / 2, (depth / 2) * j);
                group.add(col);
            }
        }

        // Néons décoratifs
        const neonGeo = new THREE.BoxGeometry(width + 0.2, 0.5, depth + 0.2);
        for (let h = 10; h < height; h += 20) {
            const neon = new THREE.Mesh(neonGeo, this.materials.neon);
            neon.position.y = h;
            group.add(neon);
        }

        group.position.set(x, 0, z); // z est l'axe horizontal dans Three.js pour le sol
        this.scene.add(group);

        // Physique
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            position: new CANNON.Vec3(x, height / 2, z)
        });
        this.world.addBody(body);

        this.buildings.push({ mesh: group, body });
    }

    createOfficeBuilding(x, z, height) {
        const width = 15;
        const depth = 15;

        const geo = new THREE.BoxGeometry(width, height, depth);
        const mesh = new THREE.Mesh(geo, this.materials.concrete);
        mesh.position.set(x, height / 2, z);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        this.scene.add(mesh);

        // Fenêtres
        const winGeo = new THREE.PlaneGeometry(1, 1);
        for (let h = 2; h < height - 2; h += 4) {
            for (let i = -width / 2 + 2; i < width / 2 - 1; i += 3) {
                // On ajoute des fenêtres sur une face
                const win = new THREE.Mesh(winGeo, this.materials.glass);
                win.position.set(x + i, h, z + depth / 2 + 0.1);
                this.scene.add(win);
            }
        }

        // Physique
        const shape = new CANNON.Box(new CANNON.Vec3(width / 2, height / 2, depth / 2));
        const body = new CANNON.Body({
            mass: 0,
            shape: shape,
            position: new CANNON.Vec3(x, height / 2, z)
        });
        this.world.addBody(body);

        this.buildings.push({ mesh, body });
    }
}
