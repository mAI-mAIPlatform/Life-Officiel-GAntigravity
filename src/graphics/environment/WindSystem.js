import * as THREE from 'three';

export class WindSystem {
    constructor() {
        this.baseVector = new THREE.Vector3(0.5, 0, 0.2);
        this.currentVector = new THREE.Vector3();
    }

    update(time) {
        // Variation de vent sinusoïdale
        const strength = 1.0 + Math.sin(time * 0.5) * 0.5;
        this.currentVector.copy(this.baseVector).multiplyScalar(strength);
    }

    getWindVector() {
        return this.currentVector;
    }
}
