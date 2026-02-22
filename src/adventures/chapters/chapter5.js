import * as THREE from 'three';

export const chapter5 = {
    "adv_c5_p1": {
        title: "Chapitre 5 : Partie 1 - L'Ombre du Hacker",
        description: "Le Hacker a fui. Allez voir le Chef de la Police pour organiser une traque.",
        dialogue: [
            "Chef : On a intercepté un signal crypté. Ici, il y a deux ans, ce type travaillait pour nous...",
            "Chef : Ses traces mènent au sommet de la Tour Centrale. Sois prudent."
        ],
        targetPos: new THREE.Vector3(-70, 0, 70),
        radius: 15,
        reward: 800,
        next: "adv_c5_p2"
    },
    "adv_c5_p2": {
        title: "Chapitre 5 : Partie 2 - La Tour Centrale",
        description: "Pénétrez dans la Tour Centrale et confrontez le Hacker.",
        dialogue: [
            "Hacker : Tu n'aurais jamais dû venir ici. Le protocole de suppression totale est activé !",
            "Hacker : NeoCity va retourner à l'âge de pierre !"
        ],
        targetPos: new THREE.Vector3(100, 0, -200),
        radius: 40,
        reward: 2000,
        next: "adv_c5_p3"
    },
    "adv_c5_p3": {
        title: "Chapitre 5 : Mission Finale",
        description: "Désamorcez les bombes d'impulsion électromagnétique (IEM) posées par le Hacker.",
        dialogue: [
            "Système : Séquence d'annulation : O U R O B O R O S... Acceptée.",
            "Hacker : Non... C'est impossible. Tu m'as battu."
        ],
        targetPos: new THREE.Vector3(0, 0, 0),
        radius: 20,
        reward: 10000,
        itemReward: 'default_neon', // Just a placeholder for another special skin/vehicle
        next: null
    }
};
