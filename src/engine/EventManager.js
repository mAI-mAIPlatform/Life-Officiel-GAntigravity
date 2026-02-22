import * as THREE from 'three';

export class EventManager {
    constructor(scene, player, questManager) {
        this.scene = scene;
        this.player = player;
        this.questManager = questManager;

        this.activeEvent = null;
        this.eventMarker = null;
        this.activeEvent = null;
        this.eventMarker = null;
        this.lastEventTime = Date.now();

        // Toutes les 2 minutes (120000 ms), un événement peut se déclencher pour accroître le monde dynamique
        this.eventInterval = 120000;

        // État de la ville (Blackout)
        this.isBlackout = false;
        this.blackoutEndTime = 0;
    }

    update() {
        if (!this.player || !this.questManager) return;

        const now = Date.now();
        if (!this.activeEvent && now - this.lastEventTime > this.eventInterval) {
            this.triggerRandomEvent();
            this.lastEventTime = now;
        }

        if (this.activeEvent) {
            this.checkEventCompletion();
        }

        // Fin de la coupure de courant
        if (this.isBlackout && now > this.blackoutEndTime) {
            this.endBlackout();
        }
    }

    triggerRandomEvent() {
        const events = ['fire', 'race', 'stray_bot', 'vip_transport', 'blackout', 'accident'];
        const type = events[Math.floor(Math.random() * events.length)];

        let pos = new THREE.Vector3(
            (Math.random() - 0.5) * 400,
            0,
            (Math.random() - 0.5) * 400
        );

        this.activeEvent = {
            type: type,
            targetPos: pos,
            radius: (type === 'race' || type === 'blackout') ? 30 : 15,
            reward: Math.floor(Math.random() * 500) + 500
        };

        if (type === 'blackout') {
            this.initBlackout();
        } else {
            this.createEventMarker(type);
        }

        this.notifyPlayer(type);
    }

    initBlackout() {
        this.isBlackout = true;
        this.blackoutEndTime = Date.now() + 60000; // Dure 1 minute réelle
        if (window.game && window.game.ambientLight) {
            this.originalAmbient = window.game.ambientLight.intensity;
            window.game.ambientLight.intensity = 0.05; // Plonge la ville dans le noir complet
        }
        // Écrire directement dans l'app News si possible
        if (window.game && window.game.mPhoneManager && window.game.mPhoneManager.apps['news']) {
            window.game.mPhoneManager.apps['news'].addLiveNews("COUPURE DE COURANT MAJEURE", "Une gigantesque panne de courant touche actuellement NeoCity. Les techniciens de mCompany travaillent sur le réseau.", "alert");
        }
    }

    endBlackout() {
        this.isBlackout = false;
        if (window.game && window.game.ambientLight) {
            window.game.ambientLight.intensity = this.originalAmbient !== undefined ? this.originalAmbient : 0.5;
        }

        if (window.game && window.game.mPhoneManager && window.game.mPhoneManager.apps['news']) {
            window.game.mPhoneManager.apps['news'].addLiveNews("COURANT RÉTABLI", "Le courant est de nouveau disponible dans NeoCity. mCompany s'excuse pour la gêne occasionnée.", "system");
        }

        // Compléter l'événement automatiquement puisqu'il est temporel
        if (this.activeEvent && this.activeEvent.type === 'blackout') {
            this.activeEvent = null;
        }
    }

