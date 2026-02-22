import * as THREE from 'three';

export class ShadowManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Ultra by default, but scalable
    }

    applyQualitySetting(level) {
        if (level === 'Faible') {
            this.renderer.shadowMap.type = THREE.BasicShadowMap;
        } else if (level === 'Moyenne') {
            this.renderer.shadowMap.type = THREE.PCFShadowMap;
        } else {
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
    }
}
