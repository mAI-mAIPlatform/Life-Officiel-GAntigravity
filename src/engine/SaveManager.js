export class SaveManager {
    constructor() {
        this.saveKey = 'life_game_save_v1';

        // Default state if no save exists
        this.state = {
            player: {
                level: 1,
                xp: 0,
                credits: 500, // "m's"
                equippedSkin: 'default_neon', // ID of equipped item
                inventory: ['default_neon'], // List of owned item IDs
                usedCodes: [], // Track redeemed promo codes
                hunger: 100, // Nouvelle variable v0.0.2
                username: 'PIONEER_77', // Default username
                password: null, // Si le joueur souhaite verrouiller son profil
                job: null // Actuel métier (null, 'police', 'firefighter')
            },
            gameTime: {
                hours: 8, // Start at 8 AM
                minutes: 0,
                day: 1
            },
            quests: {
                completedQuests: []
            }
        };

        this.loadGame();
    }

    loadGame() {
        try {
            const savedData = localStorage.getItem(this.saveKey);
            if (savedData) {
                const parsedData = JSON.parse(savedData);
                // Merge with default state to ensure no missing keys after updates
                this.state = { ...this.state, ...parsedData };

                // Deep merge for nested objects if necessary
                if (parsedData.player) this.state.player = { ...this.state.player, ...parsedData.player };
                if (parsedData.gameTime) this.state.gameTime = { ...this.state.gameTime, ...parsedData.gameTime };
                if (parsedData.quests) this.state.quests = { ...this.state.quests, ...parsedData.quests };

                console.log("Save loaded successfully.", this.state);
            } else {
                console.log("No save found. Starting fresh.");
                this.saveGame(); // Create initial save
            }
        } catch (e) {
            console.error("Failed to load save data:", e);
        }
    }

    saveGame() {
        try {
            localStorage.setItem(this.saveKey, JSON.stringify(this.state));
            console.log("Game saved.");
        } catch (e) {
            console.error("Failed to save game data:", e);
        }
    }

    // --- Helper Methods ---

    addCredits(amount) {
        this.state.player.credits += amount;
        this.saveGame();
        this.updateUI();
    }

    addXp(amount) {
        if (this.state.player.xp === undefined) this.state.player.xp = 0;
        this.state.player.xp += amount;

        let initialLevel = this.state.player.level;
        while (this.state.player.xp >= 1000) {
            this.state.player.level++;
            this.state.player.xp -= 1000;
        }

        if (this.state.player.level > initialLevel) {
            console.log(`Level Up! You are now level ${this.state.player.level}`);
        }

        this.saveGame();
        this.updateUI();
    }

    spendCredits(amount) {
        if (this.state.player.credits >= amount) {
            this.state.player.credits -= amount;
            this.saveGame();
            this.updateUI();
            return true; // Purchase successful
        }
        return false; // Not enough credits
    }

    addToInventory(itemId) {
        if (!this.state.player.inventory.includes(itemId)) {
            this.state.player.inventory.push(itemId);
            this.saveGame();
        }
    }

    equipSkin(itemId) {
        if (this.state.player.inventory.includes(itemId)) {
            this.state.player.equippedSkin = itemId;
            this.saveGame();
            return true;
        }
        return false;
    }

    markQuestComplete(questId) {
        if (!this.state.quests.completedQuests.includes(questId)) {
            this.state.quests.completedQuests.push(questId);
            this.saveGame();
        }
    }

    updateUI() {
        // Update all UI elements displaying credits
        const creditDisplays = document.querySelectorAll('.player-credits-display');
        creditDisplays.forEach(el => {
            el.innerHTML = `<img src="./ms/icone.png" alt="m's" class="w-5 h-5 inline object-contain" onerror="this.outerHTML='💎'"> ${this.state.player.credits} m's`;
        });

        // Update Pass UI
        const xpEl = document.getElementById('pass-current-xp');
        const levelEl = document.getElementById('pass-current-level');
        const barEl = document.getElementById('pass-xp-bar');

        if (xpEl && levelEl && barEl) {
            xpEl.innerText = this.state.player.xp || 0;
            levelEl.innerText = this.state.player.level || 1;
            // Calculer pct pour 50 niveaux (XP progresse avec les niveaux, simplifié ici à max 1000 par niveau)
            const pct = Math.min(100, Math.max(0, ((this.state.player.xp || 0) / 1000) * 100));
            barEl.style.width = `${pct}%`;
        }

        // Update Username
        const usernameDisplays = document.querySelectorAll('.player-username-display');
        usernameDisplays.forEach(el => {
            el.innerText = this.state.player.username;
        });

        // Update Hunger UI (S'il existe)
        const hungerBar = document.getElementById('hunger-bar');
        const hungerText = document.getElementById('hunger-text');
        if (hungerBar && hungerText) {
            const hungerVal = Math.floor(this.state.player.hunger);
            hungerBar.style.width = `${hungerVal}%`;
            hungerText.innerText = `${hungerVal}%`;

            // Changer la couleur selon le niveau
            if (hungerVal > 50) hungerBar.className = 'h-full bg-green-500 rounded-full transition-all duration-500';
            else if (hungerVal > 20) hungerBar.className = 'h-full bg-orange-500 rounded-full transition-all duration-500';
            else hungerBar.className = 'h-full bg-red-600 rounded-full transition-all duration-500 animate-pulse';
        }
    }

    // --- User Profile Functions ---
    updateUsername(newName) {
        if (!newName || newName.length < 3) return false;
        this.state.player.username = newName.substring(0, 15); // Limite de 15 caractères
        this.saveGame();
        this.updateUI();
        return true;
    }

    setPassword(pwd) {
        this.state.player.password = pwd ? btoa(pwd) : null; // Hash basique en base64 pour simuler
        this.saveGame();
    }

    checkPassword(pwd) {
        if (!this.state.player.password) return true;
        return btoa(pwd) === this.state.player.password;
    }

    // --- Hunger Functions ---
    decreaseHunger(amount) {
        if (this.state.player.hunger > 0) {
            this.state.player.hunger = Math.max(0, this.state.player.hunger - amount);
            this.saveGame();
            this.updateUI();
        }
    }

    eat(amount) {
        this.state.player.hunger = Math.min(100, this.state.player.hunger + amount);
        this.saveGame();
        this.updateUI();
    }
}
