import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export class DistrictGenerator {
    constructor(scene, world, assets, gridX, gridZ, size) {
        this.scene = scene;
        this.world = world;
        this.assets = assets;
        this.gridX = gridX;
        this.gridZ = gridZ;
        this.size = size;

        // Group everything in a THREE.Group for easy disposal
        this.group = new THREE.Group();
        this.scene.add(this.group);

        this.bodies = [];
        this.meshes = []; // For InstancedMeshes specifically generated here

        this.boxGeo = new THREE.BoxGeometry(1, 1, 1);
        // Shared materials (Ideally passed from a MaterialManager but we recreate them simply here for the demo)
        this.baseMat = new THREE.MeshStandardMaterial({ color: 0xF1F5F9, roughness: 0.6, metalness: 0.2 });

        this.generate();
    }

    generate() {
        const startX = this.gridX * this.size;
        const startZ = this.gridZ * this.size;

        // Very basic procedural generation for the chunk
        // Un chunk fait "size" x "size"
        const blockSize = 30;
        const streetWidth = 15;

        // Add a ground piece for this district to avoid relying on a massive global plane
        const groundGeo = new THREE.PlaneGeometry(this.size, this.size);
        const groundMat = new THREE.MeshStandardMaterial({ color: 0x1A202C, roughness: 0.9 });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(startX + this.size / 2, 0.06, startZ + this.size / 2); // Légèrement au dessus du groundPhysMat global
        ground.receiveShadow = true;
        this.group.add(ground);

        // Blocks
        const boxMatrices = [];

        for (let x = 0; x < this.size; x += blockSize + streetWidth) {
            for (let z = 0; z < this.size; z += blockSize + streetWidth) {
                // Ignore central spawn point explicitly (around 0,0)
                const absX = startX + x + blockSize / 2;
                const absZ = startZ + z + blockSize / 2;
                if (Math.abs(absX) < 50 && Math.abs(absZ) < 50) continue;

                // Create a generic building
                if (Math.random() > 0.3) {
                    const height = 15 + Math.random() * 40;

                    const dummy = new THREE.Object3D();
                    dummy.position.set(absX, height / 2, absZ);
                    dummy.scale.set(blockSize * 0.8, height, blockSize * 0.8);
                    dummy.updateMatrix();
                    boxMatrices.push(dummy.matrix);

                    // Physics
                    const shape = new CANNON.Box(new CANNON.Vec3((blockSize * 0.8) / 2, height / 2, (blockSize * 0.8) / 2));
                    const body = new CANNON.Body({
                        mass: 0,
                        shape: shape,
                        position: new CANNON.Vec3(absX, height / 2, absZ)
                    });
                    this.world.addBody(body);
                    this.bodies.push(body);
                }
            }
        }

        // Create InstancedMesh
        if (boxMatrices.length > 0) {
            const imesh = new THREE.InstancedMesh(this.boxGeo, this.baseMat, boxMatrices.length);
            for (let i = 0; i < boxMatrices.length; i++) {
                imesh.setMatrixAt(i, boxMatrices[i]);
            }
            imesh.castShadow = true;
            imesh.receiveShadow = true;
            this.group.add(imesh);
            this.meshes.push(imesh);
        }
    }

    dispose() {
        // Clean up graphics
        if (this.group) {
            this.scene.remove(this.group);
            this.group.traverse(child => {
                if (child.isMesh) {
                    if (child.geometry) child.geometry.dispose();
                    // Optional: dispose materials if they are unique
                }
            });
        }

        // Clean up InstancedMeshes
        for (let mesh of this.meshes) {
            mesh.dispose();
        }
        this.meshes = [];

        // Clean up physics
        for (let body of this.bodies) {
            this.world.removeBody(body);
        }
        this.bodies = [];
    }
}
