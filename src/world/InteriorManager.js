import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class InteriorManager {
    constructor(scene, world, player) {
        this.scene = scene;
        this.world = world;
        this.player = player;

        this.doors = []; // List of interactable doors
        this.currentInterior = null;

        // UI for door interaction
        this.doorPromptUI = document.getElementById('door-prompt-ui');

        // Secret underground offset for interiors to hide them from the city
        this.interiorOffset = new THREE.Vector3(0, -500, 0);

        this.initApartment();
        this.createCityDoors();
    }

    initApartment() {
        this.apartmentGroup = new THREE.Group();
        this.apartmentGroup.position.copy(this.interiorOffset);

        // Room geometry (A simple futuristic apartment)
        const roomW = 15;
        const roomD = 10;
        const roomH = 5;

        // Floor
        const floorGeo = new THREE.PlaneGeometry(roomW, roomD);
        const floorMat = new THREE.MeshStandardMaterial({ color: 0x1A1A24, roughness: 0.2, metalness: 0.4 });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.apartmentGroup.add(floor);

        // Walls (Simple representation)
        const wallMat = new THREE.MeshStandardMaterial({ color: 0x050510, roughness: 0.8 });

        const wallN = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.5), wallMat);
        wallN.position.set(0, roomH / 2, -roomD / 2);
        this.apartmentGroup.add(wallN);

        const wallS = new THREE.Mesh(new THREE.BoxGeometry(roomW, roomH, 0.5), wallMat);
        wallS.position.set(0, roomH / 2, roomD / 2);
        this.apartmentGroup.add(wallS);

        const wallE = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), wallMat);
        wallE.position.set(roomW / 2, roomH / 2, 0);
        this.apartmentGroup.add(wallE);

        const wallW = new THREE.Mesh(new THREE.BoxGeometry(0.5, roomH, roomD), wallMat);
        wallW.position.set(-roomW / 2, roomH / 2, 0);
        this.apartmentGroup.add(wallW);

        // Neon Lights
        const neonLight = new THREE.PointLight(0x00FFFF, 1, 20);
        neonLight.position.set(4, 4, -3);
        this.apartmentGroup.add(neonLight);

        const neonGeo = new THREE.BoxGeometry(2, 0.1, 0.1);
        const neonMat = new THREE.MeshBasicMaterial({ color: 0x00FFFF });
        const neonMesh = new THREE.Mesh(neonGeo, neonMat);
        neonMesh.position.set(4, 4, -4.7);
        this.apartmentGroup.add(neonMesh);

        // Add a "bed" outline
        const bed = new THREE.Mesh(new THREE.BoxGeometry(3, 1, 5), new THREE.MeshStandardMaterial({ color: 0x666666 }));
        bed.position.set(-5, 0.5, -2);
        this.apartmentGroup.add(bed);

        // Interior Exit Door
        const exitDoorGeo = new THREE.BoxGeometry(2, 3, 0.2);
        const exitDoorMat = new THREE.MeshBasicMaterial({ color: 0xFF2222 }); // Red exit
        this.exitDoorMesh = new THREE.Mesh(exitDoorGeo, exitDoorMat);
        this.exitDoorMesh.position.set(0, 1.5, roomD / 2 - 0.3); // On South Wall
        this.apartmentGroup.add(this.exitDoorMesh);

        this.scene.add(this.apartmentGroup);

        // Setup Physics for the floor inside the apartment
        const floorBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(roomW / 2, 0.1, roomD / 2)),
            position: new CANNON.Vec3(this.interiorOffset.x, this.interiorOffset.y, this.interiorOffset.z)
        });
        this.world.addBody(floorBody);
    }

    createCityDoors() {
        // Create an interactable door in the main city that leads to the apartment
        const doorGeo = new THREE.BoxGeometry(3, 4, 1);
        const doorMat = new THREE.MeshBasicMaterial({ color: 0x00FF80 }); // Green Enter Door
        this.cityDoorMesh = new THREE.Mesh(doorGeo, doorMat);

        // Placement outside (e.g., near spawn)
        this.cityDoorMesh.position.set(-20, 2, -20);
        this.scene.add(this.cityDoorMesh);

        // Add to interactable doors
        this.doors.push({
            mesh: this.cityDoorMesh,
            type: 'enter_apartment',
            targetPos: new CANNON.Vec3(this.interiorOffset.x, this.interiorOffset.y + 2, this.interiorOffset.z) // Inside door
        });

        // Add the interior exit door to interactions too
        this.doors.push({
            mesh: this.exitDoorMesh,
            type: 'exit_apartment',
            targetPos: new CANNON.Vec3(-20, 2, -15) // Back to city street
        });

        // Key listen to interact
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);
    }

    onKeyDown(event) {
        if (event.code === 'KeyE' && this.closestDoor) {
            this.teleportPlayer(this.closestDoor.targetPos);
        }
    }

    teleportPlayer(targetVecCANNON) {
        // Reset player velocity
        this.player.body.velocity.set(0, 0, 0);

        // Instantly move Cannon body
        this.player.body.position.copy(targetVecCANNON);

        // Also move visual mesh to avoid 1 frame lerp glitch
        this.player.mesh.position.copy(targetVecCANNON);
    }

    update() {
        if (!this.player) return;

        let foundDoor = null;

        // Check distance to all doors
        for (let door of this.doors) {
            // Need to convert to THREE vector for distance check OR just check mesh positions
            // However, interior door is in a Group. Let's get absolute world position.
            const doorPos = new THREE.Vector3();
            door.mesh.getWorldPosition(doorPos);

            const distance = this.player.mesh.position.distanceTo(doorPos);
            if (distance < 4) {
                foundDoor = door;
                break;
            }
        }

        if (foundDoor !== this.closestDoor) {
            this.closestDoor = foundDoor;

            if (this.doorPromptUI) {
                if (this.closestDoor) {
                    this.doorPromptUI.classList.remove('scale-0', 'opacity-0');
                    if (this.closestDoor.type === 'enter_apartment') {
                        this.doorPromptUI.querySelector('span:last-child').innerText = 'Entrer Appartement';
                    } else {
                        this.doorPromptUI.querySelector('span:last-child').innerText = 'Sortir';
                    }
                } else {
                    this.doorPromptUI.classList.add('scale-0', 'opacity-0');
                }
            }
        }
    }
}
