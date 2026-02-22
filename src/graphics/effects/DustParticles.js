import * as THREE from 'three';

export class DustParticles {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.count = 2000;

        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        this.phases = [];

        for (let i = 0; i < this.count; i++) {
            vertices.push(
                (Math.random() - 0.5) * 100,
                Math.random() * 20,
                (Math.random() - 0.5) * 100
            );
            this.phases.push(Math.random() * Math.PI * 2);
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const material = new THREE.PointsMaterial({
            color: 0xffeebb,
            size: 0.1,
            transparent: true,
            opacity: 0.3,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.mesh = new THREE.Points(geometry, material);
        this.scene.add(this.mesh);
    }

    update(deltaTime, windVector) {
        if (!this.mesh) return;

        // Particles move smoothly around camera
        this.mesh.position.set(this.camera.position.x, 0, this.camera.position.z);

        const positions = this.mesh.geometry.attributes.position.array;

        for (let i = 0; i < this.count; i++) {
            this.phases[i] += deltaTime * 0.5;
            // Float around
            positions[i * 3] += Math.sin(this.phases[i]) * 0.01 + (windVector.x * deltaTime);
            positions[i * 3 + 1] += Math.cos(this.phases[i]) * 0.01;
            positions[i * 3 + 2] += Math.sin(this.phases[i] * 0.8) * 0.01 + (windVector.z * deltaTime);

            // Loop in local space
            if (positions[i * 3] > 50) positions[i * 3] = -50;
            if (positions[i * 3] < -50) positions[i * 3] = 50;
            if (positions[i * 3 + 2] > 50) positions[i * 3 + 2] = -50;
            if (positions[i * 3 + 2] < -50) positions[i * 3 + 2] = 50;
        }
        this.mesh.geometry.attributes.position.needsUpdate = true;
    }
}
