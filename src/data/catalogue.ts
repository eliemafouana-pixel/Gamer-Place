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
  { id: 'ludo', nom: 'Ludo', emoji: '🎲', disponible: false, description: 'De 2 à 4 joueurs.' },
  { id: 'poker', nom: 'Poker', emoji: '🃏', disponible: false, description: "Texas Hold'em en jetons virtuels." },
  { id: 'bingo', nom: 'Bingo', emoji: '🔢', disponible: false, description: 'Parties de quartier.' },
  { id: 'roulette', nom: 'Roulette', emoji: '🎡', disponible: false, description: 'En jetons virtuels uniquement.' },
  { id: 'machine', nom: 'Machine à sous', emoji: '🎰', disponible: false, description: 'En jetons virtuels uniquement.' },
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
