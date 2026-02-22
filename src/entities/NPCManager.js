import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { getRandomAdvancedDialogue } from './dialogues/dialogueDatabase.js';
import { professionsData } from '../data/professions.js';

export class NPCManager {
    constructor(scene, world, player, questManager, assets) {
        this.scene = scene;
        this.world = world;
        this.player = player;
        this.questManager = questManager;
        this.assets = assets || {};
        this.npcs = [];
        this.petsAndDrones = [];
        this.currentInteractable = null;

        // Dialog State
        this.isConversing = false;
        this.currentDialogIndex = 0;
        this.currentChatNpc = null;

        // Dialogues are now loaded externally from dialogues.js
        this.chatters = []; // kept for legacy reference, but mostly we use getRandomDialogue()


        // Setup UI Elements
        this.interactUI = document.getElementById('interact-ui');
        this.dialogUI = document.getElementById('dialog-box');
        this.dialogName = document.getElementById('dialog-name');
        this.dialogText = document.getElementById('dialog-text');

        // Keyboard Listener
        document.addEventListener('keydown', (e) => this.onKeyDown(e), false);

        this.generateNPCs();
        this.generateDronesAndPets();
    }

    generateNPCs() {
        // --- Citoyens de base & Officiels ---
        this.addNPC(5, 0, 10, "Citoyen Novice", null, null, false, null, 'civilian');
        this.addNPC(70, 0, 70, "Le Maire", null, null, false, null, 'civilian');
        this.addNPC(-70, 0, 70, "Chef de la Police", null, null, false, null, 'police');

        // Spawn recruiters for all 20 professions
        let angleStep = (Math.PI * 2) / professionsData.length;
        professionsData.forEach((prof, i) => {
            const r = 80;
            const px = Math.cos(angleStep * i) * r;
            const pz = Math.sin(angleStep * i) * r;

            this.addNPC(px, 0, pz, `Expert ${prof.name}`, [
                `Je représente la guilde des ${prof.name}s.`,
                prof.description,
                `Tu veux gagner ${prof.salary} m's ? [E] pour postuler.`
            ], null, false, null, prof.id);
            this.npcs[this.npcs.length - 1].jobId = prof.id;

            if (prof.id === 'mechanic') this.npcs[this.npcs.length - 1].isMechanic = true;
            if (prof.id === 'cook') this.npcs[this.npcs.length - 1].isRestaurant = true;
            if (prof.id === 'doctor') this.npcs[this.npcs.length - 1].isHospital = true;
        });

        // Anciens PNJs Spécifiques pour la compatibilité
        this.addNPC(20, 0, 20, "Chef Luigi", ["Pizza ! 50 m's. [E]"], null, false, null, 'merchant');
        this.npcs[this.npcs.length - 1].isPizzeria = true;

        this.addNPC(-50, 0, -150, "Chef de Chantier", ["On a besoin de bras ! [E]"], null, false, null, 'mechanic');
        this.npcs[this.npcs.length - 1].isConstructionSite = true;

        this.addNPC(-50, 0, -200, "Armurier Rex", ["Besoin d'artillerie lourde ?", "J'ai tout de l'asset 35 à 49.", "[E] pour ouvrir l'Armurerie."], null, false, null, 'merchant');
        this.npcs[this.npcs.length - 1].isWeaponShop = true;

        // PNJs Mobiles avec divers rôles
        const roles = ['civilian', 'civilian', 'civilian', 'police', 'medical', 'hacker', 'merchant', 'mechanic'];
        for (let i = 0; i < 40; i++) {
            const rx = (Math.random() - 0.5) * 500;
            const rz = (Math.random() - 0.5) * 500;
            if (Math.abs(rx) < 50 && Math.abs(rz) < 50) continue;
            const role = roles[Math.floor(Math.random() * roles.length)];
            this.addNPC(rx, 0, rz, `Citoyen (${role})`, null, null, true, null, role);
        }
    }

