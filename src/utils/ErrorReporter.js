export class ErrorReporter {
    constructor() {
        this.container = null;
        this.initUI();
        this.listenToErrors();
    }

    initUI() {
        // Supprimer l'ancien s'il existe
        this.container = document.getElementById('error-reporter-container');
        if (this.container) return;

        this.container = document.createElement('div');
        this.container.id = 'error-reporter-container';
        this.container.className = 'fixed top-4 left-4 z-[9999] flex flex-col gap-2 pointer-events-none max-w-md';
        document.body.appendChild(this.container);
    }

    listenToErrors() {
        // Intercepter window.onerror
        window.onerror = (message, source, lineno, colno, error) => {
            this.showError(`Code Error: ${message}`, `${source}:${lineno}`);
            return false;
        };

        window.onunhandledrejection = (event) => {
            this.showError(`Promise Fail: ${event.reason}`, 'Async operation failed');
        };

        // Intercepter console.error
        const originalError = console.error;
        console.error = (...args) => {
            this.showError("Console Error", args.join(' '));
            originalError.apply(console, args);
        };

        // Intercepter console.warn
        const originalWarn = console.warn;
        console.warn = (...args) => {
            const msg = args.join(' ');
            if (msg.includes('THREE') || msg.includes('CANNON') || msg.includes('Asset')) {
                this.showError("Engine Warning", msg);
            }
            originalWarn.apply(console, args);
        };
    }

    showError(title, subtitle) {
        if (!this.container) this.initUI();

        const toast = document.createElement('div');
        toast.className = 'bg-red-950/90 border border-red-500/50 p-4 rounded-xl shadow-[0_0_20px_rgba(255,0,0,0.3)] backdrop-blur-md transform transition-all translate-x-[-110%] pointer-events-auto cursor-pointer';

        toast.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shrink-0 font-bold text-xs underline">!</div>
                <div class="overflow-hidden">
                    <h4 class="text-white font-bold text-sm uppercase tracking-wider truncate">${title}</h4>
                    <p class="text-red-300 text-[10px] font-mono mt-1 opacity-70 break-all line-clamp-2">${subtitle}</p>
                </div>
            </div>
        `;

        toast.onclick = () => {
            toast.classList.add('opacity-0', 'scale-90');
            setTimeout(() => toast.remove(), 300);
        };

        this.container.appendChild(toast);

        // Animation d'entrée
        requestAnimationFrame(() => {
            toast.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            toast.classList.remove('translate-x-[-110%]');
            toast.classList.add('translate-x-0');
        });

        // Auto-suppression après 10 secondes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.classList.add('opacity-0', 'scale-90', 'translate-x-[-20px]');
                setTimeout(() => toast.remove(), 400);
            }
        }, 12000);
    }
}
