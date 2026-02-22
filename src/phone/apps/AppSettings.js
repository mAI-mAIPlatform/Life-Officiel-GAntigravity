export class AppSettings {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'settings';
    }

    render() {
        const container = document.createElement('div');
        container.className = 'p-4';

        let html = `
            <h3 class="font-bold text-gray-800 mb-4 border-b pb-2 text-center">Réglages Système</h3>
            
            <div class="space-y-4">
                <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Graphismes</h4>
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-semibold text-gray-700">Qualité Ombres</span>
                        <select class="bg-gray-100 text-sm border-0 rounded px-2 py-1 outline-none text-gray-800">
                            <option>Faible</option>
                            <option selected>Moyenne</option>
                            <option>Haute</option>
                        </select>
                    </div>
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-semibold text-gray-700">Anti-Aliasing</span>
                        <input type="checkbox" checked class="w-4 h-4 text-blue-600 rounded focus:ring-blue-500">
                    </div>
                </div>

                <div class="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <h4 class="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Audio</h4>
                    <div class="mb-2">
                        <div class="flex justify-between text-xs mb-1 font-semibold text-gray-700"><span>Volume Principal</span><span>80%</span></div>
                        <input type="range" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    </div>
                    <div>
                        <div class="flex justify-between text-xs mb-1 font-semibold text-gray-700"><span>Musique (NeoHits)</span><span>50%</span></div>
                        <input type="range" class="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer">
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
        return container;
    }
}
