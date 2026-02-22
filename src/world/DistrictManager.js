export class DistrictManager {
    constructor(scene, world, assets) {
        this.scene = scene;
        this.world = world;
        this.assets = assets;

        this.districtSize = 200; // Size of a chunk in meters
        this.renderDistance = 1; // Load 1 chunk in every direction (3x3 grid)

        this.activeDistricts = new Map(); // key: "x,z", value: { instance, loaded: boolean }
        this.currentGridX = null;
        this.currentGridZ = null;
    }

    async loadDistrict(gridX, gridZ) {
        const key = `${gridX},${gridZ}`;
        if (this.activeDistricts.has(key)) return;

        // Mark as loading to avoid duplicate requests
        this.activeDistricts.set(key, { loaded: false });

        try {
            // Lazy load the district module
            // This allows Vite to code-split these files into separate chunk files
            const module = await import('./districts/DistrictGenerator.js');

            // If the player moved entirely out of the zone during loading, cancel
            if (!this.activeDistricts.has(key)) return;

            const districtInstance = new module.DistrictGenerator(this.scene, this.world, this.assets, gridX, gridZ, this.districtSize);

            // Save loaded district
            this.activeDistricts.set(key, {
                loaded: true,
                instance: districtInstance
            });

            console.log(`[World] Loaded District ${key}`);
        } catch (error) {
            console.error(`Failed to load district ${key}:`, error);
            this.activeDistricts.delete(key);
        }
    }

    unloadDistrict(gridX, gridZ) {
        const key = `${gridX},${gridZ}`;
        const district = this.activeDistricts.get(key);

        if (district && district.loaded && district.instance) {
            district.instance.dispose();
            console.log(`[World] Unloaded District ${key}`);
        }

        this.activeDistricts.delete(key);
    }

    update(playerPosition) {
        const gridX = Math.floor(playerPosition.x / this.districtSize);
        const gridZ = Math.floor(playerPosition.z / this.districtSize);

        // Only update loading if we changed grid cell
        if (this.currentGridX === gridX && this.currentGridZ === gridZ) return;

        this.currentGridX = gridX;
        this.currentGridZ = gridZ;

        // Determine required chunks
        const requiredChunks = new Set();
        for (let x = -this.renderDistance; x <= this.renderDistance; x++) {
            for (let z = -this.renderDistance; z <= this.renderDistance; z++) {
                requiredChunks.add(`${gridX + x},${gridZ + z}`);
            }
        }

        // Unload chunks that are out of bounds
        for (const key of this.activeDistricts.keys()) {
            if (!requiredChunks.has(key)) {
                const [cx, cz] = key.split(',').map(Number);
                this.unloadDistrict(cx, cz);
            }
        }

        // Load new required chunks
        for (const key of requiredChunks) {
            if (!this.activeDistricts.has(key)) {
                const [cx, cz] = key.split(',').map(Number);
                this.loadDistrict(cx, cz);
            }
        }
    }
}
