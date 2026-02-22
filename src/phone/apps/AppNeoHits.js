export class AppNeoHits {
    constructor(engine) {
        this.engine = engine;
        this.appId = 'neohits';
        this.audioPlayer = new Audio();
        this.isPlaying = false;

        // Liste simulée, idéalement on aurait un manifeste
        this.playlist = [
            { title: "Abyssal Pressure", file: "/audio/music/Abyssal_Pressure.mp3" },
            { title: "Algorithmic Ascent", file: "/audio/music/Algorithmic_Ascent.mp3" },
            { title: "Ascension of the Dawn", file: "/audio/music/Ascension_of_the_Dawn.mp3" },
            { title: "Big House", file: "/audio/music/Big House.mp3" },
            { title: "BPM", file: "/audio/music/BPM.mp3" },
            { title: "But", file: "/audio/music/But.mp3" },
            { title: "Call Me", file: "/audio/music/Call Me.mp3" },
            { title: "Calm Down", file: "/audio/music/Calm Down.mp3" },
            { title: "Catwalk Cascade", file: "/audio/music/Catwalk_Cascade.mp3" },
            { title: "Chrome Concrete", file: "/audio/music/Chrome_Concrete.mp3" },
            { title: "Chrono Fracture", file: "/audio/music/Chrono_Fracture.mp3" },
            { title: "City Life", file: "/audio/music/City.mp3" },
            { title: "Code Red Protocol", file: "/audio/music/Code_Red_Protocol.mp3" },
            { title: "Corridor Echoes", file: "/audio/music/Corridor_Echoes.mp3" },
            { title: "Dark Mode", file: "/audio/music/Dark Mode.mp3" },
            { title: "Digital Cascade", file: "/audio/music/Digital_Cascade.mp3" },
            { title: "Digital Dawn Breaker", file: "/audio/music/Digital_Dawn_Breaker.mp3" },
            { title: "Heavy Beats", file: "/audio/music/Heavy.mp3" },
            { title: "Here", file: "/audio/music/Here.mp3" },
            { title: "HP", file: "/audio/music/HP.mp3" },
            { title: "Hum", file: "/audio/music/Hum.mp3" },
            { title: "Hydraulic Symphony", file: "/audio/music/Hydraulic_Symphony.mp3" },
            { title: "Just Think", file: "/audio/music/Just Think.mp3" },
            { title: "Legends", file: "/audio/music/Legends.mp3" },
            { title: "Level Up", file: "/audio/music/Level Up.mp3" },
            { title: "Metal Cyber", file: "/audio/music/Metal .mp3" },
            { title: "NeoCity Night", file: "/audio/music/NeoCity .mp3" },
            { title: "Neon Noodle Nights", file: "/audio/music/Neon_Noodle_Nights.mp3" },
            { title: "Night City", file: "/audio/music/Night.mp3" },
            { title: "Pixel World", file: "/audio/music/Pixel .mp3" },
            { title: "Prism", file: "/audio/music/Prism .mp3" },
            { title: "Quantum Bloom", file: "/audio/music/Quantum_Bloom.mp3" },
            { title: "Quantum Velocity", file: "/audio/music/Quantum_Velocity.mp3" },
            { title: "Serenity", file: "/audio/music/Serenity.mp3" },
            { title: "Speeder", file: "/audio/music/Speeder.mp3" },
            { title: "Stardust Slumber", file: "/audio/music/Stardust_Slumber.mp3" },
            { title: "Static Dominion", file: "/audio/music/Static_Dominion.mp3" },
            { title: "Stop It", file: "/audio/music/Stop It.mp3" },
            { title: "Subterranean Pulse", file: "/audio/music/Subterranean_Pulse.mp3" },
            { title: "Together", file: "/audio/music/Together.mp3" },
            { title: "Vibe", file: "/audio/music/Vibe.mp3" },
            { title: "Violet Dreams", file: "/audio/music/Violet_Dreams.mp3" },
            { title: "West Coast", file: "/audio/music/West Coast.mp3" },
            { title: "Zero Hour Heist", file: "/audio/music/Zero_Hour_Heist.mp3" }
        ];
        this.currentTrackIndex = 0;

        // Setup Player events
        this.audioPlayer.addEventListener('ended', () => this.nextTrack());
    }

    render() {
        const container = document.createElement('div');
        container.className = 'w-full h-full flex flex-col items-center bg-gray-900 text-white pb-4';

        let html = `
            <div class="w-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-teal-900 to-gray-900 rounded-b-[40px] shadow-lg mb-6">
                <div class="w-32 h-32 rounded-full bg-teal-500 flex items-center justify-center text-5xl shadow-[0_0_30px_#14b8a6] mb-6 ${this.isPlaying ? 'animate-[spin_4s_linear_infinite]' : ''}" id="neohits-disc">
                    🎵
                </div>
                <h2 id="neohits-title" class="text-lg font-bold text-center text-teal-100">${this.playlist[this.currentTrackIndex].title}</h2>
                <p class="text-xs text-teal-400 opacity-80 mt-1">FM 104.2 NeoHits</p>
            </div>
            
            <div class="flex items-center justify-center space-x-6 w-full px-8">
                <button id="btn-prev" class="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 transition">⏪</button>
                <button id="btn-play" class="w-16 h-16 flex items-center justify-center bg-teal-600 rounded-full hover:bg-teal-500 shadow-[0_0_15px_#14b8a6] transition text-xl">
                    ${this.isPlaying ? '⏸' : '▶'}
                </button>
                <button id="btn-next" class="w-12 h-12 flex items-center justify-center bg-gray-800 rounded-full hover:bg-gray-700 transition">⏩</button>
            </div>
            
            <div class="mt-8 px-6 w-full text-center text-xs text-gray-500">
                <p>Ajoutez vos fichiers MP3 dans <br><code class="text-teal-400 bg-gray-800 px-1 rounded">public/audio/music/</code><br> et modifiez la playlist dans AppNeoHits.js</p>
            </div>
        `;

        container.innerHTML = html;

        setTimeout(() => {
            const btnPlay = document.getElementById('btn-play');
            const btnPrev = document.getElementById('btn-prev');
            const btnNext = document.getElementById('btn-next');

            if (btnPlay) btnPlay.addEventListener('click', () => this.togglePlay());
            if (btnPrev) btnPrev.addEventListener('click', () => this.prevTrack());
            if (btnNext) btnNext.addEventListener('click', () => this.nextTrack());
        }, 100);

        return container;
    }

    togglePlay() {
        if (this.isPlaying) {
            this.audioPlayer.pause();
            this.isPlaying = false;
        } else {
            this.audioPlayer.src = this.playlist[this.currentTrackIndex].file;
            this.audioPlayer.play().catch(e => {
                console.warn("Erreur lecture audio (fichier introuvable ?). Placez un fichier dans public/audio/music/");
                alert("Fichier audio introuvable. Ajoutez des musiques dans public/audio/music/.");
                this.isPlaying = false;
                this.updateUI();
            });
            this.isPlaying = true;
        }
        this.updateUI();
    }

    nextTrack() {
        this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
        this.isPlaying = false;
        this.togglePlay();
    }

    prevTrack() {
        this.currentTrackIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
        this.isPlaying = false;
        this.togglePlay();
    }

    updateUI() {
        const btnPlay = document.getElementById('btn-play');
        const title = document.getElementById('neohits-title');
        const disc = document.getElementById('neohits-disc');

        if (btnPlay) btnPlay.innerText = this.isPlaying ? '⏸' : '▶';
        if (title) title.innerText = this.playlist[this.currentTrackIndex].title;

        if (disc) {
            if (this.isPlaying) disc.classList.add('animate-[spin_4s_linear_infinite]');
            else disc.classList.remove('animate-[spin_4s_linear_infinite]');
        }
    }
}
