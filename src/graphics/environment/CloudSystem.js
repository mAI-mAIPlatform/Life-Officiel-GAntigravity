import * as THREE from 'three';

export class CloudSystem {
    constructor(scene) {
        this.scene = scene;
        this.clouds = [];
        this.init();
    }

    init() {
        const geo = new THREE.PlaneGeometry(300, 300);
        // Utilise un basic material avec opacity pour pseudo-nuages pas chers
        const mat = new THREE.MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.1,
            side: THREE.DoubleSide
        });

        for (let i = 0; i < 5; i++) {
            const cloud = new THREE.Mesh(geo, mat);
            cloud.rotation.x = -Math.PI / 2;
            cloud.position.set(
                (Math.random() - 0.5) * 1000,
                150 + Math.random() * 50,
                (Math.random() - 0.5) * 1000
            );
            this.scene.add(cloud);
            this.clouds.push(cloud);
        }
    }

    update(time, windVector) {
        this.clouds.forEach(cloud => {
            // Translate slowly relative to wind
            cloud.position.x += windVector.x * 2;
            cloud.position.z += windVector.z * 2;

            if (cloud.position.x > 800) cloud.position.x = -800;
            if (cloud.position.z > 800) cloud.position.z = -800;
        });
    }
}
