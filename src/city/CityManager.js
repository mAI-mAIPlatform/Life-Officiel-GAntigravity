import { DistrictCore } from './quartiers/districtCore/DistrictCore.js';

export class CityManager {
    constructor(scene, world) {
        this.scene = scene;
        this.world = world;
        this.districts = [];
        this.init();
    }

    init() {
        console.log("Initialisation du City Manager...");

        // Initialisation du premier quartier : District Core
        const districtCore = new DistrictCore(this.scene, this.world);
        districtCore.generate(0, 0); // Position centrale

        this.districts.push({
            name: "District Core",
            instance: districtCore
        });

        console.log("District Core coordonné et placé.");
    }

    update(deltaTime) {
        // Logique de mise à jour des quartiers si nécessaire
    }
}
