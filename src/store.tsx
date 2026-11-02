import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { activitesDemo, joueursDemo } from './data/demo';
import type { Activite, Joueur, Profil } from './types';

const CLE = 'gamer-place/etat-v1';
export const JETONS_DEPART = 1000;

type Etat = {
  profil: Profil | null;
  jetons: number;
  joueurs: Joueur[];
  activites: Activite[];
};

type Actions = {
  inscrire: (p: Omit<Profil, 'id'>) => void;
  modifierProfil: (p: Partial<Omit<Profil, 'id'>>) => void;
  deconnecter: () => void;
  creerActivite: (a: Omit<Activite, 'id' | 'participants' | 'organisateurId'>) => void;
  basculerParticipation: (activiteId: string) => void;
};

const etatVide: Etat = { profil: null, jetons: 0, joueurs: [], activites: [] };
const Contexte = createContext<(Etat & Actions & { pret: boolean }) | null>(null);

const nouvelId = () => Math.random().toString(36).slice(2, 10);

export function FournisseurEtat({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>(etatVide);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(CLE)
      .then((brut) => brut && setEtat(JSON.parse(brut)))
      .catch(() => {})
      .finally(() => setPret(true));
  }, []);

  useEffect(() => {
    if (pret) AsyncStorage.setItem(CLE, JSON.stringify(etat)).catch(() => {});
  }, [etat, pret]);

  const actions: Actions = {
    inscrire: (p) =>
      setEtat({
        profil: { ...p, id: nouvelId() },
        jetons: JETONS_DEPART,
        joueurs: joueursDemo(p.ville, p.quartier),
        activites: activitesDemo(p.ville, p.quartier),
      }),
    modifierProfil: (p) => setEtat((e) => (e.profil ? { ...e, profil: { ...e.profil, ...p } } : e)),
    deconnecter: () => setEtat(etatVide),
    creerActivite: (a) =>
      setEtat((e) => {
        if (!e.profil) return e;
        const activite: Activite = { ...a, id: nouvelId(), participants: [e.profil.id], organisateurId: e.profil.id };
        return { ...e, activites: [...e.activites, activite] };
      }),
    basculerParticipation: (activiteId) =>
      setEtat((e) => {
        const moi = e.profil?.id;
        if (!moi) return e;
        return {
          ...e,
          activites: e.activites.map((a) => {
            if (a.id !== activiteId || a.organisateurId === moi) return a;
            const inscrit = a.participants.includes(moi);
            if (!inscrit && a.participants.length >= a.placesMax) return a;
            return { ...a, participants: inscrit ? a.participants.filter((x) => x !== moi) : [...a.participants, moi] };
          }),
        };
      }),
  };

  return <Contexte.Provider value={{ ...etat, ...actions, pret }}>{children}</Contexte.Provider>;
}

export function useEtat() {
  const c = useContext(Contexte);
  if (!c) throw new Error('useEtat doit être utilisé dans FournisseurEtat');
  return c;
}
