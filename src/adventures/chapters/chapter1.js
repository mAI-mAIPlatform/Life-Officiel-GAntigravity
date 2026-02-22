import * as THREE from 'three';

export const chapter1 = {
    "adv_intro": {
        title: "Introduction",
        description: "Bienvenue à NeoCity. Allez parler à l'agent d'accueil près de la place centrale.",
        dialogue: [
            "Agent : Bienvenue à NeoCity, recrue. Ici, il y a deux ans, tout a basculé.",
            "Agent : La ville s'est reconstruite sur les cendres de l'ancien monde. Ton rôle commencera à la Pizzeria de Luigi."
        ],
        targetPos: new THREE.Vector3(10, 0, 10),
        radius: 15,
        reward: 100,
        next: "adv_c1_p1"
    },
    "adv_c1_p1": {
        title: "Chapitre 1 : Partie 1 - La Pizzeria",
        description: "Rendez-vous à la Pizzeria de Luigi pour collecter vos premières informations sur la ville.",
        dialogue: [
            "Luigi : Ciao ! Ici, il y a deux ans, je vendais mes pizzas à une équipe de mercenaires...",
            "Luigi : Ils m'ont parlé d'une cache secrète dans la Zone Sombre. Vas-y jeter un œil, on ne sait jamais."
        ],
        targetPos: new THREE.Vector3(20, 0, 20),
        radius: 10,
        reward: 200,
        next: "adv_c1_p2"
    },
    "adv_c1_p2": {
        title: "Chapitre 1 : Partie 2 - Zone Sombre",
        description: "Fouillez la Zone Sombre pour trouver des pièces détachées volées.",
        dialogue: [
            "Mystérieux Contact : Tu as trouvé les pièces ? Ici, il y a deux ans, on fabriquait des armes avec ça.",
            "Mystérieux Contact : Apporte-les au Mécano Joe de ma part... Ne pose pas de questions."
        ],
        targetPos: new THREE.Vector3(200, 0, 100),
        radius: 20,
        reward: 300,
        next: "adv_c1_p3"
    },
    "adv_c1_p3": {
        title: "Chapitre 1 : Partie 3 - Le Mécano",
        description: "Apportez les pièces au Mécano Joe pour améliorer ses outils.",
        dialogue: [
            "Joe : Super, ces pièces sont introuvables aujourd'hui ! Ici, il y a deux ans, tout le monde en avait.",
            "Joe : Tiens, prends ça. C'est un de mes chef-d'œuvres. Et le Maire veut te parler, fonce à la Mairie."
        ],
        targetPos: new THREE.Vector3(-280, 0, -300),
        radius: 15,
        reward: 500,
        itemReward: '37asset.glb', // Reward: Katana Néon
        next: "adv_c2_p1"
    }
};
