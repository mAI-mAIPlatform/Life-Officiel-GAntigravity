export class AppJobs {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'jobs';
    }

    render() {
        const container = document.createElement('div');
        container.className = 'p-3 flex flex-col';

        const state = this.engine.saveManager.state;
        const currentJob = state.player.job || 'Chômeur';

        let html = `
            <div class="bg-blue-600 text-white p-4 rounded-xl mb-4 shadow-md bg-opacity-90 backdrop-blur-sm">
                <p class="text-xs uppercase opacity-80 mb-1">Votre statut actuel</p>
                <div class="flex justify-between items-center">
                    <h2 class="text-xl font-bold capitalize">${currentJob.replace('_', ' ')}</h2>
                    <span class="bg-blue-800 px-2 py-1 rounded text-xs">Niveau ${state.player.level || 1}</span>
                </div>
            </div>
            
            <h3 class="font-bold text-sm text-gray-600 mb-2 px-1">Offres disponibles (NeoPole)</h3>
            <div class="space-y-2">
        `;

        const jobOffers = [
            { id: 'police', title: 'Forces de l\'Ordre', desc: 'Maintenir la paix', req: 'Niv 5', pay: '1200 m/j' },
            { id: 'cook', title: 'Cuisinier', desc: 'Restaurant', req: 'Niv 1', pay: '600 m/j' },
            { id: 'pilot', title: 'Pilote', desc: 'Vols régionaux', req: 'Niv 10', pay: '3500 m/j' },
            { id: 'doctor', title: 'Médecin Urgentiste', desc: 'Hôpital central', req: 'Niv 8', pay: '2500 m/j' },
        ];

        jobOffers.forEach(job => {
            const isCurrent = currentJob === job.id;
            html += `
                <div class="p-3 bg-white rounded-lg border ${isCurrent ? 'border-blue-500' : 'border-gray-200'} shadow-sm">
                    <div class="flex justify-between items-start mb-1">
                        <h4 class="font-bold text-gray-800">${job.title}</h4>
                        <span class="text-xs font-mono font-bold text-green-600">${job.pay}</span>
                    </div>
                    <p class="text-xs text-gray-500 mb-2">${job.desc}</p>
                    <div class="flex justify-between items-center mt-2 pt-2 border-t border-gray-100">
                        <span class="text-[10px] bg-gray-100 text-gray-600 px-2 py-1 rounded">Pré-requis: ${job.req}</span>
                        ${isCurrent
                    ? `<span class="text-xs text-blue-500 font-bold">Poste occupé</span>`
                    : `<button class="text-[10px] bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1 rounded transition" onclick="alert('Allez voir le recruteur en ville pour ce poste.')">Postuler</button>`
                }
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
        return container;
    }
}
