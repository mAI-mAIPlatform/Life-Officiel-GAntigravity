import * as THREE from 'three';
import * as CANNON from 'cannon-es';

// Manages spatial division of the city to only generate/render/collide areas near the player
export class ChunkManager {
    constructor(scene, world, cityGenerator) {
        this.scene = scene;
        this.world = world;
        this.cityGenerator = cityGenerator;

        this.chunkSize = 100; // 100x100 units per chunk
        this.renderDistance = 2; // How many chunks away to render (2 = 5x5 area)
        this.physicsDistance = 1; // How many chunks away physics should exist

        this.activeChunks = new Map(); // key: "x,z", value: chunkData
        this.lastPlayerChunkX = null;
        this.lastPlayerChunkZ = null;

        this.loadQueue = [];
        this.isLoading = false;
    }

    update(playerPosition) {
        const currentChunkX = Math.floor(playerPosition.x / this.chunkSize);
        const currentChunkZ = Math.floor(playerPosition.z / this.chunkSize);

        // Process queue (1 chunk per update to prevent frame drops)
        this.processQueue();

        // Only update if player crossed a chunk boundary
        if (this.lastPlayerChunkX === currentChunkX && this.lastPlayerChunkZ === currentChunkZ) {
            return;
        }

        this.lastPlayerChunkX = currentChunkX;
        this.lastPlayerChunkZ = currentChunkZ;

        this.updateChunks(currentChunkX, currentChunkZ);
    }

    processQueue() {
        if (this.loadQueue.length === 0) return;

        // Load one chunk from queue
        const task = this.loadQueue.shift();
        this.loadChunk(task.chunkX, task.chunkZ, task.chunkKey, task.hasPhysics);
    }

    updateChunks(centerChunkX, centerChunkZ) {
        const chunksToKeep = new Set();

        // 1. Determine which chunks SHOULD be active
        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                const chunkX = centerChunkX + x;
                const chunkZ = centerChunkZ + z;
                const chunkKey = `${chunkX},${chunkZ}`;
                chunksToKeep.add(chunkKey);

                // Is it within physics distance?
                const hasPhysics = (Math.abs(x) <= this.physicsDistance && Math.abs(z) <= this.physicsDistance);

                if (!this.activeChunks.has(chunkKey)) {
                    // Check if already in queue
                    if (!this.loadQueue.find(q => q.chunkKey === chunkKey)) {
                        this.loadQueue.push({ chunkX, chunkZ, chunkKey, hasPhysics });
                    }
                } else {
                    // Update existing chunk's physics state if needed
                    const chunk = this.activeChunks.get(chunkKey);
                    this.updateChunkPhysics(chunk, hasPhysics);
                }
            }
        }

        // Sort queue by distance from center so closest chunks load first!
        this.loadQueue.sort((a, b) => {
            const distA = Math.abs(a.chunkX - centerChunkX) + Math.abs(a.chunkZ - centerChunkZ);
            const distB = Math.abs(b.chunkX - centerChunkX) + Math.abs(b.chunkZ - centerChunkZ);
            return distA - distB;
        });

        // 2. Unload chunks that are too far
        for (const [chunkKey, chunk] of this.activeChunks.entries()) {
            if (!chunksToKeep.has(chunkKey)) {
                this.unloadChunk(chunkKey, chunk);
            }
        }
    }

    loadChunk(chunkX, chunkZ, chunkKey, hasPhysics) {
        const startX = chunkX * this.chunkSize;
        const startZ = chunkZ * this.chunkSize;

        // Let CityGenerator spawn objects for this specific 100x100 area
        const chunkData = this.cityGenerator.generateChunk(startX, startZ, this.chunkSize, hasPhysics);
        chunkData.hasPhysics = hasPhysics;

        this.activeChunks.set(chunkKey, chunkData);
    }

    updateChunkPhysics(chunk, needsPhysics) {
        if (chunk.hasPhysics === needsPhysics) return;

        if (needsPhysics) {
            // Add bodies to world
            chunk.physicsBodies.forEach(body => this.world.addBody(body));
        } else {
            // Remove bodies from world
            chunk.physicsBodies.forEach(body => this.world.removeBody(body));
        }
        chunk.hasPhysics = needsPhysics;
    }

    unloadChunk(chunkKey, chunk) {
        // Remove physics
        if (chunk.hasPhysics) {
            chunk.physicsBodies.forEach(body => this.world.removeBody(body));
        }

        // The graphics for procedural buildings are part of InstancedMeshes and are handled 
        // separately by updating the instance matrices in CityGenerator. 
        // We tell CityGenerator to remove or hide this chunk's instances.
        this.cityGenerator.unloadChunkGraphics(chunk);

        this.activeChunks.delete(chunkKey);
    }
}
