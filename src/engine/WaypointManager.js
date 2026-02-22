import * as THREE from 'three';

export class WaypointManager {
    constructor(engine) {
        this.engine = engine;
        this.activeWaypoint = null;
        this.beamMesh = null;

        this.initVisuals();
    }

    initVisuals() {
        // Create a tall glowing cylinder for the waypoint beam
        const geo = new THREE.CylinderGeometry(0.5, 0.5, 300, 16);
        // Translate geometry so origin is at bottom, not center
        geo.translate(0, 150, 0);

        const mat = new THREE.MeshBasicMaterial({
            color: 0x00FFFF,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        this.beamMesh = new THREE.Mesh(geo, mat);
        this.beamMesh.visible = false;

        // Add a pulsing point light at the base
        this.beamLight = new THREE.PointLight(0x00FFFF, 2, 50);
        this.beamMesh.add(this.beamLight);

        if (this.engine.scene) {
            this.engine.scene.add(this.beamMesh);
        }
    }

    setWaypoint(worldX, worldZ) {
        this.activeWaypoint = new THREE.Vector3(worldX, 0, worldZ);

        if (this.beamMesh) {
            this.beamMesh.position.set(worldX, 0, worldZ);
            this.beamMesh.visible = true;
        }

        // Flash interaction UI to inform user
        const interactUI = document.getElementById('interact-ui');
        if (interactUI) {
            interactUI.innerHTML = `<span class="text-neonCyan font-bold">Waypoint Défini : X:${Math.round(worldX)} Z:${Math.round(worldZ)}</span>`;
            interactUI.classList.remove('opacity-0', 'hidden');
            setTimeout(() => {
                interactUI.classList.add('opacity-0');
            }, 3000);
        }
    }

    clearWaypoint() {
        this.activeWaypoint = null;
        if (this.beamMesh) {
            this.beamMesh.visible = false;
        }
    }

    update(deltaTime) {
        if (!this.activeWaypoint || !this.beamMesh) return;

        // Animate beam
        this.beamMesh.rotation.y += deltaTime * 2;
        this.beamMesh.material.opacity = 0.4 + Math.sin(Date.now() * 0.005) * 0.2;
    }
}
