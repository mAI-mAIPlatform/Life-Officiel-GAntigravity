export class AppMap {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'map';
        this.updateInterval = null;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'w-full h-full flex flex-col relative bg-gray-900';

        // Map Scale constants: Game world from -500 to 500 => Map size 300x300px
        const mapSize = 300;
        const worldSize = 1000;

        container.innerHTML = `
            <div class="px-4 py-3 z-10 bg-gray-900/90 backdrop-blur shadow-sm border-b border-gray-800 relative">
                <h3 class="font-black text-center text-white uppercase tracking-widest text-sm">Carte GPS Global</h3>
            </div>
            
            <div class="flex-1 relative overflow-hidden flex items-center justify-center p-4">
                <div id="interactive-map" class="relative w-[300px] h-[300px] bg-[#0c1a2e] rounded-xl overflow-hidden shadow-[0_0_20px_rgba(0,100,255,0.2)] border border-blue-500/30 cursor-crosshair">
                    
                    <!-- Grid background -->
                    <div class="absolute inset-0 opacity-20" style="background-image: linear-gradient(#3b82f6 1px, transparent 1px), linear-gradient(90deg, #3b82f6 1px, transparent 1px); background-size: 30px 30px;"></div>
                    
                    <!-- Waypoint Marker (hidden by default) -->
                    <div id="map-waypoint" class="absolute w-3 h-3 bg-red-500 rounded-full border border-white shadow-[0_0_10px_red] transform -translate-x-1/2 -translate-y-1/2 hidden z-10"></div>
                    
                    <!-- Player Dot -->
                    <div id="map-player-dot" class="absolute w-4 h-4 rounded-full border-2 border-white shadow-[0_0_15px_#00ffff] transform -translate-x-1/2 -translate-y-1/2 z-20 flex items-center justify-center transition-all duration-100 ease-linear">
                        <div class="w-full h-full bg-neonCyan rounded-full animate-ping absolute opacity-50"></div>
                        <div class="w-full h-full bg-neonCyan rounded-full relative"></div>
                        <!-- View direction indicator -->
                        <div id="map-player-dir" class="absolute w-0.5 h-3 bg-white -top-2 left-1/2 transform -translate-x-1/2 origin-bottom"></div>
                    </div>
                    
                    <!-- Static POIs mapped directly to mapSize -->
                    <div class="absolute text-[12px] transform -translate-x-1/2 -translate-y-1/2" style="left: ${((200 + 500) / worldSize) * mapSize}px; top: ${((80 + 500) / worldSize) * mapSize}px;" title="Hôpital">🏥</div>
                    <div class="absolute text-[12px] transform -translate-x-1/2 -translate-y-1/2" style="left: ${((350 + 500) / worldSize) * mapSize}px; top: ${((150 + 500) / worldSize) * mapSize}px;" title="Aéroport">✈️</div>
                    <div class="absolute text-[12px] transform -translate-x-1/2 -translate-y-1/2" style="left: ${((350 + 500) / worldSize) * mapSize}px; top: ${((-350 + 500) / worldSize) * mapSize}px;" title="Plage">🏖️</div>
                    <div class="absolute text-[12px] transform -translate-x-1/2 -translate-y-1/2" style="left: ${((-350 + 500) / worldSize) * mapSize}px; top: ${((-350 + 500) / worldSize) * mapSize}px;" title="Décharge">⚙️</div>
                    <div class="absolute text-[12px] transform -translate-x-1/2 -translate-y-1/2" style="left: ${((-50 + 500) / worldSize) * mapSize}px; top: ${((-200 + 500) / worldSize) * mapSize}px;" title="Armurerie">🔫</div>
                    <div class="absolute text-[12px] transform -translate-x-1/2 -translate-y-1/2" style="left: ${((70 + 500) / worldSize) * mapSize}px; top: ${((70 + 500) / worldSize) * mapSize}px;" title="Mairie">🏛️</div>
                </div>
            </div>
            
            <div class="p-4 text-center">
                <p class="text-xs text-gray-400 mb-2">Cliquez sur la carte pour définir un point de repère dynamique.</p>
                <div class="text-[10px] font-mono text-neonCyan flex justify-between px-4">
                    <span id="map-coord-x">X: 0</span>
                    <span id="map-coord-z">Z: 0</span>
                </div>
            </div>
        `;

        setTimeout(() => {
            const mapEl = document.getElementById('interactive-map');
            if (mapEl) {
                mapEl.addEventListener('click', (e) => {
                    const rect = mapEl.getBoundingClientRect();
                    const xMap = e.clientX - rect.left;
                    const yMap = e.clientY - rect.top;

                    // Convert to World coordinates
                    const worldX = (xMap / mapSize) * worldSize - 500;
                    const worldZ = (yMap / mapSize) * worldSize - 500;

                    // Place UI marker
                    const wp = document.getElementById('map-waypoint');
                    if (wp) {
                        wp.style.left = `${xMap}px`;
                        wp.style.top = `${yMap}px`;
                        wp.classList.remove('hidden');
                    }

                    // Send to Engine WaypointManager
                    if (this.engine.waypointManager) {
                        this.engine.waypointManager.setWaypoint(worldX, worldZ);
                    }
                });
            }
        }, 50);

        return container;
    }

    update() {
        if (!this.engine || !this.engine.player || !this.engine.player.mesh) return;

        const pX = this.engine.player.mesh.position.x;
        const pZ = this.engine.player.mesh.position.z;

        // Coordinates update
        document.getElementById('map-coord-x').innerText = `X: ${Math.round(pX)}`;
        document.getElementById('map-coord-z').innerText = `Z: ${Math.round(pZ)}`;

        const mapSize = 300;
        const worldSize = 1000;

        // Visual update on map
        const dot = document.getElementById('map-player-dot');
        if (dot) {
            const mapX = ((pX + 500) / worldSize) * mapSize;
            const mapZ = ((pZ + 500) / worldSize) * mapSize;

            // Limit dot rendering inside the app container
            dot.style.left = `${Math.max(0, Math.min(mapSize, mapX))}px`;
            dot.style.top = `${Math.max(0, Math.min(mapSize, mapZ))}px`;

            // Rotation of the view indicator
            const dir = document.getElementById('map-player-dir');
            if (dir) {
                // Determine rotation from player mesh
                const rotY = this.engine.player.mesh.rotation.y;
                // Subtract Math.PI because the camera looks down -Z by default
                const deg = (rotY * 180 / Math.PI) + 180;
                dir.style.transform = `translate(-50%, 0) rotate(${deg}deg)`;
            }
        }
    }
}
