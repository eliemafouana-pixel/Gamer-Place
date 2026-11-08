import type { Sport } from '../types';

export type JeuEnLigne = {
  id: string;
  nom: string;
  emoji: string;
  disponible: boolean;
  description: string;
};

// Toutes les parties se jouent en jetons virtuels. L'argent réel n'est pas
// prévu dans cette version : en France, seul le poker peut l'être, avec un
// agrément de l'ANJ.
export const JEUX: JeuEnLigne[] = [
  { id: 'dames', nom: 'Dames', emoji: '⚫', disponible: true, description: 'Dames françaises 10×10, à deux sur le même téléphone.' },
  { id: 'ludo', nom: 'Ludo', emoji: '🎲', disponible: true, description: 'Contre 3 adversaires. Le gagnant rafle la mise.' },
  { id: 'poker', nom: 'Poker', emoji: '🃏', disponible: true, description: "Texas Hold'em contre 3 adversaires." },
  { id: 'bingo', nom: 'Bingo', emoji: '🔢', disponible: true, description: 'Le premier à compléter une ligne gagne la cagnotte.' },
  { id: 'roulette', nom: 'Roulette', emoji: '🎡', disponible: true, description: 'Roulette européenne : numéros, couleurs, douzaines.' },
  { id: 'machine', nom: 'Machine à sous', emoji: '🎰', disponible: true, description: "Trois symboles identiques et c'est le jackpot." },
];

export const SPORTS: { id: Sport; nom: string; emoji: string }[] = [
  { id: 'football', nom: 'Football', emoji: '⚽' },
  { id: 'tennis', nom: 'Tennis', emoji: '🎾' },
  { id: 'basket', nom: 'Basket', emoji: '🏀' },
  { id: 'volley', nom: 'Volley', emoji: '🏐' },
  { id: 'course', nom: 'Course à pied', emoji: '🏃' },
  { id: 'petanque', nom: 'Pétanque', emoji: '🥎' },
];

export const sportInfo = (id: Sport) => SPORTS.find((s) => s.id === id)!;
