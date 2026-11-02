import type { Activite, Joueur } from '../types';

// Données de démonstration, en attendant le serveur (comptes réels,
// géolocalisation, messagerie). Elles sont placées dans la ville de
// l'utilisateur à l'inscription pour que l'appli ne soit pas vide.
export function joueursDemo(ville: string, quartier: string): Joueur[] {
  const autre = 'Centre-ville';
  return [
    { id: 'd1', pseudo: 'Karim_93', ville, quartier, jeuxFavoris: ['dames', 'poker'], sportsFavoris: ['football'], enLigne: true },
    { id: 'd2', pseudo: 'Sophie.L', ville, quartier, jeuxFavoris: ['ludo'], sportsFavoris: ['tennis', 'course'], enLigne: false },
    { id: 'd3', pseudo: 'Moussa', ville, quartier: autre, jeuxFavoris: ['dames'], sportsFavoris: ['basket'], enLigne: true },
    { id: 'd4', pseudo: 'Julie_V', ville, quartier: autre, jeuxFavoris: ['bingo', 'ludo'], sportsFavoris: ['volley'], enLigne: true },
    { id: 'd5', pseudo: 'Thomas', ville, quartier, jeuxFavoris: ['poker'], sportsFavoris: ['petanque', 'football'], enLigne: false },
  ];
}

export function activitesDemo(ville: string, quartier: string): Activite[] {
  const dans = (jours: number, heure: number) => {
    const d = new Date();
    d.setDate(d.getDate() + jours);
    d.setHours(heure, 0, 0, 0);
    return d.toISOString();
  };
  return [
    { id: 'a1', sport: 'football', titre: 'Foot à 5', lieu: 'City stade', ville, quartier, date: dans(1, 18), placesMax: 10, participants: ['d1', 'd5'], organisateurId: 'd1' },
    { id: 'a2', sport: 'tennis', titre: 'Double amical', lieu: 'Courts municipaux', ville, quartier, date: dans(2, 10), placesMax: 4, participants: ['d2'], organisateurId: 'd2' },
    { id: 'a3', sport: 'basket', titre: '3 contre 3', lieu: 'Playground du parc', ville, quartier: 'Centre-ville', date: dans(3, 17), placesMax: 6, participants: ['d3'], organisateurId: 'd3' },
  ];
}