    generateDronesAndPets() {
        // Objets 34: Drones, 35/36: Animaux
        // Si les assets ne sont pas chargés, on utilise des géométries basiques
        const hasDrone = !!this.assets['34asset.glb'] || !!this.assets['34asset.gltf'] || !!this.assets['34asset.obj'];
        const hasPet = !!this.assets['35asset.glb'] || !!this.assets['36asset.glb'] || !!this.assets['35asset.fbx'] || !!this.assets['36asset.fbx'];

        // Drones de livraison / surveillance
        for (let i = 0; i < 8; i++) {
            let mesh;
            if (hasDrone) {
                const assetKey = ['34asset.glb', '34asset.gltf', '34asset.obj'].find(k => this.assets[k]);
                mesh = this.assets[assetKey].clone();
                mesh.scale.setScalar(1.5);
            } else {
                const geo = new THREE.BoxGeometry(1, 0.5, 1);
                const mat = new THREE.MeshStandardMaterial({ color: 0x888888, emissive: 0x00FFFF, emissiveIntensity: 0.5 });
                mesh = new THREE.Mesh(geo, mat);
            }

            const x = (Math.random() - 0.5) * 600;
            const z = (Math.random() - 0.5) * 600;
            const y = 5 + Math.random() * 15; // Drones volent entre 5m et 20m

            mesh.position.set(x, y, z);
            this.scene.add(mesh);

            this.petsAndDrones.push({
                type: 'drone',
                mesh: mesh,
                body: null, // Pas de collisions dures pour les drones d'ambiance
                targetPos: new THREE.Vector3(x, y, z),
                speed: 4 + Math.random() * 4,
                lastMoveTime: 0
            });
        }

        // Animaux (Chiens robots / Chats)
        for (let i = 0; i < 5; i++) {
            let mesh;
            if (hasPet) {
                const assetKey = ['35asset.glb', '36asset.glb', '35asset.fbx', '36asset.fbx'].find(k => this.assets[k]);
                mesh = this.assets[assetKey].clone();
                mesh.scale.setScalar(1);
            } else {
                const geo = new THREE.BoxGeometry(0.5, 0.5, 0.8);
                const mat = new THREE.MeshStandardMaterial({ color: 0xFFAA00 });
                mesh = new THREE.Mesh(geo, mat);
            }

            const x = (Math.random() - 0.5) * 200;
            const z = (Math.random() - 0.5) * 200;
            const y = 0.5;

            mesh.position.set(x, y, z);
            this.scene.add(mesh);

            this.petsAndDrones.push({
                type: 'pet',
                mesh: mesh,
                body: null, // Simplifié pour les perfs
                targetPos: new THREE.Vector3(x, y, z),
                speed: 2 + Math.random(),
                lastMoveTime: 0
            });
        }
    }

