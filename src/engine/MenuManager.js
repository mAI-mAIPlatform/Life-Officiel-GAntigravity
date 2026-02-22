export class MenuManager {
    constructor() {
        this.tabs = ['accueil', 'news', 'store', 'credits', 'pass', 'casier', 'parametres'];
        this.activeTab = 'accueil';

        this.initTabs();
        this.initCodes();
        this.initSettings();
    }

    initTabs() {
        this.tabs.forEach(tab => {
            const btn = document.getElementById(`nav-btn-${tab}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    this.switchTab(tab);
                });
            }
        });

        // Drag to scroll for Life Pass
        const passContainer = document.getElementById('pass-levels-container');
        if (passContainer) {
            let isDown = false;
            let startX;
            let scrollLeft;

            passContainer.addEventListener('mousedown', (e) => {
                isDown = true;
                passContainer.classList.add('cursor-grabbing');
                startX = e.pageX - passContainer.offsetLeft;
                scrollLeft = passContainer.scrollLeft;
            });
            passContainer.addEventListener('mouseleave', () => {
                isDown = false;
                passContainer.classList.remove('cursor-grabbing');
            });
            passContainer.addEventListener('mouseup', () => {
                isDown = false;
                passContainer.classList.remove('cursor-grabbing');
            });
            passContainer.addEventListener('mousemove', (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - passContainer.offsetLeft;
                const walk = (x - startX) * 2;
                passContainer.scrollLeft = scrollLeft - walk;
            });
        }
    }

    initCodes() {
        const redeemBtn = document.getElementById('redeem-code-btn');
        const codeInput = document.getElementById('ms-code-input');

        if (redeemBtn && codeInput) {
            redeemBtn.addEventListener('click', () => {
                this.redeemPromoCode(codeInput.value.trim().toUpperCase());
            });
        }
    }

    switchTab(targetTab) {
        if (this.activeTab === targetTab) return;

        // Hide current tab
        const currentContent = document.getElementById(`tab-${this.activeTab}`);
        if (currentContent) {
            currentContent.classList.add('opacity-0', 'pointer-events-none');
            // setTimeout(() => currentContent.classList.add('hidden'), 300);
        }

        const currentBtn = document.getElementById(`nav-btn-${this.activeTab}`);
        if (currentBtn) {
            currentBtn.classList.remove('text-neonCyan', 'bg-white/10');
            currentBtn.classList.add('text-gray-400');
        }

        // Show new tab
        this.activeTab = targetTab;
        const newContent = document.getElementById(`tab-${this.activeTab}`);
        if (newContent) {
            setTimeout(() => {
                newContent.classList.remove('opacity-0', 'pointer-events-none');
            }, 10);
        }

        const newBtn = document.getElementById(`nav-btn-${this.activeTab}`);
        if (newBtn) {
            newBtn.classList.remove('text-gray-400');
            newBtn.classList.add('text-neonCyan', 'bg-white/10');
        }

        // Refresh UI when entering specific tabs
        if (targetTab === 'casier') {
            this.updateCasierUI();
        } else if (targetTab === 'credits') {
            if (this.engine && this.engine.saveManager) {
                this.engine.saveManager.updateUI();
            }
        } else if (targetTab === 'pass') {
            this.updateLifePassUI();
        } else if (targetTab === 'parametres') {
            this.refreshSettingsUI();
        }
    }

    setEngine(engine) {
        this.engine = engine;
    }

    buySkin(skinId, price) {
        if (!this.engine || !this.engine.saveManager) return;

        const saveMgr = this.engine.saveManager;

        if (saveMgr.state.player.inventory.includes(skinId)) {
            console.log("Skin déjà possédé.");
            // On pourrait afficher un petit toast UI ici
            return;
        }

        if (saveMgr.spendCredits(price)) {
            saveMgr.addToInventory(skinId);
            console.log(`Skin ${skinId} acheté avec succès !`);

            // Mise à jour visuelle du bouton
            const btn = document.querySelector(`#store-item-${skinId} button`);
            if (btn) {
                btn.innerText = "Possédé ✓";
                btn.classList.add("opacity-50", "pointer-events-none");
            }
        } else {
            console.log("Fonds insuffisants.");
            const btn = document.querySelector(`#store-item-${skinId} button`);
            if (btn) {
                const oldText = btn.innerText;
                btn.innerText = "Trop cher";
                btn.classList.add("bg-red-800");
                setTimeout(() => {
                    btn.innerText = oldText;
                    btn.classList.remove("bg-red-800");
                }, 1500);
            }
        }
    }

    redeemPromoCode(code) {
        if (!this.engine || !this.engine.saveManager) return;
        const msgEl = document.getElementById('redeem-message');
        if (!msgEl) return;

        const saveMgr = this.engine.saveManager;

        const validCodes = {
            '500MSCODE': 500,
            '1000MSCODE': 1000,
            '1500MSCODE': 1500,
            '2000MSCODE': 2000,
            '4000MSCODE': 4000,
            '5000MSCODE': 5000,
            '8000MSCODE': 8000,
            '10000MSCODE': 10000,
            '15000MSCODE': 15000,
            '20000MSCODE': 20000
        };

        const reward = validCodes[code];

        if (!reward) {
            msgEl.innerText = "Code Invalide ou Expiré.";
            msgEl.className = "text-sm font-bold min-h-[20px] transition-opacity text-red-500 mt-2";
            return;
        }

        // Initialize usedCodes array if missing (migration)
        if (!saveMgr.state.player.usedCodes) saveMgr.state.player.usedCodes = [];

        if (saveMgr.state.player.usedCodes.includes(code)) {
            msgEl.innerText = "Code déjà utilisé.";
            msgEl.className = "text-sm font-bold min-h-[20px] transition-opacity text-orange-500 mt-2";
            return;
        }

        // Success
        saveMgr.state.player.usedCodes.push(code);
        saveMgr.addCredits(reward);

        msgEl.innerText = `Succès ! +${reward} m's ajoutés.`;
        msgEl.className = "text-sm font-bold min-h-[20px] transition-opacity text-green-500 mt-2";

        // Add a bit of bonus XP for redeeming
        saveMgr.addXp(250);

        const input = document.getElementById('ms-code-input');
        if (input) input.value = '';
        setTimeout(() => {
            msgEl.innerText = "";
        }, 5000);
    }

    updateCasierUI() {
        if (!this.engine || !this.engine.saveManager) return;
        const saveMgr = this.engine.saveManager;
        const inventory = saveMgr.state.player.inventory;
        const equipped = saveMgr.state.player.equippedSkin;

        const grid = document.getElementById('casier-inventory-grid');
        if (!grid) return;

        grid.innerHTML = ''; // Clear current

        const skinsInfo = {
            'default_neon': { name: 'Default Neon', colorClass: 'bg-blue-500', hex: 0x0088FF },
            'red_neon': { name: 'Combinaison Crimson', colorClass: 'bg-red-500', hex: 0xFF2222 },
            'green_cyber': { name: 'Exosquelette Viper', colorClass: 'bg-neonGreen', hex: 0x00FF80 },
            'gold_vip': { name: 'Armure Lumina', colorClass: 'bg-yellow-500', hex: 0xFFD700 }
        };

        inventory.forEach(skinId => {
            const info = skinsInfo[skinId];
            if (!info) return;

            const isEquipped = skinId === equipped;

            const card = document.createElement('div');
            card.className = `bg-gray-800 border-2 ${isEquipped ? 'border-neonCyan shadow-[0_0_15px_rgba(0,255,255,0.3)]' : 'border-gray-700 hover:border-gray-500'} rounded-xl p-4 flex flex-col items-center cursor-pointer transition-all`;

            card.innerHTML = `
                <div class="w-16 h-16 rounded-full ${info.colorClass} mb-2 ${isEquipped ? 'shadow-[0_0_15px_currentColor]' : ''}"></div>
                <span class="text-white font-bold text-sm text-center">${info.name}</span>
                <span class="text-xs ${isEquipped ? 'text-neonCyan' : 'text-gray-500'} mt-1">${isEquipped ? 'ÉQUIPÉ' : 'ÉQUIPER'}</span>
            `;

            if (!isEquipped) {
                card.addEventListener('click', () => {
                    this.equipSkin(skinId, info.hex);
                });
            }

            grid.appendChild(card);
        });
    }

    initSettings() {
        const userBtn = document.getElementById('settings-save-username-btn');
        const userInp = document.getElementById('settings-username-input');
        const pwdBtn = document.getElementById('settings-save-password-btn');
        const pwdInp = document.getElementById('settings-password-input');

        const volumeSlider = document.getElementById('settings-volume');
        const graphicsSelect = document.getElementById('settings-graphics');

        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                const vol = parseInt(e.target.value) / 100;
                if (this.engine && this.engine.audioManager) {
                    this.engine.audioManager.setMasterVolume(vol);
                }
            });
        }

        if (graphicsSelect) {
            graphicsSelect.addEventListener('change', (e) => {
                const quality = e.target.value;
                if (this.engine && this.engine.graphicsManager) {
                    this.engine.graphicsManager.shadowManager.applyQualitySetting(quality);
                }
            });
        }

        if (userBtn && userInp) {
            userBtn.addEventListener('click', () => {
                const newName = userInp.value.trim();
                if (this.engine && this.engine.saveManager) {
                    if (this.engine.saveManager.updateUsername(newName)) {
                        userBtn.innerText = "✓";
                        userBtn.classList.replace('text-neonCyan', 'text-green-500');
                        setTimeout(() => {
                            userBtn.innerText = "OK";
                            userBtn.classList.replace('text-green-500', 'text-neonCyan');
                        }, 2000);
                    } else {
                        userBtn.innerText = "!";
                        userBtn.classList.replace('text-neonCyan', 'text-red-500');
                        setTimeout(() => {
                            userBtn.innerText = "OK";
                            userBtn.classList.replace('text-red-500', 'text-neonCyan');
                        }, 2000);
                    }
                }
            });
        }

        if (pwdBtn && pwdInp) {
            pwdBtn.addEventListener('click', () => {
                const newPwd = pwdInp.value;
                if (this.engine && this.engine.saveManager) {
                    this.engine.saveManager.setPassword(newPwd);
                    pwdBtn.innerText = "Verrouillé";
                    pwdBtn.classList.replace('text-neonCyan', 'text-yellow-500');
                    setTimeout(() => {
                        pwdBtn.innerText = "Cadenas";
                        pwdBtn.classList.replace('text-yellow-500', 'text-neonCyan');
                    }, 2000);
                }
            });
        }
    }

    updateLifePassUI() {
        if (!this.engine || !this.engine.saveManager) return;
        const saveMgr = this.engine.saveManager;
        const currentLevel = saveMgr.state.player.level || 1;
        const currentXp = saveMgr.state.player.xp || 0;

        const container = document.getElementById('pass-levels-container');
        if (!container) return;

        container.innerHTML = ''; // Clear

        import('../data/lifePass.js').then(({ lifePassLevels }) => {
            lifePassLevels.forEach(passData => {
                const i = passData.level;
                const isUnlocked = i <= currentLevel;
                const reward = passData.reward;

                let iconHtml = `<div class="w-8 h-8 rounded bg-gray-500 shadow-lg"></div>`;
                if (reward.type === 'credits') {
                    iconHtml = `<div class="flex items-center gap-1"><img src="./ms/icone.png" class="w-5 h-5" onerror="this.outerHTML='💎'"></div>`;
                } else if (reward.type === 'skin') {
                    iconHtml = `<div class="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 animate-pulse"></div>`;
                } else if (reward.type === 'boost') {
                    iconHtml = `<span class="text-2xl">⚡</span>`;
                } else if (reward.type === 'item' || reward.type === 'vehicle') {
                    iconHtml = `<div class="w-8 h-8 rounded bg-blue-500 shadow-lg flex items-center justify-center font-bold text-white">*</div>`;
                }

                const levelCard = document.createElement('div');
                levelCard.className = `min-w-[180px] h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-2 relative transition-all duration-300 ${isUnlocked
                    ? 'bg-neonGreen/10 border-neonGreen shadow-[0_0_20px_rgba(0,255,128,0.2)]'
                    : 'bg-gray-900/50 border-gray-700 opacity-60'
                    }`;

                if (isUnlocked) {
                    levelCard.innerHTML += `<div class="absolute -top-3 bg-neonGreen text-black text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg">Débloqué ✓</div>`;
                }

                levelCard.innerHTML += `
                    <span class="text-gray-400 text-[10px] uppercase font-bold tracking-widest">Niveau ${i}</span>
                    <div class="flex flex-col items-center gap-1">
                        ${iconHtml}
                        <span class="text-white font-black text-sm uppercase text-center px-2">${reward.name}</span>
                        ${!isUnlocked ? `<span class="text-neonCyan text-[10px] uppercase -mt-1">${passData.requiredXp} XP requis</span>` : ''}
                    </div>
                `;

                container.appendChild(levelCard);
            });

            // Update XP display in the header
            const lvlEl = document.getElementById('pass-current-level');
            const xpText = document.getElementById('pass-current-xp');
            const xpBar = document.getElementById('pass-xp-bar');
            if (lvlEl) lvlEl.innerText = currentLevel;

            // To be accurate with level up limits
            const currentLevelData = lifePassLevels.find(l => l.level === currentLevel);
            const targetXp = currentLevelData ? currentLevelData.requiredXp : (currentLevel * 1000); // 1000 defaults
            const previousTargetXp = currentLevel > 1 ? (currentLevel - 1) * 1000 : 0;
            const xpInLevel = currentXp - previousTargetXp;
            const xpNeededForLevel = targetXp - previousTargetXp;

            if (xpText) xpText.innerText = `${xpInLevel}`;
            // Adjust XP bar relative to progress towards next level
            if (xpBar) xpBar.style.width = `${Math.min(100, (xpInLevel / xpNeededForLevel) * 100)}%`;
        });
    }

    refreshSettingsUI() {
        if (!this.engine || !this.engine.saveManager) return;
        const userInp = document.getElementById('settings-username-input');
        if (userInp) {
            userInp.value = this.engine.saveManager.state.player.username;
        }
        // Pour le mot de passe, on laisse vide par sécurité ou on met des points
        const pwdInp = document.getElementById('settings-password-input');
        if (pwdInp) {
            pwdInp.value = this.engine.saveManager.state.player.password ? "••••••••" : "";
        }
    }
}
