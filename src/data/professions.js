export const professionsData = [
    { id: 'police', name: 'Policier', salary: 150, description: 'Maintenir l\'ordre dans NeoCity.' },
    { id: 'firefighter', name: 'Pompier', salary: 140, description: 'Éteindre les incendies urbains.' },
    { id: 'architect', name: 'Architecte', salary: 200, description: 'Concevoir de nouveaux modules d\'habitat.' },
    { id: 'ia_dev', name: 'Développeur IA', salary: 250, description: 'Programmer les intelligences synthétiques.' },
    { id: 'journalist', name: 'Journaliste', salary: 120, description: 'Rapporter la vérité... ou presque.' },
    { id: 'cook', name: 'Chef Cuisinier', salary: 130, description: 'Nourrir les citoyens affamés.' },
    { id: 'lawyer', name: 'Avocat', salary: 300, description: 'Défendre les droits des IA libres.' },
    { id: 'teacher', name: 'Professeur', salary: 110, description: 'Instruire la nouvelle génération.' },
    { id: 'photographer', name: 'Photographe', salary: 100, description: 'Capturer la beauté des néons.' },
    { id: 'doctor', name: 'Médecin', salary: 280, description: 'Soigner les blessures et glitches.' },
    { id: 'real_estate', name: 'Agent Immobilier', salary: 180, description: 'Vendre des lofts avec vue.' },
    { id: 'pilot', name: 'Pilote', salary: 220, description: 'Naviguer dans l\'espace aérien saturé.' },
    { id: 'mechanic', name: 'Mécanicien', salary: 140, description: 'Réparer les véhicules endommagés.' },
    { id: 'delivery', name: 'Livreur', salary: 90, description: 'Livrer des colis ultra-rapides.' },
    { id: 'hacker', name: 'Hacker éthique', salary: 260, description: 'Protéger mCompany des cyberattaques.' },
    { id: 'bounty_hunter', name: 'Chasseur de primes', salary: 350, description: 'Traquer les fugitifs.' },
    { id: 'musician', name: 'Musicien', salary: 100, description: 'Jouer sur NeoHits.' },
    { id: 'influencer', name: 'Influenceur Vids', salary: 200, description: 'Faire des vidéos virales.' },
    { id: 'trader', name: 'Trader mCoins', salary: 400, description: 'Spéculer sur la cryptomonnaie locale.' },
    { id: 'mayor_assistant', name: 'Assistant du Maire', salary: 160, description: 'Gérer l\'administration bureaucratique.' }
];

export function getProfessionById(id) {
    return professionsData.find(p => p.id === id) || null;
}
