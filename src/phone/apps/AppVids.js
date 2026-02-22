export class AppVids {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'vids';
        this.lastUpdate = Date.now();
        this.followers = this.engine.saveManager.state.vidsFollowers || 0;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'w-full h-full flex flex-col items-center bg-gray-900 text-white pb-10'; // Dark mode

        let html = `
            <div class="w-full flex justify-between items-center p-3 border-b border-gray-800 bg-black">
                <span class="font-bold text-pink-500 tracking-wider">Vids</span>
                <span class="text-xs bg-gray-800 px-2 py-1 rounded-full"><span id="vids-followers" class="font-bold">${this.followers.toLocaleString()}</span> abonnés</span>
            </div>
            
            <div class="flex-1 w-full flex flex-col items-center justify-center p-4">
                <div class="w-full aspect-[9/16] bg-gray-800 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center border border-gray-700">
                    <!-- Simulacre de vidéo -->
                    <div class="absolute inset-0 bg-gradient-to-tr from-pink-500/20 to-purple-500/20 animate-pulse"></div>
                    <span class="text-4xl">📸</span>
                    <div class="absolute bottom-4 left-4">
                        <p class="font-bold text-sm shadow-black drop-shadow-md">@${this.engine.saveManager.state.player.username}</p>
                        <p class="text-xs opacity-80 shadow-black drop-shadow-md">Nouvelle vie à NeoCity ! 🌆 #Life #NeoCity</p>
                    </div>
                </div>
                
                <p class="text-[10px] text-gray-400 text-center px-4">
                    Vos algorithmes génèrent des abonnés hors ligne. 1 abonné virtuel = <span class="text-green-400 font-bold">100 m's</span> de revenus publicitaires potentiels.
                </p>
                <button id="vids-collect-btn" class="mt-4 bg-pink-600 hover:bg-pink-700 w-full py-3 rounded-xl font-bold transition shadow-lg shadow-pink-500/30">
                    Récolter les Revenus
                </button>
            </div>
        `;

        container.innerHTML = html;

        // Événement du bouton
        setTimeout(() => {
            const btn = document.getElementById('vids-collect-btn');
            if (btn) {
                btn.addEventListener('click', () => {
                    if (this.followers > 0) {
                        const gains = this.followers * 100;
                        this.engine.saveManager.addCredits(gains);
                        alert(`Vous avez récolté ${gains.toLocaleString()} m's via Vids !`);
                        this.followers = 0;
                        this.engine.saveManager.state.vidsFollowers = 0;
                        this.engine.saveManager.saveGame();
                        document.getElementById('vids-followers').innerText = '0';
                    } else {
                        alert("Aucun revenu à récolter pour le moment.");
                    }
                });
            }
        }, 100);

        return container;
    }

    // Call par mPhoneManager chaque seconde si l'app est ouverte
    update() {
        // Logique de followers passifs (1 follower gagné toutes les 30 sec)
        const now = Date.now();
        if (now - this.lastUpdate > 30000) {
            this.followers += Math.floor(Math.random() * 3) + 1;
            this.engine.saveManager.state.vidsFollowers = this.followers;
            this.lastUpdate = now;

            const span = document.getElementById('vids-followers');
            if (span) span.innerText = this.followers.toLocaleString();
        }
    }
}
