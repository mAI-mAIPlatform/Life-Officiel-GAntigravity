import * as THREE from 'three';

export class LODManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.lods = [];
    }

    createLODObject(highResMesh, lowResMesh, distanceThreshold = 50) {
        const lod = new THREE.LOD();

        // Add levels: Level 0 (closest) is high-res, Level 1 (further) is low-res
        lod.addLevel(highResMesh, 0);

        // Optional: Can add a dummy empty object or lower res for distant rendering
        if (lowResMesh) {
            lod.addLevel(lowResMesh, distanceThreshold);
        } else {
            // Invisible if very far to save draw calls
            lod.addLevel(new THREE.Object3D(), distanceThreshold * 2);
        }

        this.scene.add(lod);
        this.lods.push(lod);

        return lod;
    }

    update() {
        // Evaluate LODs based on the camera position
        for (let i = 0; i < this.lods.length; i++) {
            this.lods[i].update(this.camera);
        }
    }
}
