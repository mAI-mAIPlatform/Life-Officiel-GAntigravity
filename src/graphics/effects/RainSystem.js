import * as THREE from 'three';

export class RainSystem {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.particleCount = 5000;
        this.isRaining = false;

        this.init();
    }

    init() {
        const geo = new THREE.BufferGeometry();
        const vertices = [];
        this.velocities = [];

        for (let i = 0; i < this.particleCount; i++) {
            vertices.push(
                Math.random() * 400 - 200,
                Math.random() * 200,
                Math.random() * 400 - 200
            );
            this.velocities.push(0);
        }

        geo.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

        const mat = new THREE.PointsMaterial({
            color: 0xaaccff,
            size: 0.1,
            transparent: true,
            opacity: 0.6
        });

        this.particles = new THREE.Points(geo, mat);
        this.particles.visible = false;
        this.scene.add(this.particles);
    }

    setRaining(state) {
        this.isRaining = state;
        if (this.particles) this.particles.visible = state;
    }

    update(deltaTime, windVector) {
        if (!this.isRaining || !this.particles) return;

        const positions = this.particles.geometry.attributes.position.array;

        // Make the rain box follow the camera slightly to simulate continuous rain
        this.particles.position.x = this.camera.position.x;
        this.particles.position.z = this.camera.position.z;

        for (let i = 0; i < this.particleCount; i++) {
            this.velocities[i] -= 0.1 + Math.random() * 0.1;
            positions[i * 3 + 1] += this.velocities[i]; // y

            // Add wind effect
            positions[i * 3] += windVector.x * deltaTime * 5;     // x
            positions[i * 3 + 2] += windVector.z * deltaTime * 5; // z

            if (positions[i * 3 + 1] < 0) {
                positions[i * 3 + 1] = 200;
                this.velocities[i] = 0;
                positions[i * 3] = Math.random() * 400 - 200;
                positions[i * 3 + 2] = Math.random() * 400 - 200;
            }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
