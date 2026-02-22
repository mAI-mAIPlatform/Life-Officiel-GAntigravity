export class AppStore {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'store';
    }

    render() {
        const container = document.createElement('div');
        container.className = 'p-2 flex flex-col space-y-3';

        const products = [
            { id: 'burger', name: 'NeoBurger XL', desc: 'Restaure +50 Faim', price: 25, icon: '🍔' },
            { id: 'repair_kit', name: 'Kit Réparation', desc: 'Répare un véhicule', price: 150, icon: '🔧' },
            { id: 'skin_vip', name: 'Skin Or VIP', desc: 'Cosmétique', price: 5000, icon: '✨' },
            { id: 'apartment', name: 'Appartement Base', desc: 'Zone Résidentielle', price: 25000, icon: '🏢' }
        ];

        let html = '<h3 class="font-bold text-center border-b pb-2 mb-2 text-gray-800">Boutique en ligne</h3>';

        products.forEach(p => {
            html += `
                <div class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm border border-gray-100 relative group overflow-hidden">
                    <div class="absolute left-0 top-0 h-full w-1 bg-yellow-400"></div>
                    <div class="flex items-center space-x-3 pl-2">
                        <span class="text-2xl">${p.icon}</span>
                        <div>
                            <h4 class="font-bold text-sm text-gray-800">${p.name}</h4>
                            <p class="text-[10px] text-gray-500">${p.desc}</p>
                        </div>
                    </div>
                    <button class="bg-gray-800 hover:bg-gray-900 text-yellow-400 font-bold py-1 px-3 rounded text-xs transition-colors shadow-sm" onclick="alert('Achat de ${p.name} en développement.')">
                        ${p.price.toLocaleString()} m's
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
        return container;
    }
}
