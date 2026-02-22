import * as THREE from 'three';
import { adventuresData } from '../adventures/adventuresData.js';

export class QuestManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;

        this.activeQuest = null;
        this.questsInfo = {
            "first_steps": {
                title: "Nouveau Citoyen",
                description: "Allez vous présenter au Maire de NeoCity.",
                targetPos: new THREE.Vector3(70, 0, 70),
                radius: 10,
                reward: 500,
                next: null
            },
            "police_report": {
                title: "Signalement",
                description: "Rendez-vous au Commissariat pour un interrogatoire.",
                targetPos: new THREE.Vector3(-70, 0, 70),
                radius: 10,
                reward: 800,
                next: null
            },
            "police_patrol": {
                title: "Mission : Patrouille",
                description: "Secteur suspect détecté près du Monument 4.",
                targetPos: new THREE.Vector3(-150, 0, -150),
                radius: 15,
                reward: 1200,
                next: null
            },
            "fire_inspection": {
                title: "Mission : Sécurité Incendie",
                description: "Examinez les alarmes à la Mairie.",
                targetPos: new THREE.Vector3(70, 0, 70),
                radius: 10,
                reward: 1000,
                next: null
            },
            "architect_inspection": {
                title: "Mission : Urbanisme",
                description: "Inspectez la structure du nouveau complexe.",
                targetPos: new THREE.Vector3(50, 0, 120),
                radius: 15,
                reward: 1500,
                next: null
            },
            "ia_debug": {
                title: "Mission : Maintenance IA",
                description: "Réinitialisez le serveur central.",
                targetPos: new THREE.Vector3(-100, 0, -50),
                radius: 10,
                reward: 2000,
                next: null
            },
            "journalist_scoop": {
                title: "Mission : Grand Angle",
                description: "Prenez des clichés de la zone Plage.",
                targetPos: new THREE.Vector3(300, 0, -300),
                radius: 30,
                reward: 1000,
                next: null
            },
            "cook_delivery": {
                title: "Mission : Livraison Express",
                description: "Livrez les plats au Maire.",
                targetPos: new THREE.Vector3(70, 0, 70),
                radius: 10,
                reward: 800,
                next: null
            },
            "medical_emergency": {
                title: "Mission : Urgence",
                description: "Intervenez à l'Hôpital pour un patient critique.",
                targetPos: new THREE.Vector3(200, 0, 200),
                radius: 20,
                reward: 2500,
                next: null
            },
            "pilot_transport": {
                title: "Mission : Vol d'Essai",
                description: "Préparez l'avion sur la piste d'aéroport.",
                targetPos: new THREE.Vector3(350, 0, 350),
                radius: 25,
                reward: 3000,
                next: null
            }
        };

        // Inject Adventures into questsInfo
        Object.assign(this.questsInfo, adventuresData);

        this.dailyQuests = [
            { id: "daily_0", title: "Quotidienne : Patrouille du Parc", description: "Vérifiez que tout est calme au parc.", targetPos: new THREE.Vector3(70, 0, -70), radius: 15, reward: 200 },
            { id: "daily_1", title: "Quotidienne : Inspection du Marché", description: "Allez voir les vendeurs près du spawn.", targetPos: new THREE.Vector3(0, 0, 20), radius: 10, reward: 150 },
            { id: "daily_2", title: "Quotidienne : Courrier Confidentiel", description: "Livrez ce pli à la Mairie.", targetPos: new THREE.Vector3(70, 0, 70), radius: 10, reward: 300 }
        ];

        this.initUI();
    }

    initUI() {
        this.questUI = document.getElementById('quest-tracker-ui');
        this.questTitleUI = document.getElementById('quest-tracker-title');
        this.questDescUI = document.getElementById('quest-tracker-desc');
        this.questDistUI = document.getElementById('quest-tracker-dist');
    }

    startQuest(questId) {
        if (this.questsInfo[questId]) {
            this.activeQuest = { ...this.questsInfo[questId], id: questId };
        } else if (questId.startsWith("daily_")) {
            const dq = this.dailyQuests.find(q => q.id === questId);
            if (dq) this.activeQuest = { ...dq };
        }

        if (this.activeQuest) {
            this.updateUI();
            this.createObjectiveMarker();
            if (this.activeQuest.dialogue) {
                this.showDialogue(this.activeQuest.dialogue);
            }
        }
    }

    showDialogue(dialogues) {
        let index = 0;

        const hud = document.createElement('div');
        hud.className = 'fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50 bg-black/80 backdrop-blur-md text-white px-8 py-6 rounded-2xl border border-neonCyan/50 shadow-[0_0_30px_rgba(0,255,255,0.2)] transition-all duration-300 w-full max-w-2xl flex items-center gap-4';

        const avatar = document.createElement('div');
        avatar.className = 'w-16 h-16 rounded-full bg-gradient-to-tr from-blue-500 to-neonCyan border-2 border-white flex items-center justify-center shrink-0 shadow-inner text-2xl font-black italic';
        avatar.innerText = '?';

        const textContainer = document.createElement('div');
        textContainer.className = 'flex flex-col flex-1';

        const nameEl = document.createElement('span');
        nameEl.className = 'text-neonCyan font-black uppercase text-sm mb-1 tracking-widest';

        const msgEl = document.createElement('p');
        msgEl.className = 'text-lg font-light leading-relaxed';

        const nextHint = document.createElement('span');
        nextHint.className = 'text-gray-500 text-xs mt-2 italic animate-pulse group cursor-pointer';
        nextHint.innerText = 'Appuyez pour continuer (ou Espace) >>';

        textContainer.appendChild(nameEl);
        textContainer.appendChild(msgEl);
        textContainer.appendChild(nextHint);

        hud.appendChild(avatar);
        hud.appendChild(textContainer);
        document.body.appendChild(hud);

        const showNext = () => {
            if (index >= dialogues.length) {
                hud.classList.add('opacity-0', 'translate-y-10');
                setTimeout(() => hud.remove(), 300);
                document.removeEventListener('keydown', keyHandler);
                return;
            }
            const line = dialogues[index];
            const parts = line.split(':');
            if (parts.length > 1) {
                nameEl.innerText = parts[0].trim();
                msgEl.innerText = parts.slice(1).join(':').trim();
                avatar.innerText = parts[0].trim().charAt(0);
            } else {
                nameEl.innerText = 'SYSTÈME';
                msgEl.innerText = line;
                avatar.innerText = '!';
            }
            index++;
        };

        const keyHandler = (e) => {
            if (e.code === 'Space') showNext();
        };

        hud.addEventListener('click', showNext);
        document.addEventListener('keydown', keyHandler);

        // Entrée en scène
        hud.classList.add('opacity-0', 'translate-y-10');
        setTimeout(() => hud.classList.remove('opacity-0', 'translate-y-10'), 50);
        showNext();
    }

    assignDailyQuest() {
        if (this.activeQuest) return;
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
        const questIndex = dayOfYear % this.dailyQuests.length;
        this.startQuest(this.dailyQuests[questIndex].id);
    }

    createObjectiveMarker() {
        if (this.marker) { this.scene.remove(this.marker); }
        const geo = new THREE.CylinderGeometry(1, 1, 200, 16);
        const mat = new THREE.MeshBasicMaterial({ color: 0x00FF80, transparent: true, opacity: 0.4, side: THREE.DoubleSide });
        this.marker = new THREE.Mesh(geo, mat);
        this.marker.position.copy(this.activeQuest.targetPos);
        this.marker.position.y = 100;
        this.scene.add(this.marker);
    }

    completeQuest() {
        console.log(`Quest ${this.activeQuest.title} Completed! Reward: ${this.activeQuest.reward} credits`);
        if (this.player && this.player.engine && this.player.engine.saveManager) {
            const sm = this.player.engine.saveManager;
            sm.addCredits(this.activeQuest.reward);
            sm.addXp(this.activeQuest.reward / 2);
            sm.markQuestComplete(this.activeQuest.id);

            // Check for physical item rewards
            if (this.activeQuest.itemReward) {
                if (!sm.data.inventory) sm.data.inventory = [];
                if (!sm.data.inventory.includes(this.activeQuest.itemReward)) {
                    sm.data.inventory.push(this.activeQuest.itemReward);
                }
                this.showRewardHUD(this.activeQuest.itemReward);
            }

            sm.saveGame();
        }
        if (this.marker) { this.scene.remove(this.marker); this.marker = null; }

        const completedQuestId = this.activeQuest.id;
        const nextQuestId = this.activeQuest.next;

        this.activeQuest = null;
        this.updateUI();

        if (nextQuestId && this.questsInfo[nextQuestId]) {
            setTimeout(() => { this.startQuest(nextQuestId); }, 3000);
        } else if (completedQuestId === "first_steps" || completedQuestId === "adv_c3_p3") {
            setTimeout(() => { this.assignDailyQuest(); }, 3000);
        }
    }

    showRewardHUD(itemName) {
        // Obtenir un nom lisible 
        const readableNames = {
            '37asset.glb': 'Katana Néon',
            '50asset.glb': 'Moto Légendaire'
        };
        const displayName = readableNames[itemName] || itemName;

        // Create a flashy HUD for item reward
        const hud = document.createElement('div');
        hud.className = 'fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-yellow-500/90 backdrop-blur text-black px-8 py-4 rounded-xl border-4 border-white shadow-[0_0_50px_yellow] transition-all duration-500 text-center';
        hud.innerHTML = `
            <h2 class="text-3xl font-black uppercase tracking-widest mb-1 shadow-sm">🔥 QUÊTE ACCOMPLIE ! 🔥</h2>
            <p class="text-xl font-bold">Nouvel Objet Débloqué : <span class="text-white drop-shadow-md bg-black px-2 py-1 rounded-md ml-2">${displayName}</span></p>
        `;
        document.body.appendChild(hud);

        // Animation
        setTimeout(() => {
            hud.classList.add('opacity-0', 'scale-110');
            setTimeout(() => {
                hud.remove();
            }, 500);
        }, 4000);
    }

    updateUI() {
        if (this.questUI && this.questTitleUI && this.questDescUI && this.questDistUI) {
            if (this.activeQuest) {
                this.questUI.classList.remove('hidden', 'translate-x-full');
                this.questTitleUI.innerText = this.activeQuest.title;
                this.questDescUI.innerText = this.activeQuest.description;
            } else {
                this.questUI.classList.add('translate-x-full');
                setTimeout(() => { if (!this.activeQuest) this.questUI.classList.add('hidden'); }, 300);
            }
        }
    }

    update() {
        if (!this.activeQuest || !this.player) return;
        const playPos = this.player.mesh.position;
        const targetPos = this.activeQuest.targetPos;
        const dx = playPos.x - targetPos.x;
        const dz = playPos.z - targetPos.z;
        const dist = Math.sqrt(dx * dx + dz * dz);
        if (this.questDistUI) { this.questDistUI.innerText = `${Math.floor(dist)}m`; }
        if (dist <= this.activeQuest.radius) { this.completeQuest(); }
    }
}
