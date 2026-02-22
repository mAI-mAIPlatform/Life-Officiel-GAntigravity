import { Vehicle } from '../../entities/Vehicle.js';
import * as THREE from 'three';

export class AppVehicles {
    constructor(engine) {
        this.engine = engine;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'w-full h-full bg-gray-900 overflow-y-auto pb-20';

        const hasMoto = this.engine.saveManager && this.engine.saveManager.state.player.inventory.includes('asset_50');

        container.innerHTML = `
            <div class="sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md p-4 border-b border-gray-800">
                <h2 class="text-xl font-black text-white px-2 tracking-tighter">Mes <span class="text-green-500">Véhicules</span></h2>
            </div>
            
            <div class="p-4 space-y-4">
                <div class="bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
                    <div class="flex items-center gap-3 mb-2">
                        <div class="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-green-400 text-2xl">🏍️</div>
                        <div>
                            <h4 class="font-bold text-white text-lg leading-tight">Moto Légendaire</h4>
                            <p class="text-[10px] text-gray-400 uppercase tracking-widest">Asset 50 - Vitesse Max</p>
                        </div>
                    </div>
                    ${hasMoto
                ? `<button id="btn-spawn-moto" class="w-full mt-3 py-3 bg-neonGreen hover:bg-green-400 text-black font-black uppercase rounded-lg shadow-[0_0_15px_rgba(0,255,128,0.4)] transition-all">Appeler le Véhicule</button>`
                : `<div class="w-full mt-3 py-3 bg-gray-700/50 text-gray-500 font-bold uppercase rounded-lg text-center text-xs">Débloqué au Niv. 50 (Pass de Combat)</div>`}
                </div>
                
                <p class="text-xs text-center text-gray-500 mt-4 px-4">Utilisez cette application pour faire spawn vos véhicules débloqués directement à votre position.</p>
            </div>
        `;

        if (hasMoto) {
            setTimeout(() => {
                const btn = document.getElementById('btn-spawn-moto');
                if (btn) {
                    btn.addEventListener('click', () => {
                        this.spawnMotorcycle();
                    });
                }
            }, 10);
        }

        return container;
    }

    spawnMotorcycle() {
        if (!this.engine.assets['50asset.glb']) {
            console.warn("Asset 50 non chargé");
            // Simulate spawn anyway if model missing for debug purposes
        }

        // Supprimer l'ancien véhicule actif si on en redemande un
        if (window.activeVehicle) {
            window.activeVehicle.tryEnterOrExit(); // force exit
            if (window.activeVehicle && window.activeVehicle.meshGroup) {
                this.engine.scene.remove(window.activeVehicle.meshGroup);
            }
        }

        // Spawn le véhicule devant le joueur
        const spawnPos = this.engine.player.mesh.position.clone();

        const forward = new THREE.Vector3(0, 0, -1);
        forward.applyEuler(this.engine.player.mesh.rotation);
        spawnPos.add(forward.multiplyScalar(4)); // 4m devant
        spawnPos.y += 2; // un peu en l'air pour drop

        const vehicleModel = this.engine.assets['50asset.glb'] || null;

        const newBike = new Vehicle(
            this.engine.scene,
            this.engine.world,
            this.engine.player,
            this.engine.camera,
            'bike',
            spawnPos,
            vehicleModel
        );

        // On rend le Player propriétaire
        this.engine.mPhoneManager.closeApp();
        this.engine.mPhoneManager.togglePhone();

        // Add a nice UI notification
        const interactUI = document.getElementById('interact-ui');
        if (interactUI) {
            interactUI.innerHTML = `<span class="text-neonGreen font-bold">Moto Légendaire Livrée</span>`;
            interactUI.classList.remove('opacity-0', 'hidden');
            setTimeout(() => {
                interactUI.classList.add('opacity-0');
            }, 3000);
        }
    }
}
