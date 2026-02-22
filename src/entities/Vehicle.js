import * as THREE from 'three';
import * as CANNON from 'cannon-es';

window.activeVehicle = null;

export class Vehicle {
    constructor(scene, world, player, camera, type = 'car', spawnPos = new THREE.Vector3(5, 1, 0), modelAsset = null) {
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.camera = camera;
        this.type = type; // 'car', 'truck', 'bike'
        this.modelAsset = modelAsset;

        this.isActive = false;

        switch (type) {
            case 'truck':
                this.speed = 20;
                this.turnSpeed = 1.0;
                this.mass = 1500;
                break;
            case 'bike':
                this.speed = 45;
                this.turnSpeed = 3.5;
                this.mass = 200;
                break;
            default: // car
                this.speed = 30;
                this.turnSpeed = 2.0;
                this.mass = 500;
        }

        this.keys = { forward: false, backward: false, left: false, right: false };
        this.promptUI = document.getElementById('vehicle-prompt-ui');

        this.initMesh(spawnPos);
        this.initPhysics(spawnPos);
        this.addEventListeners();
    }

    initMesh(spawnPos) {
        this.meshGroup = new THREE.Group();

        let width = 2, length = 4, height = 0.5, color = 0x111111;

        if (this.type === 'truck') {
            width = 3.5; length = 7.5; height = 1.5; color = 0x2C3E50;
        } else if (this.type === 'bike') {
            width = 0.8; length = 2.2; height = 0.6; color = 0xE74C3C;
        }

        if (this.modelAsset) {
            const mesh = this.modelAsset.clone();
            mesh.scale.setScalar(2); // Scale adjust depending on original asset size
            this.meshGroup.add(mesh);

            // Re-adjust physical bounding box size heuristics based on type
            width = this.type === 'bike' ? 1.0 : 2.5;
            length = this.type === 'bike' ? 2.5 : 5.0;
            height = this.type === 'bike' ? 1.0 : 1.5;
        } else {
            // Chassis
            const chassisGeo = new THREE.BoxGeometry(width, height, length);
            const chassisMat = new THREE.MeshStandardMaterial({
                color: color,
                roughness: 0.3,
                metalness: 0.8
            });
            const chassis = new THREE.Mesh(chassisGeo, chassisMat);
            chassis.position.y = height / 2;
            chassis.castShadow = true;
            this.meshGroup.add(chassis);

            // Cockpit en verre
            let cockpitW = width * 0.75, cockpitL = length * 0.5, cockpitH = height * 1.5;
            if (this.type === 'bike') {
                cockpitW = width * 0.8; cockpitL = length * 0.3; cockpitH = 0.3;
            }
            const cockpitGeo = new THREE.BoxGeometry(cockpitW, cockpitH, cockpitL);
            const cockpitMat = new THREE.MeshStandardMaterial({
                color: 0x00FFFF,
                transparent: true,
                opacity: 0.4,
                roughness: 0.1,
                metalness: 1.0
            });
            const cockpit = new THREE.Mesh(cockpitGeo, cockpitMat);
            cockpit.position.set(0, height + cockpitH / 2, -length * 0.1);
            this.meshGroup.add(cockpit);
        }

        // Propulseurs Néon Arrière (Added for both fallback and custom models)
        const thrusterGeo = new THREE.CylinderGeometry(width * 0.15, width * 0.15, 0.2, 16);
        const thrusterMat = new THREE.MeshBasicMaterial({ color: 0xFF007F });

        this.thrusterL = new THREE.Mesh(thrusterGeo, thrusterMat);
        this.thrusterL.rotation.x = Math.PI / 2;
        this.thrusterL.position.set(-width * 0.3, height / 2, length / 2 + 0.1);
        this.meshGroup.add(this.thrusterL);

        this.thrusterR = new THREE.Mesh(thrusterGeo, thrusterMat);
        this.thrusterR.rotation.x = Math.PI / 2;
        this.thrusterR.position.set(width * 0.3, height / 2, length / 2 + 0.1);
        this.meshGroup.add(this.thrusterR);

        // Lumière de propulsion
        this.thrusterLight = new THREE.PointLight(0xFF007F, 0, 15);
        this.thrusterLight.position.set(0, height / 2, length / 2 + 0.5);
        this.meshGroup.add(this.thrusterLight);

        // Position initiale du véhicule au spawn
        this.meshGroup.position.copy(spawnPos);
        this.scene.add(this.meshGroup);

        this.width = width;
        this.height = height;
        this.length = length;
    }

