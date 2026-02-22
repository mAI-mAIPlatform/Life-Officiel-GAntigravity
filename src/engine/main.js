import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { SAOPass } from 'three/examples/jsm/postprocessing/SAOPass.js';
import * as CANNON from 'cannon-es';
import { Player } from '../entities/Player.js';
import { Vehicle } from '../entities/Vehicle.js';
import { NPCManager } from '../entities/NPCManager.js';
import { TrafficManager } from '../entities/TrafficManager.js';
import { WorldManager } from '../world/WorldManager.js';
import { InteriorManager } from '../world/InteriorManager.js';
import { LODManager } from '../graphics/LODManager.js';
import { mPhoneManager } from '../phone/mPhoneManager.js';
import { GraphicsManager } from '../graphics/GraphicsManager.js';
import { WaypointManager } from './WaypointManager.js';
import { EventManager } from './EventManager.js';
import { AudioManager } from './AudioManager.js';
import { AppObjects } from '../phone/apps/AppObjects.js';
import { AppBank } from '../phone/apps/AppBank.js';
import { AppStore } from '../phone/apps/AppStore.js';
import { AppJobs } from '../phone/apps/AppJobs.js';
import { AppMap } from '../phone/apps/AppMap.js';
import { AppSettings } from '../phone/apps/AppSettings.js';
import { AppVids } from '../phone/apps/AppVids.js';
import { AppNeoHits } from '../phone/apps/AppNeoHits.js';
import { AppNews } from '../phone/apps/AppNews.js';
import { AppVehicles } from '../phone/apps/AppVehicles.js';

import { GameLoop } from '../core/GameLoop.js';
import { PerformanceMonitor } from '../core/PerformanceMonitor.js';
import { CityGenerator } from '../world/CityGenerator.js';

// ---- GLOBAL ERROR HANDLERS ----
window.addEventListener('error', function (e) {
    alert(`Erreur système critique :\n${e.message}\nFichier: ${e.filename}\nLigne: ${e.lineno}`);
});
window.addEventListener('unhandledrejection', function (e) {
    alert(`Erreur système critique (Promesse) :\n${e.reason}`);
});
// -------------------------------

import { mOSManager } from './mOSManager.js';
import { QuestManager } from './QuestManager.js';
import { MenuManager } from './MenuManager.js';
import { InteractionManager } from './InteractionManager.js';
import { SaveManager } from './SaveManager.js';
import { WeaponShopUI } from '../ui/WeaponShopUI.js';

export class GameEngine {
    constructor() {
        this.gameStarted = false;
        this.assets = {}; // Stockage des modèles chargés
        this.loader = new GLTFLoader();
        this.fbxLoader = new FBXLoader();
        this.objLoader = new OBJLoader();

        // Setup UI Elements
        this.uiContainer = document.getElementById('ui-container');
        this.startBtn = document.getElementById('start-btn');
        this.gameContainer = document.getElementById('game-container');

        // Store Elements
        this.storeBtn = document.getElementById('open-store-btn');
        this.closeStoreBtn = document.getElementById('close-store-btn');
        this.storeModal = document.getElementById('store-modal');

        // Clock UI Elements
        this.clockDisplay = document.getElementById('world-clock-display');
        this.dayDisplay = document.getElementById('world-day-display');

        // Sub-systems
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.world = null;
        this.mixers = []; // For future animations
        this.gameLoop = null;
        this.stats = null;

        // Time System (1 in-game minute = 10 real seconds instead of 1 -> x6 time)
        this.timeSpeed = 6; // 6x faster than real life (1 real sec = 6 in-game seconds)

        // Managers
        this.saveManager = new SaveManager();
        console.log(`PIONEER_77 Loaded. Level: ${this.saveManager.state.player.level}, Credits: ${this.saveManager.state.player.credits} m's`);
        this.menuManager = new MenuManager();
        this.menuManager.setEngine(this);

        this.weaponShop = new WeaponShopUI(this);

        this.initUI();
    }

