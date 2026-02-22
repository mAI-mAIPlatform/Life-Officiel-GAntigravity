export class AppObjects {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'objects';
    }

    render() {
        const container = document.createElement('div');
        container.className = 'p-4';

        const state = this.engine.saveManager.state;
        const itemsInfo = `
            <div class="bg-indigo-100 rounded-lg p-3 mb-4 text-indigo-900 border border-indigo-200">
                <h4 class="font-bold border-b border-indigo-300 pb-1 mb-2">Missions Actives</h4>
                <p class="text-sm">${this.engine.questManager && this.engine.questManager.activeQuest ? this.engine.questManager.activeQuest.title : "Aucune mission en cours."}</p>
            </div>
            
            <div class="bg-white rounded-lg p-3 shadow-sm border border-gray-200">
                <h4 class="font-bold border-b pb-1 mb-2 text-gray-700">Votre Inventaire</h4>
                <ul class="text-sm space-y-2 text-gray-600">
                    <li class="flex justify-between"><span>Clés Voiture</span> <span class="text-blue-500 font-bold">1</span></li>
                    <li class="flex justify-between"><span>Life Pass (VIP)</span> <span class="text-blue-500 font-bold">1</span></li>
                    <li class="flex justify-between"><span>Snacks</span> <span class="text-orange-500 font-bold">3</span></li>
                </ul>
            </div>
        `;

        container.innerHTML = itemsInfo;
        return container;
    }
}
