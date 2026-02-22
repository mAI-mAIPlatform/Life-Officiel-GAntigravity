export class mPhoneManager {
    constructor() {
        this.isOpen = false;
        this.container = document.getElementById('mphone-container');
        this.backBtn = document.getElementById('mphone-btn-back');
        this.homeBtn = document.getElementById('mphone-home-btn');
        this.appScreen = document.getElementById('mphone-app-screen');
        this.appContent = document.getElementById('mphone-app-content');
        this.appTitle = document.getElementById('mphone-app-title');
        this.timeDisplay = document.getElementById('mphone-time');

        this.apps = {}; // Registre des applications chargées
        this.currentApp = null; // Nom de l'appli courante

        this.initEventListeners();
    }

    initEventListeners() {
        // Touche 'P' pour ouvrir/fermer
        document.addEventListener('keydown', (e) => {
            if (e.code === 'KeyP') {
                this.togglePhone();
            }
        });

        // Clics sur les icônes d'apps
        const appIcons = document.querySelectorAll('.mphone-app-icon');
        appIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                const appName = e.target.getAttribute('data-app');
                if (appName) this.openApp(appName);
            });
        });

        // Bouton Retour
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => {
                this.closeApp();
            });
        }

        // Bouton Home (barre en bas)
        if (this.homeBtn) {
            this.homeBtn.addEventListener('click', () => {
                this.closeApp();
            });
        }
    }

    togglePhone() {
        // On ne l'ouvre que si le jeu est lancé (gameUI visible par exemple)
        const gameUI = document.getElementById('game-ui');
        if (gameUI && gameUI.classList.contains('hidden')) return;

        this.isOpen = !this.isOpen;
        if (this.container) {
            if (this.isOpen) {
                this.container.classList.remove('hidden');
                // Petit délai pour l'animation d'entrée
                setTimeout(() => {
                    this.container.classList.add('mphone-visible');
                    this.updateTimeFromEngine();
                }, 10);
            } else {
                this.container.classList.remove('mphone-visible');
                // Cacher après la transition
                setTimeout(() => {
                    this.container.classList.add('hidden');
                    this.closeApp(); // Revenir à l'accueil si on ferme le tel
                }, 500);
            }
        }
    }

    openApp(appName) {
        if (!this.appScreen || !this.appTitle) return;

        this.currentApp = appName;

        // Titre par défaut (peut être surchargé par l'app)
        const titles = {
            'map': 'Carte', 'objects': 'Inventaire', 'bank': 'NeoBank',
            'store': 'Store', 'jobs': 'Emplois', 'vids': 'Vids',
            'neohits': 'NeoHits', 'settings': 'Réglages'
        };
        this.appTitle.innerText = titles[appName] || appName;

        // Si l'application a été enregistrée avec son contenu HTML
        if (this.apps[appName] && typeof this.apps[appName].render === 'function') {
            this.appContent.innerHTML = '';
            const appDOM = this.apps[appName].render();
            if (appDOM) this.appContent.appendChild(appDOM);
        } else {
            this.appContent.innerHTML = `<div class="p-4 text-center text-gray-400">Application ${appName} en cours d'installation...</div>`;
        }

        // Animation Slide In
        this.appScreen.classList.remove('hidden');
        setTimeout(() => {
            this.appScreen.classList.remove('translate-x-full');
        }, 10);
    }

    closeApp() {
        if (!this.appScreen) return;
        this.currentApp = null;

        // Animation Slide Out
        this.appScreen.classList.add('translate-x-full');
        setTimeout(() => {
            if (!this.currentApp) {
                this.appScreen.classList.add('hidden');
                this.appContent.innerHTML = '';
            }
        }, 300);
    }

    registerApp(appName, appInstance) {
        this.apps[appName] = appInstance;
    }

    updateTimeFromEngine() {
        if (!window.game || !window.game.saveManager) return;
        const state = window.game.saveManager.state;
        if (!state || !state.gameTime) return;

        const date = new Date(); // Optionnel : utiliser gameTime
        const hh = Math.floor(state.gameTime.hours).toString().padStart(2, '0');
        const mm = Math.floor(state.gameTime.minutes).toString().padStart(2, '0');

        if (this.timeDisplay) {
            this.timeDisplay.innerText = `${hh}:${mm}`;
        }

        // Si Vids ou d'autres apps ont besoin d'être mis à jour dynamiquement pendant que l'écran est allumé
        if (this.currentApp && this.apps[this.currentApp] && typeof this.apps[this.currentApp].update === 'function') {
            this.apps[this.currentApp].update();
        }
    }
}
