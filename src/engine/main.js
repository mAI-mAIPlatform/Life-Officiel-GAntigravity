import * as THREE from 'three';
// Les loaders de modèles ne sont plus nécessaires
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
// import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import * as CANNON from 'cannon-es';

// Managers
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
import { ErrorReporter } from '../utils/ErrorReporter.js';
import { mOSManager } from './mOSManager.js';
import { QuestManager } from './QuestManager.js';
import { MenuManager } from './MenuManager.js';
import { InteractionManager } from './InteractionManager.js';
import { SaveManager } from './SaveManager.js';
import { CityManager } from '../city/CityManager.js';

const reporter = new ErrorReporter();
// Attach reporter to window for global access in GameLoop
window.errorReporter = reporter;

export class GameEngine {
    constructor() {
        console.log("--- NeoCity Engine Booting ---");

        this.gameStarted = false;
        this.assets = {}; // Sera vide maintenant
        // this.loader = new GLTFLoader();
        // this.fbxLoader = new FBXLoader();
        // this.objLoader = new OBJLoader();

        // UI
        this.uiContainer = document.getElementById('ui-container');
        this.gameContainer = document.getElementById('game-container');
        this.startBtn = document.getElementById('start-btn');

        // Main Managers
        this.saveManager = new SaveManager();
        this.menuManager = new MenuManager();
        this.menuManager.setEngine(this);

        this.engineInitialized = false;
        this.init();
    }

    async init() {
        try {
            this.bindEvents();
            // await this.loadCriticalAssets(); // Plus de modèles
            this.initSystems();
            // this.loadBackgroundAssets(); // Plus de modèles
        } catch (e) {
            console.error("Engine Start Failure:", e);
        }
    }

    bindEvents() {
        if (this.startBtn) {
            this.startBtn.addEventListener('click', () => this.startGame());
        }
        window.addEventListener('resize', () => this.onWindowResize());
    }

    // Méthodes de chargement d'assets supprimées car public/models a été supprimé
    /*
    async loadCriticalAssets() { ... }
    async loadBackgroundAssets() { ... }
    */

    initSystems() {
        console.log("Initializing Systems...");

        // Physics
        this.world = new CANNON.World({ gravity: new CANNON.Vec3(0, -9.81, 0) });
        this.world.broadphase = new CANNON.SAPBroadphase(this.world);
        this.world.allowSleep = true;

        // Graphics
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x020205);
        this.scene.fog = new THREE.FogExp2(0x020205, 0.002);

        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;

        if (this.gameContainer) {
            const canvas = this.renderer.domElement;
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            this.gameContainer.appendChild(canvas);
        }

        // Environment
        this.sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
        this.sunLight.position.set(50, 100, 50);
        this.sunLight.castShadow = true;
        this.scene.add(this.sunLight);
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.8));

        // Managers
        this.player = new Player(this.scene, this.world, this.camera);
        this.lodManager = new LODManager(this.scene, this.camera);
        this.npcManager = new NPCManager(this.scene, this.world, this.player, null, this.assets);
        this.cityGenerator = new CityGenerator(this.scene, this.world, this.assets);
        this.cityGenerator.initGlobalFeatures();

        this.worldManager = new WorldManager(this.scene, this.world, this.player, this.assets, this.lodManager);
        this.worldManager.initChunkManager(this.cityGenerator);
        this.worldManager.update(0);

        this.trafficManager = new TrafficManager(this.scene, this.world, this.assets);
        this.graphicsManager = new GraphicsManager(this.scene, this.camera, this.renderer, this);
        this.questManager = new QuestManager(this.scene, this.player);
        this.eventManager = new EventManager(this.scene, this.player, this.questManager);
        this.audioManager = new AudioManager(this.camera);
        this.mOSManager = new mOSManager();
        this.mPhoneManager = new mPhoneManager();
        this.interactionManager = new InteractionManager(this.scene, this.player);
        this.waypointManager = new WaypointManager(this);
        this.interiorManager = new InteriorManager(this.scene, this.world, this.player);
        this.cityManager = new CityManager(this.scene, this.world);

        window.game = this; // Accès global pour l'UI et les managers
        this.reporter = reporter;

        this.initGameLoop();
        this.engineInitialized = true;

        // S'assurer que les écrans de chargement sont à jour
        if (this.saveManager) this.saveManager.updateUI();

        if (this.startBtn) {
            this.startBtn.innerText = "ENTRER DANS NEOCITY";
            this.startBtn.classList.remove('opacity-50', 'pointer-events-none');
        }
    }

    initGameLoop() {
        this.gameLoop = new GameLoop({
            fixedUpdate: (dt) => this.world.step(1 / 60, dt, 3),
            update: (dt) => this.update(dt),
            render: () => this.graphicsManager.render()
        });
    }

    update(dt) {
        this.player.update(dt);
        if (this.worldManager) this.worldManager.update(dt);
        if (this.npcManager) this.npcManager.update(dt);
        if (this.trafficManager) this.trafficManager.update(dt);
        if (this.eventManager) this.eventManager.update(dt);
        if (this.interactionManager) this.interactionManager.update();
        if (this.waypointManager) this.waypointManager.update(dt);
        if (this.lodManager) this.lodManager.update();
        if (this.interiorManager) this.interiorManager.update();
    }

    startGame() {
        if (!this.engineInitialized || this.gameStarted) return;
        this.gameStarted = true;

        // UI Trans
        if (this.uiContainer) {
            this.uiContainer.style.opacity = '0';
            setTimeout(() => this.uiContainer.style.display = 'none', 800);
        }

        const gameUI = document.getElementById('game-ui');
        if (gameUI) gameUI.classList.remove('hidden');

        // Initial Sync
        this.player.body.position.set(0, 2, 0);
        this.player.update(0);

        // Debug cube
        const cube = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial({ color: 0xff0000 }));
        cube.position.set(0, 1, 0);
        this.scene.add(cube);

        try {
            this.gameLoop.start();
            console.log("Game Active.");
        } catch (err) {
            console.error("Start Game Failed:", err);
            reporter.showError("Échec du démarrage", err.message);
        }
    }

    onWindowResize() {
        if (!this.renderer || !this.camera) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }
}

new GameEngine();
