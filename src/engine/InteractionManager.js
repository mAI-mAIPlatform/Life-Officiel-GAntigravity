import * as THREE from 'three';

export class InteractionManager {
    constructor(scene, player) {
        this.scene = scene;
        this.player = player;
        this.interactables = [];
        this.currentInteractable = null;
        this.isSitting = false;

        this.sitUI = document.getElementById('sit-ui');

        document.addEventListener('keydown', (e) => this.onKeyDown(e));
    }

    addInteractable(mesh) {
        this.interactables.push(mesh);
    }

    onKeyDown(event) {
        if (event.code === 'KeyX') {
            if (this.isSitting) {
                this.standUp();
            } else if (this.currentInteractable && this.currentInteractable.userData.isSittable) {
                this.sitDown(this.currentInteractable);
            }
        }
    }

    sitDown(object) {
        this.isSitting = true;
        this.player.canMove = false;
        this.player.isActive = false; // Désactive la physique du joueur pendant l'assise

        // Positionner le joueur sur l'objet (un peu au dessus du sol)
        const targetPos = object.position.clone();
        targetPos.y += 0.5; // Ajustement arbitraire pour être "assis"

        this.player.body.position.copy(targetPos);
        this.player.body.velocity.set(0, 0, 0);
        this.player.mesh.position.copy(targetPos);

        if (this.sitUI) {
            this.sitUI.querySelector('span:last-child').innerText = "Se lever";
        }
    }

    standUp() {
        this.isSitting = false;
        this.player.canMove = true;
        this.player.isActive = true;

        if (this.sitUI) {
            this.sitUI.querySelector('span:last-child').innerText = "S'asseoir";
        }
    }

    update() {
        if (!this.player || !this.player.mesh) return;

        let found = null;
        const playerPos = this.player.mesh.position;

        // Optimization: Ne pas traverser toute la scène.
        // On cherche seulement dans les objets désignés comme interactifs.
        for (let obj of this.interactables) {
            if (!obj || !obj.position) continue;
            const dist = playerPos.distanceTo(obj.position);
            if (dist < 4) {
                found = obj;
                break;
            }
        }

        // Si pas trouvé dans la liste explicite, on peut faire un check sporadique 
        // ou désigner les modèles lors de leur chargement.
        if (!found) {
            // Check worldManager landmarks or npcs
            if (window.game && window.game.npcManager) {
                for (let npc of window.game.npcManager.npcs) {
                    if (playerPos.distanceTo(npc.mesh.position) < 5) {
                        found = npc.mesh;
                        break;
                    }
                }
            }
        }

        if (found !== this.currentInteractable) {
            this.currentInteractable = found;
            if (this.sitUI) {
                if (this.currentInteractable && !this.isSitting) {
                    this.sitUI.classList.remove('scale-0', 'opacity-0');
                    this.sitUI.classList.add('scale-100', 'opacity-100');
                } else if (!this.isSitting) {
                    this.sitUI.classList.add('scale-0', 'opacity-0');
                    this.sitUI.classList.remove('scale-100', 'opacity-100');
                }
            }
        }
    }
}
