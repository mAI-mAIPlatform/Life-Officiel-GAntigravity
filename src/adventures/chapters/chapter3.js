import * as THREE from 'three';

export const chapter3 = {
    "adv_c3_p1": {
        title: "Chapitre 3 : Partie 1 - Alerte Épédimie",
        description: "Une épidémie d'origine inconnue frappe. Allez d'urgence à l'Hôpital.",
        dialogue: [
            "Docteur : Vite ! Ici, il y a deux ans, une telle épidémie avait failli rayer NeoCity de la carte...",
            "Docteur : Nous avons besoin de l'antidote en urgence. Allez chercher dans les labos abandonnés."
        ],
        targetPos: new THREE.Vector3(200, 0, 80),
        radius: 20,
        reward: 1200,
        next: "adv_c3_p2"
    },
    "adv_c3_p2": {
        title: "Chapitre 3 : Partie 2 - L'Aéroport Abandonné",
        description: "Trouvez l'antidote dans le labo mCompany caché dans la zone de l'Aéroport.",
        dialogue: [
            "Terminal : ACCÈS REFUSÉ... BYPASS EN COURS... ANTIDOTE SÉCURISÉ.",
            "Système : 'Attention, niveau de radiation critique. Quittez la zone immédiatement et livrez l'antidote.'"
        ],
        targetPos: new THREE.Vector3(350, 0, 350),
        radius: 30,
        reward: 1500,
        next: "adv_c3_p3"
    },
    "adv_c3_p3": {
        title: "Fin du chapitre 3",
        description: "Livrez rapidement l'antidote à la Mairie pour sauver NeoCity !",
        dialogue: [
            "Maire : Tu as réussi ! Ici, il y a deux ans, personne n'aurait pu accomplir un tel exploit.",
            "Maire : Tu es un vrai héros de NeoCity. Prends ce véhicule en guise de remerciement."
        ],
        targetPos: new THREE.Vector3(70, 0, 70),
        radius: 15,
        reward: 5000,
        itemReward: '50asset.glb', // Reward: Moto Légendaire
        next: "adv_c4_p1"
    }
};
