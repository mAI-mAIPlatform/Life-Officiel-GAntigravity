import * as THREE from 'three';

export class DynamicGI {
    constructor(scene) {
        this.scene = scene;
        // Faux GI : Hemisphere Light
        this.hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
        this.hemiLight.color.setHSL(0.6, 1, 0.6);
        this.hemiLight.groundColor.setHSL(0.095, 1, 0.75);
        this.hemiLight.position.set(0, 50, 0);
        this.scene.add(this.hemiLight);
    }

    updateColors(skyHex, groundHex) {
        this.hemiLight.color.setHex(skyHex);
        this.hemiLight.groundColor.setHex(groundHex);
    }
}
