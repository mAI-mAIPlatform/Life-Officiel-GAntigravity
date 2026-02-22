export class mOSManager {
    constructor() {
        this.isOpen = false;
        this.mosUI = document.getElementById('mos-container');
        this.mapBtn = document.getElementById('map-app-btn');
        this.mapOverlay = document.getElementById('map-overlay');
        this.closeMapBtn = document.getElementById('close-map-btn');

        // Ensure UI exists before adding listeners
        if (this.mosUI) {
            document.addEventListener('keydown', (e) => this.onKeyDown(e));
        }

        if (this.mapBtn && this.mapOverlay && this.closeMapBtn) {
            this.mapBtn.addEventListener('click', () => {
                this.mapOverlay.classList.remove('hidden');
                // timeout to allow display:block to apply before animating opacity
                setTimeout(() => this.mapOverlay.classList.remove('opacity-0'), 10);
            });

            this.closeMapBtn.addEventListener('click', () => {
                this.mapOverlay.classList.add('opacity-0');
                setTimeout(() => this.mapOverlay.classList.add('hidden'), 300);
            });
        }
    }

    onKeyDown(event) {
        // Appuyez sur 'M' ou 'Tab' pour ouvrir le mOS (Mobile Operating System)
        if (event.code === 'KeyM' || event.code === 'Tab') {
            event.preventDefault(); // Prevents Tab from focusing browser elements
            this.toggleMOS();
        }
    }

    toggleMOS() {
        this.isOpen = !this.isOpen;

        if (this.isOpen) {
            // Ouvrir avec un bel effet d'hologramme montant (Tailwind)
            this.mosUI.classList.remove('translate-y-[120%]', 'opacity-0', 'scale-90', 'pointer-events-none');
            this.mosUI.classList.add('translate-y-0', 'opacity-100', 'scale-100', 'pointer-events-auto');
        } else {
            // Fermer vers le bas
            this.mosUI.classList.remove('translate-y-0', 'opacity-100', 'scale-100', 'pointer-events-auto');
            this.mosUI.classList.add('translate-y-[120%]', 'opacity-0', 'scale-90', 'pointer-events-none');
        }
    }
}
