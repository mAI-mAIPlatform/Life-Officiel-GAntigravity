export const dialogueDatabase = {
    civilian: [
        {
            text: "Salut ! C'est une belle journée à NeoCity, tu ne trouves pas ?",
            choices: [
                { text: "Oui, le temps est parfait.", reply: "Absolument ! J'espère que ça va durer." },
                { text: "Je n'ai pas le temps pour ça.", reply: "Oh, pardon. Bonne journée quand même..." }
            ]
        },
        {
            text: "As-tu entendu parler des rumeurs sur mCompany ?",
            choices: [
                { text: "Quelles rumeurs ?", reply: "Ils diraient qu'ils créent des IA dangereuses en secret." },
                { text: "Ce ne sont que des ragots.", reply: "Tu as sans doute raison, je me fais des films." }
            ]
        },
        {
            text: "Pfiou, je viens de finir mon service à l'usine. Je suis crevé.",
            choices: [
                { text: "Bon courage pour le repos.", reply: "Merci, je vais dormir pendant deux jours je crois !" },
                { text: "Le travail c'est la santé.", reply: "Facile à dire, ha ha !" }
            ]
        },
        {
            text: "C'est difficile de trouver des bons crédits de nos jours.",
            choices: [
                { text: "Essaie les zones sombres.", reply: "Non merci, je tiens à la vie !" },
                { text: "Pense au Life Pass, ça aide.", reply: "Ah oui, j'ai vu la pub. Je vais regarder." }
            ]
        }
        // Pour les besoins de la taille du fichier, je vais générer une fonction
        // d'aide pour générer dynamiquement des dizaines de dialogues basiques.
    ],
    police: [
        {
            text: "Halte ! Identifiez-vous.",
            choices: [
                { text: "Je suis un citoyen honnête.", reply: "C'est ce qu'on va voir. Circulez pour cette fois." },
                { text: "[Montrer l'insigne] C'est bon, agent.", reply: "Compris, désolé du dérangement." }
            ]
        },
        {
            text: "Il y a eu des vols dans le quartier. Ouvre l'oeil.",
            choices: [
                { text: "Je ferai attention.", reply: "Faites le 17 au moindre suspect." },
                { text: "C'est votre travail de gérer ça.", reply: "Et je le fais ! Mais la civique compte aussi." }
            ]
        },
        {
            text: "Zone restreinte, passez votre chemin.",
            choices: [
                { text: "D'accord, je pars.", reply: "Bonne décision." },
                { text: "Pourquoi c'est restreint ?", reply: "C'est classé défense. Continuez de marcher." }
            ]
        }
    ],
    medical: [
        {
            text: "Comment vous sentez-vous aujourd'hui ?",
            choices: [
                { text: "En pleine forme, docteur.", reply: "Parfait, gardez une bonne hygiène de vie." },
                { text: "J'ai mal partout...", reply: "Prenez ces antalgiques et reposez-vous à l'Hôpital." }
            ]
        },
        {
            text: "Ne restez pas trop près des déchets toxiques de la zone 4.",
            choices: [
                { text: "C'est si dangereux ?", reply: "Les radiations mutent les cellules plus vite qu'on ne le pense." },
                { text: "Je sais me protéger.", reply: "Mieux vaut prévenir que guérir." }
            ]
        }
    ],
    hacker: [
        {
            text: "1011001... T'es qui toi ?",
            choices: [
                { text: "Juste un passant.", reply: "Un passant qui fouille trop près de mes terminaux..." },
                { text: "Je cherche des infos sur mCompany.", reply: "Ah, ça m'intéresse. Viens dans la ruelle." }
            ]
        },
        {
            text: "Les pare-feus de la ville sont une blague.",
            choices: [
                { text: "Tu peux les pirater ?", reply: "Je pourrais éteindre la Mairie en 10 secondes." },
                { text: "C'est illégal.", reply: "L'illégalité est un concept subjectif." }
            ]
        }
    ],
    merchant: [
        {
            text: "Regardez ma marchandise, produits 100% légaux !",
            choices: [
                { text: "Qu'est-ce que vous vendez ?", reply: "Des pièces de rechange, un peu de nourriture... du classique." },
                { text: "J'en doute fort.", reply: "Hé ! C'est insultant. Allez voir ailleurs si j'y suis." }
            ]
        },
        {
            text: "Achetez maintenant, les prix vont monter demain !",
            choices: [
                { text: "C'est du bluff marchand.", reply: "Si tu le dis, mais viens pas pleurer plus tard !" },
                { text: "Je prends tout ce que vous avez.", reply: "C'est une blague ? Je n'ai pas assez de stock !" }
            ]
        }
    ],
    mechanic: [
        {
            text: "Ton moteur fait un drôle de bruit...",
            choices: [
                { text: "Tu peux réparer ça ?", reply: "Ouais, donne-moi 10 minutes et un peu de ferraille." },
                { text: "Il marche très bien.", reply: "C'est ton cercueil, pas le mien !" }
            ]
        },
        {
            text: "J'adore l'odeur de l'huile moteur au petit matin.",
            choices: [
                { text: "Moi je préfère le café.", reply: "Chacun son truc, gamin." },
                { text: "C'est toxique, tu sais ?", reply: "C'est ce qui me maintient en vie." }
            ]
        }
    ]
};

