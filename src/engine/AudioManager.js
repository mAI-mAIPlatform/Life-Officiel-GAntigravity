import * as THREE from 'three';

export class AudioManager {
    constructor(camera) {
        this.listener = new THREE.AudioListener();
        camera.add(this.listener);

        this.sounds = {};
        this.audioLoader = new THREE.AudioLoader();

        // Liste simulée, en production, on pointerait vers des vrais .mp3
        this.ambientTracks = [
            { name: 'city_hum', url: '/audio/music/Hum.mp3', loop: true, volume: 0.1 },
            { name: 'city_vibe', url: '/audio/music/City.mp3', loop: true, volume: 0.15 },
            { name: 'night_ambience', url: '/audio/music/Night.mp3', loop: true, volume: 0.1 }
        ];

        this.initAmbient();
    }

    initAmbient() {
        this.ambientTracks.forEach(trackConfig => {
            const sound = new THREE.Audio(this.listener);

            // Simulation de chargement (le loader ne trouvera pas les fichiers si non existants)
            this.audioLoader.load(trackConfig.url, (buffer) => {
                sound.setBuffer(buffer);
                sound.setLoop(trackConfig.loop);
                sound.setVolume(trackConfig.volume);
                this.sounds[trackConfig.name] = sound;

                if (trackConfig.loop) {
                    sound.play(); // Démarrer les sons de fond automatiquement
                }
            }, undefined, (err) => {
                // Ignore l'erreur si fichier absent (pour éviter de bloquer visuellement le jeu pour le USER)
                console.warn(`Audio manquant (Placeholder): ${trackConfig.url}`);
            });
        });
    }

    playSound(name) {
        if (this.sounds[name] && !this.sounds[name].isPlaying) {
            this.sounds[name].play();
        }
    }

    stopSound(name) {
        if (this.sounds[name] && this.sounds[name].isPlaying) {
            this.sounds[name].stop();
        }
    }

    setMasterVolume(value) {
        if (this.listener) {
            this.listener.setMasterVolume(value);
        }
    }
}
