import * as THREE from 'three';

export const chapter4 = {
    "adv_c4_p1": {
        title: "Chapitre 4 : Partie 1 - La Menace Mécanique",
        description: "Des robots de sécurité sont devenus hors de contrôle. Allez voir le Mécano Joe.",
        dialogue: [
            "Joe : Salut l'ami ! Ici, il y a deux ans, j'avais prévenu mCompany des failles de sécurité...",
            "Joe : Maintenant, leurs bots de patrouille attaquent tout le monde près du Port industriel. Va enquêter."
        ],
        targetPos: new THREE.Vector3(-280, 0, -300),
        radius: 15,
        reward: 600,
        next: "adv_c4_p2"
    },
    "adv_c4_p2": {
        title: "Chapitre 4 : Partie 2 - Le Port Industriel",
        description: "Désactivez les serveurs relais des bots dans la zone du Port",
        dialogue: [
            "Terminal : ...Désactivation des protocoles de combat... ERREUR SYSTÈME. SURCHARGE DU NOYAU.",
            "Système : Le relai principal a été compromis volontairement ! Cherche la source à la décharge."
        ],
        targetPos: new THREE.Vector3(-450, 0, -350),
        radius: 30,
        reward: 1000,
        next: "adv_c4_p3"
    },
    "adv_c4_p3": {
        title: "Chapitre 4 : Partie 3 - La Décharge",
        description: "Trouvez qui a piraté les robots de mCompany.",
        dialogue: [
            "Hacker Inconnu : Trop lent ! Ici, il y a deux ans, la ville m'a tout pris.",
            "Hacker Inconnu : C'est l'heure de mon jugement. On se reverra au Chapitre 5..."
        ],
        targetPos: new THREE.Vector3(-300, 0, -300),
        radius: 20,
        reward: 2000,
        next: "adv_c5_p1"
    }
};
