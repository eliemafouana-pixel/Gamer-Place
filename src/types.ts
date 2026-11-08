export type Sport = 'football' | 'tennis' | 'basket' | 'volley' | 'course' | 'petanque';

export type Profil = {
  id: string;
  pseudo: string;
  ville: string;
  quartier: string;
  jeuxFavoris: string[];
  sportsFavoris: Sport[];
};

export type Joueur = Profil & {
  enLigne: boolean;
};

export type Activite = {
  id: string;
  sport: Sport;
  titre: string;
  lieu: string;
  ville: string;
  quartier: string;
  date: string; // ISO
  placesMax: number;
  participants: string[]; // ids de profils
  organisateurId: string;
  presences: Record<string, Presence>; // par id de profil
  messages: Message[];
};

export type Presence = 'oui' | 'peut-etre' | 'non';

export type Message = {
  id: string;
  auteurId: string;
  texte: string;
  date: string; // ISO
};
