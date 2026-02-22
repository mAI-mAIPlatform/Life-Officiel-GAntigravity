import * as THREE from 'three';

export class FrustumCuller {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.frustum = new THREE.Frustum();
        this.projScreenMatrix = new THREE.Matrix4();
    }

    update() {
        // Standard three.js frustum culling happens automatically, 
        // This class is a placeholder for aggressive custom logic 
        // (like disabling animations or complex calculations for off-screen objects).

        this.camera.updateMatrixWorld();
        this.projScreenMatrix.multiplyMatrices(this.camera.projectionMatrix, this.camera.matrixWorldInverse);
        this.frustum.setFromProjectionMatrix(this.projScreenMatrix);
    }

    isObjectVisible(object) {
        if (!object.geometry) return true;

        if (object.geometry.boundingSphere === null) {
            object.geometry.computeBoundingSphere();
        }

        // Check standard frustum intersec
        return this.frustum.intersectsObject(object);
    }
}