    addNPC(x, y, z, name, dialogTree, givesQuestId = null, m_mobile = false, m_model = null, role = 'civilian') {
        let mesh;
        if (m_model && this.assets[m_model]) {
            mesh = this.assets[m_model].clone();
            mesh.scale.setScalar(2);
        } else {
            const geometry = new THREE.CapsuleGeometry(1, 2, 4, 16);
            const material = new THREE.MeshStandardMaterial({
                color: Math.random() > 0.5 ? 0x0088FF : 0xFF00AA,
                roughness: 0.3, metalness: 0.2
            });
            mesh = new THREE.Mesh(geometry, material);
            const faceGeo = new THREE.BoxGeometry(0.8, 0.5, 0.8);
            const faceMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF });
            const faceMesh = new THREE.Mesh(faceGeo, faceMat);
            faceMesh.position.set(0, 0.8, -0.8);
            mesh.add(faceMesh);
        }

        mesh.position.set(x, y + 2, z);
        mesh.castShadow = true;
        this.scene.add(mesh);

        const body = new CANNON.Body({
            mass: m_mobile ? 1 : 0,
            position: new CANNON.Vec3(x, y + 2, z)
        });
        body.addShape(new CANNON.Sphere(1), new CANNON.Vec3(0, 1, 0));
        body.addShape(new CANNON.Sphere(1), new CANNON.Vec3(0, -1, 0));
        body.fixedRotation = true;
        body.updateMassProperties();
        this.world.addBody(body);

        this.npcs.push({
            mesh, body, name, dialogTree, givesQuestId, role,
            isMobile: m_mobile,
            targetPos: new THREE.Vector3(x, y + 2, z),
            lastMoveTime: 0
        });
    }

    onKeyDown(event) {
        if (event.code === 'KeyE') {
            if (!this.isConversing && this.currentInteractable) {
                this.startConversation(this.currentInteractable);
            }
            // Handling progression via space or keys is now tied to the UI buttons.
        }
    }

    startConversation(npc) {
        this.isConversing = true;
        this.currentChatNpc = npc;
        this.player.canMove = false;

        if (npc.jobId) {
            this.setJob(npc.jobId, npc.name);
            this.endConversation();
            return;
        }

        if (npc.isPizzeria || npc.isRestaurant) { this.buyFood(npc); this.endConversation(); return; }
        if (npc.isMechanic) { this.repairVehicle(); this.endConversation(); return; }
        if (npc.isJobRecruiter) { this.showJobMenu(); this.endConversation(); return; }
        if (npc.isConstructionSite) { this.setJob('construction', npc.name); this.endConversation(); return; }
        if (npc.isWeaponShop) {
            this.endConversation();
            if (this.player.engine && this.player.engine.weaponShop) {
                this.player.engine.weaponShop.open();
            }
            return;
        }

        // Si le PNJ a un dialogTree fixe et hérité
        if (npc.dialogTree && npc.dialogTree.length > 0) {
            this.showDialogText(npc.name, npc.dialogTree[0]);
            setTimeout(() => this.endConversation(), 4000);
            return;
        }

        // Sinon, lancer le système de dialogue avancé avec choix
        const advDialog = getRandomAdvancedDialogue(npc.role);
        this.showAdvancedDialog(npc.name, advDialog);
    }

    showAdvancedDialog(name, dialogData) {
        // UI de dialogue dynamique
        let ui = document.getElementById('adv-dialog-box');
        if (!ui) {
            ui = document.createElement('div');
            ui.id = 'adv-dialog-box';
            ui.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-black/90 backdrop-blur-xl border border-neonCyan/40 p-6 rounded-2xl w-full max-w-2xl shadow-[0_0_40px_rgba(0,255,255,0.15)] flex flex-col gap-4 text-white font-sans transition-all duration-300';
            document.body.appendChild(ui);
        }

        ui.innerHTML = `
            <div class="flex items-center gap-3 border-b border-white/10 pb-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold">${name.charAt(0)}</div>
                <h3 class="text-neonCyan font-bold uppercase tracking-widest text-sm">${name}</h3>
            </div>
            <p class="text-lg leading-relaxed font-light">${dialogData.text}</p>
            <div class="flex flex-col gap-2 mt-2" id="adv-dialog-choices"></div>
        `;

        const choicesContainer = ui.querySelector('#adv-dialog-choices');
        dialogData.choices.forEach((choice, idx) => {
            const btn = document.createElement('button');
            btn.className = 'text-left px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl transition-all duration-200 text-sm italic group';
            btn.innerHTML = `<span class="text-gray-400 group-hover:text-neonCyan mr-2">></span> ${choice.text}`;
            btn.onclick = () => {
                this.showDialogReply(name, choice.reply);
            };
            choicesContainer.appendChild(btn);
        });

        // Cacher l'ancien UI de dialogue s'il existe
        this.dialogUI.classList.add('hidden');
        ui.classList.remove('hidden', 'translate-y-10', 'opacity-0');
        ui.classList.add('translate-y-0', 'opacity-100');
    }

    showDialogReply(name, text) {
        const ui = document.getElementById('adv-dialog-box');
        if (!ui) return;
        ui.innerHTML = `
            <div class="flex items-center gap-3 border-b border-white/10 pb-2">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-bold">${name.charAt(0)}</div>
                <h3 class="text-neonCyan font-bold uppercase tracking-widest text-sm">${name}</h3>
            </div>
            <p class="text-lg leading-relaxed font-light">${text}</p>
            <button id="adv-dialog-close" class="mt-4 text-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all">Quitter</button>
        `;
        document.getElementById('adv-dialog-close').onclick = () => {
            ui.classList.add('translate-y-10', 'opacity-0');
            setTimeout(() => {
                ui.classList.add('hidden');
                this.endConversation();
            }, 300);
        };
    }

    setJob(jobId, npcName) {
        if (!this.player.engine || !this.player.engine.saveManager) return;
        const sm = this.player.engine.saveManager;
        const qm = this.player.engine.questManager;
        sm.state.player.job = jobId;
        this.showDialogText(npcName, `Parfait ! Tu es maintenant ${jobId}. Va travailler citoyen !`, 4000);

        // Démarrer la quête liée au job
        if (qm) {
            if (jobId === 'architect') qm.startQuest('architect_inspection');
            if (jobId === 'ia_dev') qm.startQuest('ia_debug');
            if (jobId === 'journalist') qm.startQuest('journalist_scoop');
            if (jobId === 'cook') qm.startQuest('cook_delivery');
            if (jobId === 'doctor') qm.startQuest('medical_emergency');
            if (jobId === 'pilot') qm.startQuest('pilot_transport');
        }

        sm.saveGame();
    }

    buyFood(npc) {
        if (!this.player.engine || !this.player.engine.saveManager) return;
        const sm = this.player.engine.saveManager;
        const cost = npc.isRestaurant ? 80 : 50;
        if (sm.state.player.credits >= cost) {
            sm.spendCredits(cost);
            sm.eat(npc.isRestaurant ? 50 : 30);
            this.showDialogText(npc.name, "Bon appétit !", 3000);
        } else {
            this.showDialogText(npc.name, "Pas assez de m's !", 3000);
        }
    }

    repairVehicle() {
        if (!this.player.engine || !this.player.engine.saveManager) return;
        const sm = this.player.engine.saveManager;
        if (sm.state.player.credits >= 100) {
            sm.spendCredits(100);
            this.showDialogText("Mécano Joe", "Réparé !", 3000);
        } else {
            this.showDialogText("Mécano Joe", "Pas assez !", 3000);
        }
    }

    showJobMenu() {
        if (!this.player.engine || !this.player.engine.saveManager) return;
        const sm = this.player.engine.saveManager;
        const r = Math.random();
        sm.state.player.job = r > 0.5 ? 'police' : 'firefighter';
        this.showDialogText("Recrutement", `Tu es maintenant ${sm.state.player.job} !`, 4000);
        sm.saveGame();
    }

    endConversation() {
        this.isConversing = false; this.currentChatNpc = null; this.player.canMove = true;
        if (this.dialogUI) { this.dialogUI.classList.add('opacity-0', 'pointer-events-none'); }
    }

    showDialogText(name, text, timeout = 0) {
        if (!this.dialogUI) return;
        this.dialogName.innerText = name; this.dialogText.innerText = text;
        this.dialogUI.classList.remove('opacity-0', 'pointer-events-none', 'hidden');
        this.dialogUI.classList.add('opacity-100', 'pointer-events-auto');
        if (timeout > 0) {
            if (this.dialogTimeout) clearTimeout(this.dialogTimeout);
            this.dialogTimeout = setTimeout(() => { if (!this.isConversing) this.endConversation(); }, timeout);
        }
    }

    update(deltaTime) {
        if (!this.player || !this.npcs.length) return;
        let foundClose = null;
        for (let npc of this.npcs) {
            const distance = this.player.mesh.position.distanceTo(npc.mesh.position);
            if (distance < 5) foundClose = npc;
            if (distance < 15 && distance > 5 && Math.random() < 0.001 && !this.isConversing) {
                this.showDialogText(npc.name, getRandomDialogue(), 3000);
            }
            if (npc.isMobile) { this.updateNPCDecision(npc, deltaTime); this.moveNPC(npc, deltaTime); }
            else { npc.mesh.position.copy(npc.body.position); }
        }
        if (foundClose !== this.currentInteractable) {
            this.currentInteractable = foundClose;
            if (this.interactUI && !this.isConversing) {
                if (this.currentInteractable) { this.interactUI.classList.add('opacity-100'); this.interactUI.classList.remove('opacity-0'); }
                else { this.interactUI.classList.add('opacity-0'); this.interactUI.classList.remove('opacity-100'); }
            }
        }

        this.updateDronesAndPets(deltaTime);
    }

    updateDronesAndPets(deltaTime) {
        for (let entity of this.petsAndDrones) {
            entity.lastMoveTime += deltaTime;

            // Décision
            if (entity.lastMoveTime > 3 + Math.random() * 4) {
                entity.lastMoveTime = 0;
                entity.targetPos.x += (Math.random() - 0.5) * 40;
                entity.targetPos.z += (Math.random() - 0.5) * 40;

                if (entity.type === 'drone') {
                    entity.targetPos.y = 5 + Math.random() * 15; // Change altitude
                }
            }

            // Déplacement fluide (Lerp)
            entity.mesh.position.lerp(entity.targetPos, deltaTime * entity.speed * 0.1);

            // Rotation vers la cible
            const direction = new THREE.Vector3().subVectors(entity.targetPos, entity.mesh.position);
            direction.y = 0;
            if (direction.lengthSq() > 0.1) {
                const angle = Math.atan2(direction.x, direction.z);
                entity.mesh.rotation.y = THREE.MathUtils.lerp(entity.mesh.rotation.y, angle, 0.1);
            }
        }
    }

    updateNPCDecision(npc, deltaTime) {
        npc.lastMoveTime += deltaTime;
        if (npc.lastMoveTime > 5 + Math.random() * 8) {
            npc.lastMoveTime = 0;
            npc.targetPos.x += (Math.random() - 0.5) * 60; npc.targetPos.z += (Math.random() - 0.5) * 60;
            npc.targetPos.x = Math.max(-450, Math.min(450, npc.targetPos.x));
            npc.targetPos.z = Math.max(-450, Math.min(450, npc.targetPos.z));
        }
    }

    moveNPC(npc, deltaTime) {
        const direction = new THREE.Vector3().subVectors(npc.targetPos, npc.mesh.position);
        direction.y = 0;
        const dist = direction.length();
        if (dist > 1) {
            direction.normalize(); const moveSpeed = 3;
            npc.body.velocity.x = direction.x * moveSpeed; npc.body.velocity.z = direction.z * moveSpeed;
            npc.mesh.rotation.y = THREE.MathUtils.lerp(npc.mesh.rotation.y, Math.atan2(direction.x, direction.z), 0.1);
        } else { npc.body.velocity.x *= 0.5; npc.body.velocity.z *= 0.5; }
        npc.mesh.position.copy(npc.body.position);
    }
}
