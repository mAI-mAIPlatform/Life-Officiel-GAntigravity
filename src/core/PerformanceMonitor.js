export class PerformanceMonitor {
    constructor(renderer) {
        this.renderer = renderer;
        this.isActive = false;

        // Statistics
        this.frames = 0;
        this.prevTime = performance.now();
        this.fps = 0;

        // Create UI
        this.container = document.createElement('div');
        this.container.id = 'performance-monitor';
        this.container.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.8);
            color: #00FF80;
            font-family: monospace;
            font-size: 12px;
            padding: 10px;
            border: 1px solid rgba(0, 255, 128, 0.5);
            border-radius: 8px;
            z-index: 9999;
            pointer-events: none;
            display: none;
            min-width: 150px;
        `;

        this.fpsDisplay = document.createElement('div');
        this.memoryDisplay = document.createElement('div');
        this.drawCallsDisplay = document.createElement('div');
        this.geometriesDisplay = document.createElement('div');
        this.texturesDisplay = document.createElement('div');

        this.container.appendChild(this.fpsDisplay);
        this.container.appendChild(this.memoryDisplay);
        this.container.appendChild(this.drawCallsDisplay);
        this.container.appendChild(this.geometriesDisplay);
        this.container.appendChild(this.texturesDisplay);

        document.body.appendChild(this.container);
    }

    toggle() {
        this.isActive = !this.isActive;
        this.container.style.display = this.isActive ? 'block' : 'none';
    }

    update() {
        // Calculate FPS
        this.frames++;
        const time = performance.now();
        if (time >= this.prevTime + 1000) {
            this.fps = (this.frames * 1000) / (time - this.prevTime);
            this.prevTime = time;
            this.frames = 0;

            if (this.isActive) {
                this.updateUI();
            }
        }
    }

    updateUI() {
        this.fpsDisplay.innerText = `FPS: ${Math.round(this.fps)}`;

        // Memory (Only available in some browsers like Chrome)
        if (performance.memory) {
            const memoryUsed = Math.round(performance.memory.usedJSHeapSize / 1048576);
            const memoryLimit = Math.round(performance.memory.jsHeapSizeLimit / 1048576);
            this.memoryDisplay.innerText = `MEM: ${memoryUsed}MB / ${memoryLimit}MB`;
        } else {
            this.memoryDisplay.innerText = `MEM: N/A`;
        }

        // Three.js specific stats
        if (this.renderer) {
            this.drawCallsDisplay.innerText = `Draw Calls: ${this.renderer.info.render.calls}`;
            this.geometriesDisplay.innerText = `Geometries: ${this.renderer.info.memory.geometries}`;
            this.texturesDisplay.innerText = `Textures: ${this.renderer.info.memory.textures}`;
        }
    }
}
