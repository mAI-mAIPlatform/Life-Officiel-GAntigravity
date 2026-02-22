export class WeaponShopUI {
    constructor(engine) {
        this.engine = engine;
        this.isOpen = false;

        this.weapons = [
            { id: '35asset.glb', name: 'Batte de Baseball Synthétique', price: 100, type: 'melee', damage: 15 },
            { id: '36asset.glb', name: 'Couteau Thermique', price: 150, type: 'melee', damage: 25 },
            { id: '37asset.glb', name: 'Katana Néon', price: 500, type: 'melee', damage: 50 },
            { id: '38asset.glb', name: 'Pistolet Laser Type-1', price: 800, type: 'ranged', damage: 30 },
            { id: '39asset.glb', name: 'Pistolet Lourd', price: 1200, type: 'ranged', damage: 45 },
            { id: '40asset.glb', name: 'Fusil d\'Assaut Standard', price: 2500, type: 'ranged', damage: 60 },
            { id: '41asset.glb', name: 'Mitraillette Légère', price: 1800, type: 'ranged', damage: 40 },
            { id: '42asset.glb', name: 'Fusil à Pompe Tactique', price: 3000, type: 'ranged', damage: 80 },
            { id: '43asset.glb', name: 'Sniper Magnétique', price: 5000, type: 'ranged', damage: 120 },
            { id: '44asset.glb', name: 'Lance-Grenades', price: 6500, type: 'ranged', damage: 150 },
            { id: '45asset.glb', name: 'Gatling Laser', price: 10000, type: 'ranged', damage: 200 },
            { id: '46asset.glb', name: 'Épée Plasma Lourde', price: 7500, type: 'melee', damage: 100 },
            { id: '47asset.glb', name: 'Hache Cybétique', price: 4000, type: 'melee', damage: 85 },
            { id: '48asset.glb', name: 'Revolver Plasma', price: 2200, type: 'ranged', damage: 65 },
            { id: '49asset.glb', name: 'Canon à Rayons BFG', price: 15000, type: 'ranged', damage: 500 }
        ];

        this.initDOM();
    }

    initDOM() {
        this.container = document.createElement('div');
        this.container.id = 'weapon-shop-overlay';
        this.container.className = 'fixed inset-0 z-[200] bg-black/80 backdrop-blur-md flex items-center justify-center opacity-0 pointer-events-none transition-opacity duration-300';

        let gridHtml = '';
        this.weapons.forEach(w => {
            gridHtml += `
                <div class="bg-gray-900 border border-red-500/30 p-4 rounded-xl flex flex-col items-center gap-3 hover:border-red-500 hover:shadow-[0_0_15px_rgba(255,0,0,0.4)] transition-all">
                    <div class="w-16 h-16 bg-black rounded-lg flex items-center justify-center text-red-500">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </div>
                    <div class="text-center">
                        <div class="text-white font-bold text-sm uppercase">${w.name}</div>
                        <div class="text-red-400 text-xs">Dégâts: ${w.damage} (${w.type})</div>
                    </div>
                    <button onclick="window.buyWeapon('${w.id}', ${w.price})" class="mt-auto w-full py-2 bg-red-600 hover:bg-red-500 text-white font-black text-sm uppercase rounded shadow-[0_0_10px_#ff0000]">
                        Acheter - ${w.price} m's
                    </button>
                </div>
            `;
        });

        this.container.innerHTML = `
            <div class="bg-gray-950 border-2 border-red-600 w-[90%] max-w-5xl h-[80%] rounded-3xl p-8 flex flex-col relative shadow-[0_0_50px_rgba(255,0,0,0.2)]">
                <button id="close-weapon-shop" class="absolute top-6 right-6 text-gray-400 hover:text-white">
                    <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
                
                <h2 class="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-orange-500 uppercase tracking-widest mb-2">Armurerie Rex</h2>
                <p class="text-red-400/80 mb-8 border-b border-red-900/50 pb-4">Artillerie lourde et corps à corps. Tout est garanti sans traçage mCompany.</p>
                
                <div class="flex-1 overflow-y-auto hide-scrollbar">
                    <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        ${gridHtml}
                    </div>
                </div>
                
                <div class="mt-6 flex justify-between items-center text-white border-t border-red-900/50 pt-4">
                    <div class="font-bold">Crédits actuels : <span id="weapon-shop-credits" class="text-neonCyan">0</span> m's</div>
                </div>
            </div>
        `;

        document.body.appendChild(this.container);

        document.getElementById('close-weapon-shop').addEventListener('click', () => {
            this.close();
        });

        window.buyWeapon = (id, price) => {
            if (this.engine && this.engine.saveManager) {
                const sm = this.engine.saveManager;
                if (sm.state.player.inventory.includes(id)) {
                    alert("Tu possèdes déjà cette arme !");
                    return;
                }
                if (sm.spendCredits(price)) {
                    sm.addToInventory(id);
                    alert("Arme achetée !");
                    this.updateCreditsUI();
                } else {
                    alert("Pas assez de crédits m's !");
                }
            }
        };
    }

    open() {
        this.isOpen = true;
        this.container.classList.remove('opacity-0', 'pointer-events-none');
        this.updateCreditsUI();
        if (this.engine.player) this.engine.player.canMove = false;

        // Hide interactions temporarily
        const interactUI = document.getElementById('interact-ui');
        if (interactUI) interactUI.classList.add('hidden');
    }

    close() {
        this.isOpen = false;
        this.container.classList.add('opacity-0', 'pointer-events-none');
        if (this.engine.player && !this.engine.menuManager.isMenuOpen) {
            this.engine.player.canMove = true;

            const interactUI = document.getElementById('interact-ui');
            if (interactUI) interactUI.classList.remove('hidden');
        }
    }

    updateCreditsUI() {
        if (this.engine && this.engine.saveManager) {
            const el = document.getElementById('weapon-shop-credits');
            if (el) el.innerText = this.engine.saveManager.state.player.credits;
        }
    }
}