    createEventMarker(type) {
        if (this.eventMarker) this.scene.remove(this.eventMarker);

        const geo = new THREE.CylinderGeometry(2, 2, 200, 16);
        let color = 0x00FF00;

        if (type === 'fire') color = 0xFF4400; // Orange/Rouge
        if (type === 'race') color = 0x00FFFF; // Cyan
        if (type === 'stray_bot') color = 0xFFFF00; // Jaune
        if (type === 'vip_transport') color = 0xFF00FF; // Magenta
        if (type === 'accident') color = 0xFF0000; // Rouge alarme ambulance

        const mat = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.5, side: THREE.DoubleSide });
        this.eventMarker = new THREE.Mesh(geo, mat);
        this.eventMarker.position.copy(this.activeEvent.targetPos);
        this.eventMarker.position.y = 100;

        // Pulse effect
        this.pulseInterval = setInterval(() => {
            if (this.eventMarker) this.eventMarker.material.opacity = 0.2 + Math.abs(Math.sin(Date.now() * 0.005)) * 0.6;
        }, 50);

        this.scene.add(this.eventMarker);
    }

    notifyPlayer(type) {
        let msg = "Nouvel événement inconnu détecté !";
        if (type === 'fire') {
            msg = "🔥 URGENT : Incendie signalé au poste de secours !";
            if (window.game && window.game.audioManager) window.game.audioManager.playSound('police_siren');
        }
        if (type === 'race') {
            msg = "🏁 EVENT : Course illégale ! Rejoignez le marqueur géostationnaire.";
            if (window.game && window.game.audioManager) window.game.audioManager.playSound('police_siren'); // Sirene police course
        }
        if (type === 'stray_bot') msg = "🤖 ALERTE : Bot civil défectueux localisé.";
        if (type === 'vip_transport') msg = "💎 OFFRE : Transport VIP sécurisé requis.";
        if (type === 'blackout') msg = "⚡ BLACKOUT : Panne générale sur NeoCity.";
        if (type === 'accident') {
            msg = "🚑 URGENCES : Accident violent à l'intersection la plus proche ! Secours demandés.";
            if (window.game && window.game.audioManager) window.game.audioManager.playSound('police_siren'); // Son ambulance simulé
        }

        // Ajouter aux News de manière fluide
        if (window.game && window.game.mPhoneManager && window.game.mPhoneManager.apps['news']) {
            window.game.mPhoneManager.apps['news'].addLiveNews("Alerte mPhone", msg, type === 'blackout' || type === 'accident' ? 'alert' : 'sys');
        }

        // Notification type mPhone
        const notif = document.createElement('div');
        notif.className = "fixed top-20 right-4 bg-gray-900 border-l-4 border-blue-500 text-white p-4 rounded shadow-2xl z-50 transform transition-all translate-x-full";
        notif.style.width = '300px';
        notif.innerHTML = `
            <div class="flex items-center">
                <span class="text-2xl mr-3">📱</span>
                <div>
                    <h4 class="font-bold text-sm text-blue-400">mPhone Alerte</h4>
                    <p class="text-xs opacity-90">${msg}</p>
                </div>
            </div>
        `;
        document.body.appendChild(notif);

        // Animation Entrée
        setTimeout(() => notif.classList.remove('translate-x-full'), 100);

        // Animation Sortie
        setTimeout(() => {
            notif.classList.add('translate-x-full');
            setTimeout(() => notif.remove(), 500);
        }, 5000);
    }

    checkEventCompletion() {
        const pPos = this.player.mesh.position;
        const ePos = this.activeEvent.targetPos;
        const dist = Math.sqrt(Math.pow(pPos.x - ePos.x, 2) + Math.pow(pPos.z - ePos.z, 2));

        if (dist <= this.activeEvent.radius) {
            this.completeEvent();
        }
    }

    completeEvent() {
        const reward = this.activeEvent.reward;
        alert(`Vous avez terminé l'événement "${this.activeEvent.type}" et gagné ${reward} m's !`);

        if (this.player.engine && this.player.engine.saveManager) {
            this.player.engine.saveManager.addCredits(reward);
            this.player.engine.saveManager.addXp(reward / 2);
            this.player.engine.saveManager.saveGame();
        }

        if (this.eventMarker) {
            this.scene.remove(this.eventMarker);
            this.eventMarker = null;
        }
        clearInterval(this.pulseInterval);
        this.activeEvent = null;
    }
}
