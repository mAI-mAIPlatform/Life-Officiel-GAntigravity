export class AppBank {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'bank';
    }

    render() {
        const container = document.createElement('div');
        container.className = 'p-4 flex flex-col items-center justify-center h-full';

        const state = this.engine.saveManager.state;
        const credits = state.player.credits || 0;

        const html = `
            <div class="w-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-6">
                <!-- Décoration carte -->
                <div class="absolute -right-4 -bottom-4 w-24 h-24 bg-white opacity-10 rounded-full"></div>
                
                <h3 class="text-sm uppercase tracking-wider mb-1 opacity-80 font-semibold">Solde NeoBank</h3>
                <div class="text-4xl font-bold font-mono tracking-tight glow-text mb-4">
                    ${credits.toLocaleString()} <span class="text-xl text-green-200">m's</span>
                </div>
                
                <div class="flex justify-between text-xs opacity-75">
                    <span>Titulaire: ${state.player.username}</span>
                    <span>No. 4092 •••• 11</span>
                </div>
            </div>

            <div class="w-full grid grid-cols-2 gap-3">
                <button class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition text-sm">Virement</button>
                <button class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition text-sm">Historique</button>
                <button class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-3 rounded-xl transition text-sm col-span-2">Crypto NeoCoin (Bientôt)</button>
            </div>
        `;

        container.innerHTML = html;
        return container;
    }
}
