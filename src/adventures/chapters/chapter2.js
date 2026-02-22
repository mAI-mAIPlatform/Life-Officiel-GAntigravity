import * as THREE from 'three';

export const chapter2 = {
    "adv_c2_p1": {
        title: "Chapitre 2 : Partie 1 - La Mairie",
        description: "Le Maire a besoin de vous. Allez à la Mairie pour votre prochaine affectation.",
        dialogue: [
            "Maire : Ah, te voilà ! Ici, il y a deux ans, ce bureau était le centre de gestion des crises majeures.",
            "Maire : Un gang sévit près du concessionnaire et paralyse l'économie. J'ai besoin de toi pour inspecter les lieux."
        ],
        targetPos: new THREE.Vector3(70, 0, 70),
        radius: 15,
        reward: 400,
        next: "adv_c2_p2"
    },
    "adv_c2_p2": {
        title: "Chapitre 2 : Partie 2 - Le Concessionnaire",
        description: "Un gang sévit près du concessionnaire. Inspectez les lieux furtivement.",
        dialogue: [
            "Indicateur : Doucement, recrue... Ici, il y a deux ans, c'était le repaire des Scorpions.",
            "Indicateur : J'ai vu où ils planquent leurs armes. Fais un rapport détaillé au Chef de la Police."
        ],
        targetPos: new THREE.Vector3(-200, 0, 200),
        radius: 30,
        reward: 800,
        next: "adv_c2_p3"
    },
    "adv_c2_p3": {
        title: "Chapitre 2 : Partie 3 - Le Rapport",
        description: "Faites votre rapport détaillé au Chef de la Police.",
        dialogue: [
            "Chef : Bon travail, soldat. Les preuves que tu rapportes sont irréfutables.",
            "Chef : Nous allons lancer l'assaut. On te recontactera bientôt pour la suite des opérations."
        ],
        targetPos: new THREE.Vector3(-70, 0, 70),
        radius: 10,
        reward: 1000,
        next: "adv_c3_p1"
    }
};