    initUI() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => {
                console.log('Game Started');
                this.startGame();
            });
        }

        const exitBtn = document.getElementById('exit-game-btn');
        if (exitBtn) {
            exitBtn.addEventListener('click', () => {
                this.exitGame();
            });
        }

        // F3 to toggle performance monitor
        window.addEventListener('keydown', (e) => {
            if (e.key === 'F3' && this.stats) {
                e.preventDefault();
                this.stats.toggle();
            }
        });

        this.loadAssets();
    }

    async loadAssets() {
        // Only load the absolute minimum needed to spawn the player and base environment
        const criticalAssets = [
            '1asset.glb', '2asset.glb', '3asset.glb', '4asset.glb',
            '5asset.glb', '6asset.glb', '7asset.glb', '8asset.glb',
            '9asset.glb', '10asset.glb', '11asset.glb', '13asset.gltf'
        ];

        // The rest loads gently in the background while the user plays
        this.secondaryAssets = [
            '14asset.gltf', '15asset.gltf', '16asset.gltf', '17asset.glb',
            '18asset.glb', '19asset.glb', '20asset.glb', '21asset.glb',
            '22asset.glb', '23asset.glb', '24asset.glb', '25asset.glb',
            '26asset.glb', '27asset.glb', '28asset.glb', '29asset.glb',
            '30asset.glb', '31asset.fbx', '32asset.glb', '33asset.glb',
            '34asset.obj', '35asset.fbx', '36asset.fbx', '37asset.fbx',
            '38asset.fbx', '39asset.fbx', '40asset.fbx', '41asset.fbx',
            '42asset.fbx', '43asset.fbx', '44asset.fbx', '45asset.fbx',
            '46asset.fbx', '47asset.fbx', '48asset.fbx', '49asset.fbx',
            '50asset.obj'
        ];

        let loadedCount = 0;
        const totalCritical = criticalAssets.length;

        const updateLoadingUI = () => {
            if (this.startBtn) {
                const percentage = Math.round((loadedCount / totalCritical) * 100);
                this.startBtn.innerHTML = `
                    <span class="relative z-10 flex items-center gap-3 uppercase tracking-widest break-words">
                        <svg class="w-8 h-8 text-neonCyan animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Chargement Initial... ${percentage}%
                    </span>
                    <div class="absolute inset-x-0 bottom-0 h-1 bg-neonCyan/20">
                        <div class="h-full bg-neonCyan transition-all duration-300" style="width: ${percentage}%"></div>
                    </div>
                `;
            }
        };

        const loadList = async (list) => {
            const CONCURRENCY_LIMIT = 4; // Max 4 concurrent workers
            let index = 0;

            const next = () => {
                if (index >= list.length) return Promise.resolve();
                const name = list[index++];

                return new Promise((resolve) => {
                    const fullPath = `/models/${name}`;
                    const onLoaded = (model) => {
                        this.assets[name] = model;
                        console.log(`Loaded: ${name}`);
                        loadedCount++;
                        updateLoadingUI();
                        resolve(next());
                    };
                    const onError = (e) => {
                        console.warn(`[SKIP] Missing ${name}:`, e);
                        loadedCount++;
                        updateLoadingUI();
                        resolve(next());
                    };

                    if (name.endsWith('.fbx')) {
                        this.fbxLoader.load(fullPath, (fbx) => {
                            fbx.scale.setScalar(0.01);
                            onLoaded(fbx);
                        }, undefined, onError);
                    } else if (name.endsWith('.obj')) {
                        this.objLoader.load(fullPath, (obj) => {
                            onLoaded(obj);
                        }, undefined, onError);
                    } else {
                        this.loader.load(fullPath, (gltf) => onLoaded(gltf.scene), undefined, onError);
                    }
                });
            };

            const workers = Array(CONCURRENCY_LIMIT).fill(0).map(() => next());
            return Promise.all(workers);
        };

        // Block start until criticals are done
        await loadList(criticalAssets);
        console.log("Critical Assets Loaded. Pre-initializing engine...");

        // Pre-initialize engine in background
        if (!this.engineInitialized) {
            this.initPhysics();
            this.initGraphics();
            this.createEnvironment();
            this.engineInitialized = true;
            window.addEventListener('resize', this.onWindowResize.bind(this));
            this.stats = new PerformanceMonitor(this.renderer);
            this.initGameLoop();

            // Force-load the first chunk immediately for an instant start
            if (this.worldManager && this.player) {
                // First pass to populate queue
                this.worldManager.update(0);
                // Force process at least the center chunk synchronously
                if (this.worldManager.chunkManager) {
                    this.worldManager.chunkManager.processQueue();
                }
            }
        }

        if (this.startBtn) {
            this.startBtn.innerText = "ENTRER DANS NEOCITY";
            this.startBtn.classList.remove('opacity-50', 'pointer-events-none');
        }

        // --- Start Background Loader for Secondary Assets DONT BLOCK ---
        this.startBackgroundLoader();
    }

    async startBackgroundLoader() {
        console.log("Starting background loading for secondary assets...");

        // Load one by one very slowly to absolutely crush any lag spike issue
        for (const name of this.secondaryAssets) {
            try {
                const fullPath = `/models/${name}`;
                await new Promise((resolve) => {
                    const onHit = (model) => {
                        this.assets[name] = model;
                        if (name.endsWith('.fbx')) model.scale.setScalar(0.01);

                        // Let CityGenerator know a new asset is available (lazy place)
                        if (this.cityGenerator) {
                            this.cityGenerator.onBackgroundAssetLoaded(name);
                        }
                        resolve();
                    };

                    if (name.endsWith('.fbx')) {
                        this.fbxLoader.load(fullPath, onHit, undefined, () => resolve());
                    } else if (name.endsWith('.obj')) {
                        this.objLoader.load(fullPath, onHit, undefined, () => resolve());
                    } else {
                        this.loader.load(fullPath, (g) => onHit(g.scene), undefined, () => resolve());
                    }
                });

                // Breath 100ms between each asset to let CPU breathe
                await new Promise(r => setTimeout(r, 100));
            } catch (e) {
                console.warn("Bg Load skip", name);
            }
        }
        console.log("Background Assets Finished.");
    }

    async startGame() {
        if (this.gameStarted) return;

        // Vérification de sécurité (Mot de passe) v0.0.2
        if (this.saveManager && this.saveManager.state.player.password) {
            const entry = prompt("Ce profil est verrouillé. Entrez votre mot de passe :");
            if (!this.saveManager.checkPassword(entry)) {
                alert("Mot de passe incorrect !");
                return;
            }
        }

        this.gameStarted = true;

        // Hide UI
        if (this.uiContainer) {
            this.uiContainer.classList.add('hidden');
        }

        // Show Game UI Layer
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.classList.remove('hidden');
        }

        const minimap = document.getElementById('minimap-container');
        if (minimap) minimap.classList.remove('hidden');

        // Snap camera immediately to avoid blue sky flash
        if (this.player && this.camera) {
            const playerPos = this.player.mesh.position;
            const cameraOffset = new THREE.Vector3(0, 6, 12);
            this.camera.position.copy(playerPos).add(cameraOffset);
            this.camera.lookAt(playerPos.x, playerPos.y + 2, playerPos.z);
            console.log("Camera snapped to player at:", playerPos);
        }

        // Logic sync
        this.onWindowResize();
        this.updateLogic(0);

        // Initial environment sync
        if (this.saveManager) {
            const t = this.saveManager.state.gameTime;
            this.updateEnvironmentColor(t.hours, t.minutes);
        }

        if (this.gameLoop) {
            try {
                this.gameLoop.start();
                console.log("Game loop started successfully.");
            } catch (e) {
                console.error("Failed to start game loop:", e);
                alert("Erreur critique au démarrage de la boucle de jeu.");
            }
        }

        // Force a first render
        if (this.graphicsManager) {
            this.graphicsManager.render();
        }

        // Bootstrapper les aventures
        if (this.saveManager && this.questManager) {
            const completed = this.saveManager.state.quests.completedQuests || [];
            if (!completed.includes("adv_intro") && !this.questManager.activeQuest) {
                this.questManager.startQuest("adv_intro");
            }
        }
    }

    exitGame() {
        if (!this.gameStarted) return;
        this.gameStarted = false;

        if (this.gameLoop) {
            this.gameLoop.stop();
        }

        // Save before quitting
        if (this.saveManager) {
            this.saveManager.saveGame();
        }

        // Show Menus
        if (this.uiContainer) {
            this.uiContainer.classList.remove('hidden');
        }

        // Hide Game UI
        const gameUI = document.getElementById('game-ui');
        if (gameUI) {
            gameUI.classList.add('hidden');
        }

        const minimap = document.getElementById('minimap-container');
        if (minimap) minimap.classList.add('hidden');

        // Switch back to Accueil Tab
        if (this.menuManager) {
            this.menuManager.switchTab('accueil');
            // Allow start button to continue rather than hard loading again
            if (this.startBtn) {
                this.startBtn.innerText = "RETOURNER EN VILLE";
            }
        }
    }

    initPhysics() {
        // Initialize Cannon.js World
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -9.81, 0), // Realistic gravity
        });
        this.world.broadphase = new CANNON.SAPBroadphase(this.world); // Optimization for many objects
        this.world.solver.iterations = 10;
        this.world.allowSleep = true; // Auto-sleep for rigid bodies
    }

    initGraphics() {
        // Initialize Three.js Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020205); // Initialize with default night charcoal color
        // Camera setup
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.camera.position.set(0, 5, 20); // Elevated view

        // Renderer setup
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for perf
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.VSMShadowMap; // Ultra realistic soft shadows (Variance Shadow Map)
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping; // Cinematic lighting
        this.renderer.toneMappingExposure = 1.2;

        // Global Lighting Setup
        this.ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(this.ambientLight);

        this.sunLight = new THREE.DirectionalLight(0xffffff, 1.5);
        this.sunLight.position.set(100, 200, 100);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 1000;
        this.sunLight.shadow.camera.left = -500;
        this.sunLight.shadow.camera.right = 500;
        this.sunLight.shadow.camera.top = 500;
        this.sunLight.shadow.camera.bottom = -500;
        this.scene.add(this.sunLight);

        this.gameContainer.appendChild(this.renderer.domElement);

        // Initialize modular advanced graphics
        this.graphicsManager = new GraphicsManager(this.scene, this.camera, this.renderer, this);

        // LOD Manager initialization
        this.lodManager = new LODManager(this.scene, this.camera);

        // --- Minimap Setup ---
        const minimapContainer = document.getElementById('minimap-container');
        if (minimapContainer) {
            this.minimapCamera = new THREE.OrthographicCamera(-60, 60, 60, -60, 0.1, 1000);
            this.minimapCamera.position.set(0, 150, 0);
            this.minimapCamera.lookAt(0, 0, 0);

            this.minimapRenderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
            this.minimapRenderer.setSize(192, 192); // 48 * 4 according to tailwind w-48
            minimapContainer.appendChild(this.minimapRenderer.domElement);
        }
    }

    createEnvironment() {
        // Simple Grid/Ground plane placeholder
        const groundGeo = new THREE.PlaneGeometry(1000, 1000);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x010103, // Black reflective tarmac
            roughness: 0.1,
            metalness: 0.9
        });
        const groundMesh = new THREE.Mesh(groundGeo, groundMat);
        groundMesh.rotation.x = -Math.PI / 2;
        groundMesh.receiveShadow = true;
        this.scene.add(groundMesh);

        // Create Physical Materials for better stability
        const groundPhysMat = new CANNON.Material('groundMaterial');
        const playerPhysMat = new CANNON.Material('playerMaterial');

        // Physical ground (using a very thick Box for extreme stability)
        const groundHeight = 10; // 10m thick to prevent tunneling
        const groundBody = new CANNON.Body({
            type: CANNON.Body.STATIC,
            shape: new CANNON.Box(new CANNON.Vec3(2000, groundHeight / 2, 2000)),
            position: new CANNON.Vec3(0, 0.05 - (groundHeight / 2), 0),
            material: groundPhysMat
        });
        this.world.addBody(groundBody);

        // Contact Material: define how player and ground interact
        const contactMat = new CANNON.ContactMaterial(groundPhysMat, playerPhysMat, {
            friction: 0.8, // Plus de friction pour moins glisser
            restitution: 0.0, // No bounce
            contactEquationStiffness: 1e9, // Very stiff pour éviter de passer au travers
            contactEquationRelaxation: 4
        });
        this.world.addContactMaterial(contactMat);

        // Add Player Character
        this.player = new Player(this.scene, this.world, this.camera);
        if (this.player.body) this.player.body.material = playerPhysMat;

        // Apply saved skin to player
        this.applySavedSkin();

        // City Generator (needed for chunks)
        this.cityGenerator = new CityGenerator(this.scene, this.world, this.assets);
        this.cityGenerator.initGlobalFeatures();

        // Init World Streaming Manager
        this.worldManager = new WorldManager(this.scene, this.world, this.player, this.assets, this.lodManager);
        this.worldManager.initChunkManager(this.cityGenerator);

        // Add NPCs
        this.npcManager = new NPCManager(this.scene, this.world, this.player, this.questManager, this.assets);

        // Add Interiors (Apartments & Buildings)
        this.interiorManager = new InteriorManager(this.scene, this.world, this.player);

        // Add Traffic (Bots)
        this.trafficManager = new TrafficManager(this.scene, this.world, this.assets);


        // Add Waypoints
        this.waypointManager = new WaypointManager(this);

        // Physical Interactions for Bots
        const botGroundContact = new CANNON.ContactMaterial(groundPhysMat, this.trafficManager.botMaterial, {
            friction: 0.9,
            restitution: 0.0,
            contactEquationStiffness: 1e9,
            contactEquationRelaxation: 4
        });
        this.world.addContactMaterial(botGroundContact);

        const botPlayerContact = new CANNON.ContactMaterial(playerPhysMat, this.trafficManager.botMaterial, {
            friction: 0.5,
            restitution: 0.1 // Très léger rebond lors des chocs
        });
        this.world.addContactMaterial(botPlayerContact);

        // Add Vehicles
        this.vehicleArray = [];
        this.vehicleArray.push(new Vehicle(this.scene, this.world, this.player, this.camera, 'car', new THREE.Vector3(5, 1, 0))); // Hover-Car
        this.vehicleArray.push(new Vehicle(this.scene, this.world, this.player, this.camera, 'bike', new THREE.Vector3(-8, 1, -5))); // Cyber-Bike
        this.vehicleArray.push(new Vehicle(this.scene, this.world, this.player, this.camera, 'truck', new THREE.Vector3(15, 1, 10))); // Heavy Truck

        // Add mPhone & Apps
        this.mPhoneManager = new mPhoneManager();
        this.mPhoneManager.registerApp('objects', new AppObjects(this));
        this.mPhoneManager.registerApp('bank', new AppBank(this));
        this.mPhoneManager.registerApp('store', new AppStore(this));
        this.mPhoneManager.registerApp('jobs', new AppJobs(this));
        this.mPhoneManager.registerApp('map', new AppMap(this));
        this.mPhoneManager.registerApp('settings', new AppSettings(this));
        this.mPhoneManager.registerApp('vids', new AppVids(this));
        this.mPhoneManager.registerApp('neohits', new AppNeoHits(this));
        this.mPhoneManager.registerApp('news', new AppNews(this));
        this.mPhoneManager.registerApp('vehicles', new AppVehicles(this));

        // Add mOS Holo Phone
        this.mosManager = new mOSManager();

        // Quest Manager
        this.questManager = new QuestManager(this.scene, this.player);

        // Interaction Manager
        this.interactionManager = new InteractionManager(this.scene, this.player);

        // Event Manager (Random events in the city)
        this.eventManager = new EventManager(this.scene, this.player, this.questManager);

        // Audio Manager
        this.audioManager = new AudioManager(this.camera);
    }

    onWindowResize() {
        if (!this.camera || !this.renderer) return;
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        if (this.graphicsManager) {
            this.graphicsManager.onWindowResize(window.innerWidth, window.innerHeight);
        }
    }

    updatePhysics(deltaTime) {
        // Step the physics engine
        this.world.step(1 / 60, deltaTime, 3);
    }

    updateLogic(deltaTime) {
        // Handle logic updates (input, AI, anims, etc.)
        for (let mixer of this.mixers) {
            mixer.update(deltaTime);
        }

        if (this.player) {
            this.player.update(deltaTime);
        }

        if (this.npcManager) {
            this.npcManager.update(deltaTime);
        }

        if (this.trafficManager) {
            this.trafficManager.update(deltaTime);
        }

        if (this.interactionManager) {
            this.interactionManager.update();
        }

        if (this.vehicleArray) {
            for (let v of this.vehicleArray) {
                v.update(deltaTime);
            }
        }

        if (this.questManager) {
            this.questManager.update();
        }

        if (this.eventManager) {
            this.eventManager.update();
        }

        if (this.interiorManager) {
            this.interiorManager.update();
        }
    }

    initGameLoop() {
        this.gameLoop = new GameLoop({
            fixedUpdate: (dt) => {
                this.updatePhysics(dt);
            },
            update: (dt, alpha) => {
                this.updateLogic(dt);
                this.updateTime(dt);
                if (this.worldManager) this.worldManager.update(dt);
                if (this.lodManager) this.lodManager.update();
                if (this.waypointManager) this.waypointManager.update(dt);
                if (this.stats && this.stats.isActive) this.stats.update();
                // Update graphics manager
                if (this.graphicsManager) this.graphicsManager.update(dt);
            },
            render: (dt, alpha) => {
                this.renderPass(dt, alpha);
            }
        });
    }

    renderPass(dt, alpha) {
        // Render via graphics manager
        if (this.graphicsManager) {
            this.graphicsManager.render();
        }

        // Render minimap
        if (this.minimapRenderer && this.player && this.player.mesh) {
            // Un tracking basique (toujours North Up)
            const px = this.player.mesh.position.x;
            const pz = this.player.mesh.position.z;
            this.minimapCamera.position.set(px, 150, pz);
            this.minimapCamera.lookAt(px, 0, pz);

            // Hide fog or use simple material for map rendering
            const oldFog = this.scene.fog;
            this.scene.fog = null; // Map is clear

            this.minimapRenderer.render(this.scene, this.minimapCamera);

            this.scene.fog = oldFog;
        }
    }

    updateTime(deltaTime) {
        if (!this.gameStarted || !this.saveManager) return;

        // Update time internally
        let t = this.saveManager.state.gameTime;

        // Cycle jour/nuit ralenti : 1h in-game = 10 min réelles (si timeSpeed = 6)
        // deltaTime est en secondes réelles.
        const inGameSeconds = deltaTime * this.timeSpeed;
        t.minutes += inGameSeconds / 60;

        if (t.minutes >= 60) {
            const extraHours = Math.floor(t.minutes / 60);
            t.minutes %= 60;
            t.hours += extraHours;

            if (t.hours >= 24) {
                t.hours %= 24;
                t.day++;
                this.saveManager.saveGame(); // Sauvegarde quotidienne
            }
        }

        // --- Système de Faim ---
        // Baisse de faim : 5% par heure in-game.
        // 1 heure in-game = 3600 sec in-game.
        // Baisse par seconde in-game = 5 / 3600.
        if (this.saveManager.state.player.hunger > 0) {
            this.saveManager.state.player.hunger -= (inGameSeconds * (5 / 3600));
            if (this.saveManager.state.player.hunger < 0) this.saveManager.state.player.hunger = 0;
        }

        // Update UI
        this.updateClockUI();

        if (this.mPhoneManager && this.mPhoneManager.isOpen) {
            this.mPhoneManager.updateTimeFromEngine();
        }

        // Animate Sun and Sky
        this.updateEnvironmentColor(t.hours, t.minutes);
    }

    updateClockUI() {
        if (!this.saveManager) return;
        const t = this.saveManager.state.gameTime;
        const hh = Math.floor(t.hours).toString().padStart(2, '0');
        const mm = Math.floor(t.minutes).toString().padStart(2, '0');
        const timeStr = `${hh}:${mm}`;
        const dayStr = `Jour ${t.day}`;

        // Update Main menu clock
        if (this.clockDisplay) this.clockDisplay.innerText = timeStr;
        if (this.dayDisplay) this.dayDisplay.innerText = dayStr;

        // Update In-Game HUD clock
        const hudClock = document.getElementById('hud-clock-display');
        const hudDay = document.getElementById('hud-day-display');
        if (hudClock) hudClock.innerText = timeStr;
        if (hudDay) hudDay.innerText = dayStr;

        // Update other dynamic UI elements (hunger bar, etc.)
        this.saveManager.updateUI();
    }

    updateEnvironmentColor(hours, minutes) {
        // Calculate a 0 to 1 value for the day (0 = midnight, 0.5 = noon, 1 = midnight)
        const timeDecimal = hours + (minutes / 60);
        const dayProgress = timeDecimal / 24;

        // Define Sky Colors
        const nightColor = new THREE.Color(0x020205); // Almost black, more cinematic than navy blue
        const dawnColor = new THREE.Color(0xff7755);
        const dayColor = new THREE.Color(0x88ccff);
        const duskColor = new THREE.Color(0xaa4422);

        let targetColor = new THREE.Color();
        let sunIntensity = 0;
        let ambientIntensity = 0;

        // Sun Position (Circle animation)
        const sunAngle = (dayProgress * Math.PI * 2) - Math.PI / 2; // -PI/2 to start at bottom
        if (this.sunLight) {
            this.sunLight.position.x = Math.cos(sunAngle) * 300;
            this.sunLight.position.y = Math.sin(sunAngle) * 300;
            this.sunLight.position.z = Math.cos(sunAngle) * 50; // Slight angle
        }

        if (timeDecimal >= 5 && timeDecimal < 8) {
            // Aube (5h - 8h)
            const p = (timeDecimal - 5) / 3;
            targetColor.lerpColors(nightColor, dawnColor, p);
            sunIntensity = p * 1.5;
            ambientIntensity = 0.2 + (p * 0.3);
        } else if (timeDecimal >= 8 && timeDecimal < 18) {
            // Jour (8h - 18h)
            const p = (timeDecimal - 8) / 10;
            targetColor.lerpColors(dawnColor, dayColor, p < 0.2 ? p * 5 : 1); // Quick transition to day
            sunIntensity = 1.5 + Math.sin(p * Math.PI) * 1.5; // Max at noon
            ambientIntensity = 0.5 + Math.sin(p * Math.PI) * 0.5;
        } else if (timeDecimal >= 18 && timeDecimal < 20) {
            // Crépuscule (18h - 20h)
            const p = (timeDecimal - 18) / 2;
            targetColor.lerpColors(dayColor, duskColor, p);
            sunIntensity = 1.5 - (p * 1.5);
            ambientIntensity = 0.5 - (p * 0.3);
        } else {
            // Nuit (20h - 5h)
            let p = 0;
            if (timeDecimal >= 20) {
                p = (timeDecimal - 20) / 4; // 20h to 24h
                targetColor.lerpColors(duskColor, nightColor, Math.min(p, 1));
            } else {
                targetColor.copy(nightColor);
            }
            sunIntensity = 0; // Soleil caché
            ambientIntensity = 0.2; // Lumière de la lune/ville
        }

        // Apply Colors
        if (!this.scene.background) this.scene.background = new THREE.Color();
        this.scene.background.copy(targetColor);
        if (this.scene.fog) {
            this.scene.fog.color.copy(targetColor);
        }

        // Intensities
        if (this.sunLight) {
            this.sunLight.intensity = sunIntensity;
        }
        if (this.ambientLight) {
            this.ambientLight.intensity = ambientIntensity;
        }
    }

    applySavedSkin() {
        const equipped = this.saveManager.state.player.equippedSkin;
        const skinsInfo = {
            'default_neon': 0x0088FF,
            'red_neon': 0xFF2222,
            'green_cyber': 0x00FF80,
            'gold_vip': 0xFFD700
        };
        const hex = skinsInfo[equipped] || 0x0088FF;
        this.player.setSkinColor(hex);
    }
}

// Instantiate the game
window.addEventListener('DOMContentLoaded', () => {
    window.game = new GameEngine();
});