// Generates an extended database by extrapolating random combos
const templates = {
    civilian: [
        "J'attends le bus depuis des heures.", "Le prix de l'immobilier explose.", "J'ai perdu mon passe passe Navigo...",
        "Avez-vous vu les dernières infos ?", "Il paraît qu'une tempête approche.", "NeoCity ne dort jamais, n'est-ce pas ?",
        "Je suis fatigué de cette routine.", "Vous cherchez aussi le centre commercial ?", "Quelqu'un a volé mon portefeuille ce matin !",
        "L'air est particulièrement pollué aujourd'hui.", "C'est difficile de se faire des amis en ville.", "Je dois aller récupérer mes colis."
    ],
    police: [
        "Mains en l'air !", "Vous roulez trop vite.", "Zone sécurisée.", "Ne traînez pas dans ce secteur la nuit.",
        "Avez-vous vos papiers d'identité ?", "Tout comportement suspect sera sanctionné.", "Circulez, il n'y a rien à voir.",
        "La milice vous surveille.", "Loi numéro 42 : pas de rassemblements.", "Vous dépassez les limites autorisées."
    ],
    medical: [
        "Vos constantes sont stables.", "Besoin d'un check-up ?", "La santé avant tout, citoyen.",
        "Prenez ces vitamines.", "Faites attention aux radiations du secteur 4.", "Avez-vous des antécédents médicaux ?",
        "L'hôpital est actuellement surchargé.", "N'oubliez pas de vous hydrater.", "Votre rythme cardiaque est élevé."
    ],
    hacker: [
        "J'ai bypassé le mainframe.", "Le code source est corrompu.", "Ne me dérange pas, je suis dans la matrice.",
        "Les firewalls de la Mairie sont obsolètes.", "1001001... bug systematique.", "Tu veux des crédits cryptés ?",
        "Je vends des accès réseau sécurisés.", "Mon dernier script a crashé le serveur de la banque.", "Laisse-moi, je compile."
    ],
    merchant: [
        "Solde exceptionnel !", "Dernière offre !", "Tout doit disparaître !", "J'ai les meilleurs prix de NeoCity.",
        "Vous cherchez quelque chose d'introuvable ?", "Achetez deux, le troisième est à moitié prix.", "Qualité garantie ou remboursé.",
        "Nouveaux arrivages demain, revenez me voir.", "Ne marchandez pas avec moi, c'est déjà donné."
    ],
    mechanic: [
        "La courroie est morte.", "Ça va te coûter cher en huile.", "Rien qu'un coup de clé à molette ne puisse réparer.",
        "Ton moteur tourne sur trois cylindres.", "Faut que je vérifie les bougies.", "Ça fera 500 crédits l'heure de main d'oeuvre.",
        "J'adore la mécanique quantique inversée.", "Ne roule pas sur la réserve, ton filtre va s'encrasser."
    ]
};

const choiceTemplates = [
    { c1: "Intéressant.", r1: "N'est-ce pas ?", c2: "Aucun intérêt.", r2: "Tant pis pour toi." },
    { c1: "Je suis d'accord.", r1: "C'est rassurant.", c2: "C'est faux.", r2: "On a le droit de ne pas être d'accord." },
    { c1: "C'est formidable !", r1: "Super, merci.", c2: "C'est horrible.", r2: "C'est la vie à NeoCity." },
    { c1: "Combien ça coûte ?", r1: "Plus que tu ne l'imagines.", c2: "Je passe mon tour.", r2: "Comme tu veux." },
    { c1: "Et alors ?", r1: "Et alors rien, c'est tout.", c2: "Je préfère ne pas savoir.", r2: "L'ignorance est reposante." },
    { c1: "Tu plaisantes ?", r1: "Je suis très sérieux.", c2: "Je te crois.", r2: "Tu fais bien." }
];

// Populate up to 500+ dialogues
for (let role in templates) {
    if (!dialogueDatabase[role]) dialogueDatabase[role] = [];

    // Loop 100 times per role (6 roles * 100 = 600 combinations generated + the hardcoded above)
    for (let i = 0; i < 100; i++) {
        let tIndex = Math.floor(Math.random() * templates[role].length);
        let cIndex = Math.floor(Math.random() * choiceTemplates.length);

        dialogueDatabase[role].push({
            text: templates[role][tIndex],
            choices: [
                { text: choiceTemplates[cIndex].c1, reply: choiceTemplates[cIndex].r1 },
                { text: choiceTemplates[cIndex].c2, reply: choiceTemplates[cIndex].r2 }
            ]
        });
    }
}

export const getRandomAdvancedDialogue = (role = 'civilian') => {
    const list = dialogueDatabase[role] || dialogueDatabase.civilian;
    const index = Math.floor(Math.random() * list.length);
    return list[index];
};
