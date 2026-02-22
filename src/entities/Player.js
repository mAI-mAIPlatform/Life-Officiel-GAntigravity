import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class Player {
    constructor(scene, world, camera) {
        this.scene = scene;
        this.world = world;
        this.camera = camera;

        this.speed = 10;
        this.isActive = true;
        this.canMove = true;
        this.keys = { forward: false, backward: false, left: false, right: false, jump: false };

        this.initMesh();
        this.initPhysics();
        this.addEventListeners();
    }

    initMesh() {
        // Placeholder pour le personnage 3D : une capsule aux couleurs NeoCity
        const geometry = new THREE.CapsuleGeometry(1, 2, 4, 16);
        const material = new THREE.MeshStandardMaterial({
            color: 0x00FF80,
            roughness: 0.2,
            metalness: 0.8,
            emissive: 0x00FF80,
            emissiveIntensity: 0.2
        });

        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        this.scene.add(this.mesh);

        // Indicateur directionnel (visage du perso)
        const faceGeo = new THREE.BoxGeometry(0.8, 0.5, 0.8);
        const faceMat = new THREE.MeshStandardMaterial({ color: 0x0A192F });
        const faceMesh = new THREE.Mesh(faceGeo, faceMat);
        faceMesh.position.set(0, 0.8, -0.8);
        this.mesh.add(faceMesh);
    }

    setSkinColor(hexColor) {
        if (this.mesh && this.mesh.material) {
            this.mesh.material.color.setHex(hexColor);
            this.mesh.material.emissive.setHex(hexColor);
        }
    }

    initPhysics() {
        // Corps physique Cannon.js
        const radius = 1;
        const topShape = new CANNON.Sphere(radius);
        const bottomShape = new CANNON.Sphere(radius);

        this.body = new CANNON.Body({
            mass: 70, // Poids du personnage en kg
            fixedRotation: true, // Empêche le personnage de basculer
            position: new CANNON.Vec3(0, 2, 0),
            linearDamping: 0.9,
            angularDamping: 1.0 // Coupe toute rotation parasite
        });

        // Assembler les deux sphères pour représenter une capsule physique
        this.body.addShape(topShape, new CANNON.Vec3(0, 1, 0));
        this.body.addShape(bottomShape, new CANNON.Vec3(0, -1, 0));

        this.world.addBody(this.body);
    }

    addEventListeners() {
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
        document.addEventListener('keyup', (e) => this.onKeyUp(e), false);
    }

    onKeyDown(event) {
        if (!this.isActive) return;
        switch (event.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'Space':
                // Permet de sauter si le joueur est proche du sol
                if (Math.abs(this.body.velocity.y) < 0.1) {
                    this.body.velocity.y = 8;
                }
                break;
        }
    }

    onKeyUp(event) {
        if (!this.isActive) return;
        switch (event.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyD': this.keys.right = false; break;
        }
    }

    update(deltaTime) {
        if (!this.isActive) return;

        // Sécurité : Respawn si on tombe sous la map
        if (this.body.position.y < -20) {
            console.warn("Player fell out of world. Respawning...");
            this.body.position.set(0, 10, 0);
            this.body.velocity.set(0, 0, 0);
        }

        // Synchronise le rendu visuel (Three.js) avec la physique (Cannon.js)
        this.mesh.position.copy(this.body.position);

        // Logique de mouvement relative à la caméra
        const inputVec = new THREE.Vector3(0, 0, 0);
        if (this.keys.forward) inputVec.z -= 1;
        if (this.keys.backward) inputVec.z += 1;
        if (this.keys.left) inputVec.x -= 1;
        if (this.keys.right) inputVec.x += 1;

        inputVec.normalize();

        // On oriente le mouvement par rapport à la caméra
        const cameraDirection = new THREE.Vector3();
        this.camera.getWorldDirection(cameraDirection);
        cameraDirection.y = 0; // On garde les mouvements sur l'axe XZ
        cameraDirection.normalize();

        const rightDirection = new THREE.Vector3().crossVectors(cameraDirection, new THREE.Vector3(0, 1, 0)).normalize();

        const moveVec = new THREE.Vector3();
        moveVec.add(cameraDirection.clone().multiplyScalar(-inputVec.z));
        moveVec.add(rightDirection.clone().multiplyScalar(inputVec.x));

        moveVec.multiplyScalar(this.speed);

        // Applique la vitesse au corps physique
        if (inputVec.length() > 0 && this.canMove) {
            this.body.velocity.x = moveVec.x;
            this.body.velocity.z = moveVec.z;

            // Fait tourner le personnage dans la direction du mouvement
            const targetRotation = Math.atan2(moveVec.x, moveVec.z);
            // Lisse la rotation
            const currentRotation = this.mesh.rotation.y;
            // Fonction de lerp personnalisé pour les angles
            const diff = targetRotation - currentRotation;
            const normalizedDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
            this.mesh.rotation.y += normalizedDiff * 10 * deltaTime;
        } else {
            // Arrête doucement le personnage s'il n'y a pas d'input (pour éviter de glisser comme sur la glace)
            this.body.velocity.x *= 0.5;
            this.body.velocity.z *= 0.5;
        }

        // Caméra à la troisième personne (Third-Person Camera)
        const cameraOffset = new THREE.Vector3(0, 6, 12);

        // Sécurité contre l'explosion de la physique
        if (!isFinite(this.mesh.position.x) || !isFinite(this.mesh.position.y) || !isFinite(this.mesh.position.z)) {
            console.error("Critical: Player position is NaN or Infinite. Resetting...");
            this.body.position.set(0, 5, 0);
            this.body.velocity.set(0, 0, 0);
            return;
        }

        const desiredCamPos = this.mesh.position.clone().add(cameraOffset);
        this.camera.position.lerp(desiredCamPos, 0.1);
        this.camera.lookAt(this.mesh.position.clone().add(new THREE.Vector3(0, 2, 0)));
    }
}
