import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class TrafficManager {
    constructor(scene, world, assets) {
        this.scene = scene;
        this.world = world;
        this.assets = assets;

        this.bots = [];
        this.maxBots = 15;
        this.spawnTimer = 0;
        this.blockSize = 25;
        this.streetWidth = 12;
        this.citySize = 800;

        this.botMaterial = new CANNON.Material('botMaterial');

        // Waypoints simplifiés : les intersections des rues
        this.lanes = {
            horizontal: [], // Rues Est-Ouest (z constant)
            vertical: []    // Rues Nord-Sud (x constant)
        };

        this.initLanes();
        this.spawnInitialTraffic();
    }

    initLanes() {
        const step = this.blockSize + this.streetWidth;
        for (let x = -this.citySize / 2 + step / 2; x < this.citySize / 2; x += step) {
            this.lanes.vertical.push(x);
        }
        for (let z = -this.citySize / 2 + step / 2; z < this.citySize / 2; z += step) {
            this.lanes.horizontal.push(z);
        }
    }

    spawnInitialTraffic() {
        for (let i = 0; i < this.maxBots; i++) {
            this.spawnBot();
        }
    }

    spawnBot() {
        // Choisir une rue aléatoire
        const isVertical = Math.random() > 0.5;
        let x, z, dir;

        if (isVertical) {
            x = this.lanes.vertical[Math.floor(Math.random() * this.lanes.vertical.length)];
            z = (Math.random() - 0.5) * this.citySize;
            dir = new THREE.Vector3(0, 0, Math.random() > 0.5 ? 1 : -1);
        } else {
            z = this.lanes.horizontal[Math.floor(Math.random() * this.lanes.horizontal.length)];
            x = (Math.random() - 0.5) * this.citySize;
            dir = new THREE.Vector3(Math.random() > 0.5 ? 1 : -1, 0, 0);
        }

        const bot = this.createBotMesh(x, z, dir);
        this.bots.push(bot);
    }

    createBotMesh(x, z, dir) {
        // Un petit véhicule futuriste (modèle réel ou boîte alternative)
        let mesh;
        const carModel = this.assets['4asset.glb'] || this.assets['10asset.glb'] || this.assets['14asset.gltf'];

        if (carModel) {
            mesh = carModel.clone();
            mesh.scale.setScalar(1.5);
        } else {
            const geometry = new THREE.BoxGeometry(2, 1, 4);
            const color = new THREE.Color().setHSL(Math.random(), 0.8, 0.5);
            const material = new THREE.MeshStandardMaterial({
                color: color,
                emissive: color,
                emissiveIntensity: 0.5
            });
            mesh = new THREE.Mesh(geometry, material);
        }

        mesh.position.set(x, 0.5, z);
        mesh.castShadow = true;
        this.scene.add(mesh);

        // Physique
        const shape = new CANNON.Box(new CANNON.Vec3(1, 0.5, 2));
        const body = new CANNON.Body({
            mass: 1000,
            position: new CANNON.Vec3(x, 1, z),
            material: this.botMaterial
        });
        body.addShape(shape);
        body.fixedRotation = true;
        this.world.addBody(body);

        // Rotation initiale vers la direction
        const angle = Math.atan2(dir.x, dir.z);
        mesh.rotation.y = angle;
        body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);

        return { mesh, body, dir, speed: 5 + Math.random() * 5 };
    }

    update(deltaTime) {
        this.bots.forEach(bot => {
            // Avancer
            const velocity = bot.dir.clone().multiplyScalar(bot.speed);
            bot.body.velocity.x = velocity.x;
            bot.body.velocity.z = velocity.z;

            // Sync mesh
            bot.mesh.position.copy(bot.body.position);
            bot.mesh.quaternion.copy(bot.body.quaternion);

            // Bouclage (Respawn si trop loin)
            if (Math.abs(bot.body.position.x) > this.citySize / 2 + 50 ||
                Math.abs(bot.body.position.z) > this.citySize / 2 + 50) {
                this.resetBot(bot);
            }
        });
    }

    resetBot(bot) {
        const isVertical = Math.random() > 0.5;
        let x, z, dir;

        if (isVertical) {
            x = this.lanes.vertical[Math.floor(Math.random() * this.lanes.vertical.length)];
            z = Math.random() > 0.5 ? -this.citySize / 2 : this.citySize / 2;
            dir = new THREE.Vector3(0, 0, z < 0 ? 1 : -1);
        } else {
            z = this.lanes.horizontal[Math.floor(Math.random() * this.lanes.horizontal.length)];
            x = Math.random() > 0.5 ? -this.citySize / 2 : this.citySize / 2;
            dir = new THREE.Vector3(x < 0 ? 1 : -1, 0, 0);
        }

        bot.body.position.set(x, 1, z);
        bot.dir.copy(dir);
        bot.speed = 5 + Math.random() * 5;

        const angle = Math.atan2(dir.x, dir.z);
        bot.mesh.rotation.y = angle;
        bot.body.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), angle);
    }
}
