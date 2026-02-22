export class AppNews {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'news';

        this.articles = [
            {
                title: "MISE À JOUR v0.0.5 ALPHA. MPhone v2.0",
                date: "Aujourd'hui",
                content: "NeoCity s'agrandit ! L'IA des citoyens a été améliorée (plus de 100 nouvelles lignes de dialogue). Vous pouvez maintenant croiser des drones de livraison et des animaux de compagnie bizarres. Attention aussi aux coupures de courant et aux accidents de la route dynamiques. Restez prudents !",
                type: 'system' // Highlight special
            },
            {
                title: "Le Maire annonce la construction d'un nouveau quartier",
                date: "Hier",
                content: "Le Maire de NeoCity a officiellement coupé le ruban holographique pour le futur 'Quartier Synthétique'. Les loyers s'annoncent déjà hors de prix. mCompany se félicite de ce partenariat public-privé.",
                type: 'news'
            },
            {
                title: "Baisse des actions mCompany suite au scandale des bots",
                date: "Il y a 2 jours",
                content: "Des cas de 'stray_bot' (bots errants défectueux) se multiplient en centre-ville. Les experts pointent du doigt une mise à jour bâclée du firmware. Le titre mCompany a perdu 0.5% en bourse ce matin.",
                type: 'news'
            },
            {
                title: "Météo temporelle : Risque de pluies acides",
                date: "Alerte",
                content: "L'institut météorologique de NeoCity prévoit de légères précipitations corrosives dans les secteurs industriels. Sortez vos parapluies renforcés !",
                type: 'alert'
            }
        ];
    }

    render() {
        const container = document.createElement('div');
        container.className = 'w-full h-full bg-gray-900 overflow-y-auto pb-20';

        // Header
        const header = document.createElement('div');
        header.className = 'sticky top-0 z-10 bg-gray-900/90 backdrop-blur-md p-4 border-b border-gray-800 flex items-center justify-between';
        header.innerHTML = `
            <div>
                <h2 class="text-xl font-black text-white px-2 uppercase tracking-tighter">Neo<span class="text-blue-500">News</span></h2>
                <p class="text-[10px] text-gray-500 font-bold px-2 uppercase tracking-widest">L'information en temps réel</p>
            </div>
            <div class="w-8 h-8 rounded bg-blue-600/20 flex items-center justify-center">
                <span class="text-blue-500 animate-pulse">●</span>
            </div>
        `;
        container.appendChild(header);

        // Feed
        const feed = document.createElement('div');
        feed.className = 'p-4 space-y-4';

        this.articles.forEach(article => {
            let badgeClass = "bg-gray-800 text-gray-400";
            let badgeText = "NEWS";
            let borderClass = "border-gray-800";

            if (article.type === 'system') {
                badgeClass = "bg-neonCyan/20 text-neonCyan border border-neonCyan/50";
                badgeText = "SYSTÈME";
                borderClass = "border-neonCyan/30 shadow-[0_0_15px_rgba(0,255,255,0.1)]";
            } else if (article.type === 'alert') {
                badgeClass = "bg-red-500/20 text-red-500 border border-red-500/50";
                badgeText = "ALERTE";
                borderClass = "border-red-500/30";
            }

            const card = document.createElement('div');
            card.className = `p-4 rounded-2xl bg-gray-800/50 border ${borderClass} relative overflow-hidden`;

            card.innerHTML = `
                <div class="flex items-center justify-between mb-2">
                    <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-sm ${badgeClass}">${badgeText}</span>
                    <span class="text-[10px] text-gray-500 font-medium">${article.date}</span>
                </div>
                <h3 class="text-white font-bold leading-tight mb-2 text-sm">${article.title}</h3>
                <p class="text-xs text-gray-400 leading-relaxed">${article.content}</p>
            `;

            // Hover effect simple (JS au lieu de CSS pur pour éviter des conflits s'il y en a)
            card.addEventListener('mouseenter', () => card.classList.add('bg-gray-800'));
            card.addEventListener('mouseleave', () => card.classList.remove('bg-gray-800'));

            feed.appendChild(card);
        });

        // Add dynamically updated events to news?
        // On pourrait récupérer les events récents du EventManager ici si on voulait aller plus loin.

        container.appendChild(feed);
        return container;
    }

    addLiveNews(title, content, type = 'news') {
        const dateStr = window.game && window.game.saveManager ?
            `Jour ${window.game.saveManager.state.gameTime.day} - ${Math.floor(window.game.saveManager.state.gameTime.hours)}h` :
            "À l'instant";

        this.articles.unshift({
            title: title,
            date: dateStr,
            content: content,
            type: type
        });

        // Garder seulement les 15 dernières
        if (this.articles.length > 15) {
            this.articles.pop();
        }

        // Si l'app est ouverte, forcer un re-render visuel via le manager
        if (this.engine && this.engine.mPhoneManager && this.engine.mPhoneManager.currentApp === 'news') {
            this.engine.mPhoneManager.openApp('news');
        }
    }
}