    initPhysics(spawnPos) {
        // Physique simplifiée (Boîte glissante / Hovercraft)
        const shape = new CANNON.Box(new CANNON.Vec3(this.width / 2, this.height / 2, this.length / 2));
        this.body = new CANNON.Body({
            mass: this.mass,
            position: new CANNON.Vec3(spawnPos.x, Math.max(spawnPos.y, 1), spawnPos.z),
            linearDamping: 0.9,
            angularDamping: 0.9
        });

        this.body.addShape(shape);
        this.world.addBody(this.body);

        // Bloquer la rotation sur X et Z pour l'empêcher de se retourner (Hover)
        this.body.fixedRotation = true;
        this.body.updateMassProperties();
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        if (event.code === 'KeyF') {
            this.tryEnterOrExit();
        }

        if (!this.isActive) return;
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.keys.forward = true; break;
            case 'ArrowLeft':
            case 'KeyA': this.keys.left = true; break;
            case 'ArrowDown':
            case 'KeyS': this.keys.backward = true; break;
            case 'ArrowRight':
            case 'KeyD': this.keys.right = true; break;
        }
    }

    onKeyUp(event) {
        if (!this.isActive) return;
        switch (event.code) {
            case 'ArrowUp':
            case 'KeyW': this.keys.forward = false; break;
            case 'ArrowLeft':
            case 'KeyA': this.keys.left = false; break;
            case 'ArrowDown':
            case 'KeyS': this.keys.backward = false; break;
            case 'ArrowRight':
            case 'KeyD': this.keys.right = false; break;
        }
    }

    tryEnterOrExit() {
        if (this.isActive) {
            // Sortir du véhicule
            this.isActive = false;
            window.activeVehicle = null;

            // Replacer le joueur à côté du véhicule
            this.player.body.position.copy(this.body.position);
            this.player.body.position.x -= this.width / 2 + 2.0;
            this.player.body.position.y += 1;

            this.player.body.velocity.set(0, 0, 0);

            // Rendre le joueur visible/actif
            this.player.mesh.visible = true;
            this.player.isActive = true;

            // Couper la lumière des propulseurs
            this.thrusterLight.intensity = 0;

        } else {
            // Entrer dans le véhicule (Vérifier la distance et si on n'est pas déjà dans un)
            if (window.activeVehicle) return;

            // La distance d'interaction est proportionnelle à la taille du véhicule
            const interactDist = Math.max(4, this.length);
            const distance = this.player.mesh.position.distanceTo(this.meshGroup.position);
            if (distance < interactDist) {
                this.isActive = true;
                window.activeVehicle = this;

                // Cacher et désactiver le joueur
                this.player.mesh.visible = false;
                this.player.isActive = false;

                // Déplacer le corps physique du joueur loin
                this.player.body.position.set(0, -100, 0);

                // Cacher le prompt UI 
                if (this.promptUI) {
                    this.promptUI.classList.add('hidden', 'scale-0', 'opacity-0');
                    this.promptUI.removeAttribute('data-visible-for');
                }
            }
        }
    }

    update(deltaTime) {
        // Synchroniser le mesh avec la physique
        this.meshGroup.position.copy(this.body.position);

        // Show/Hide prompt based on distance
        if (this.promptUI && !this.isActive && !window.activeVehicle) {
            const interactDist = Math.max(4, this.length);
            const distance = this.player.mesh.position.distanceTo(this.meshGroup.position);

            if (distance < interactDist) {
                this.promptUI.classList.remove('hidden', 'scale-0', 'opacity-0');
                this.promptUI.setAttribute('data-visible-for', this.body.id);
            } else {
                if (this.promptUI.getAttribute('data-visible-for') == this.body.id) {
                    this.promptUI.classList.add('hidden', 'scale-0', 'opacity-0');
                    this.promptUI.removeAttribute('data-visible-for');
                }
            }
        }

        if (!this.isActive) {
            // Mouvement de flottaison subtil
            this.meshGroup.position.y += Math.sin(Date.now() * 0.002) * 0.05;
            return;
        }

        // Logic de conduite
        const forwardDirection = new THREE.Vector3(0, 0, -1);
        forwardDirection.applyEuler(this.meshGroup.rotation);

        let targetTiltX = 0;
        let targetTiltZ = 0;

        if (this.keys.forward) {
            this.body.velocity.x = forwardDirection.x * this.speed;
            this.body.velocity.z = forwardDirection.z * this.speed;
            this.thrusterLight.intensity = 2; // Allume les réacteurs
            targetTiltX = -0.05; // Cabrage
        } else if (this.keys.backward) {
            this.body.velocity.x = -forwardDirection.x * (this.speed / 2);
            this.body.velocity.z = -forwardDirection.z * (this.speed / 2);
            this.thrusterLight.intensity = 0;
            targetTiltX = 0.05; // Plongeon
        } else {
            this.thrusterLight.intensity = 0;
        }

        // Rotation (gauche / droite)
        if (this.keys.left) {
            this.meshGroup.rotation.y += this.turnSpeed * deltaTime;
            targetTiltZ = 0.15; // Inclinaison virage
        }
        if (this.keys.right) {
            this.meshGroup.rotation.y -= this.turnSpeed * deltaTime;
            targetTiltZ = -0.15;
        }

        // Appliquer l'inclinaison visuelle fluide (sur le chassis uniquement pour ne pas affecter la rotation Y globale)
        // Note: On applique ça sur le meshGroup rotation directement mais on doit faire attention
        // Pour éviter de casser la rotation Y, on utilise un lerp sur les axes X et Z
        this.meshGroup.rotation.x = THREE.MathUtils.lerp(this.meshGroup.rotation.x, targetTiltX, 0.1);
        this.meshGroup.rotation.z = THREE.MathUtils.lerp(this.meshGroup.rotation.z, targetTiltZ, 0.1);

        // Gestion de la Caméra embarquée adaptative à la taille du véhicule
        const cameraOffset = new THREE.Vector3(0, Math.max(4, this.height * 2.5), Math.max(10, this.length * 2.2));
        const rotatedOffset = cameraOffset.clone().applyEuler(this.meshGroup.rotation);
        const desiredCamPos = this.meshGroup.position.clone().add(rotatedOffset);

        this.camera.position.lerp(desiredCamPos, 0.1);
        this.camera.lookAt(this.meshGroup.position);
    }
}
