import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { activitesDemo, joueursDemo } from './data/demo';
import type { Activite, Joueur, Presence, Profil } from './types';

const CLE = 'gamer-place/etat-v1';
export const JETONS_DEPART = 1000;
export const RECHARGE = 500;
export const SEUIL_RECHARGE = 100;

type Etat = {
  profil: Profil | null;
  jetons: number;
  derniereRecharge: string | null; // date du jour (AAAA-MM-JJ)
  joueurs: Joueur[];
  activites: Activite[];
};

type Actions = {
  inscrire: (p: Omit<Profil, 'id'>) => void;
  modifierProfil: (p: Partial<Omit<Profil, 'id'>>) => void;
  deconnecter: () => void;
  creerActivite: (a: Omit<Activite, 'id' | 'participants' | 'organisateurId' | 'presences' | 'messages'>) => void;
  basculerParticipation: (activiteId: string) => void;
  indiquerPresence: (activiteId: string, presence: Presence) => void;
  envoyerMessage: (activiteId: string, texte: string) => void;
  // Retire des jetons si le solde suffit ; renvoie false sinon.
  miser: (montant: number) => boolean;
  crediter: (montant: number) => void;
  rechargeDisponible: boolean;
  recharger: () => void;
  nomDe: (id: string) => string;
};

const etatVide: Etat = { profil: null, jetons: 0, derniereRecharge: null, joueurs: [], activites: [] };
const Contexte = createContext<(Etat & Actions & { pret: boolean }) | null>(null);

const nouvelId = () => Math.random().toString(36).slice(2, 10);
const aujourdhui = () => new Date().toISOString().slice(0, 10);

// Complète un état enregistré par une version précédente de l'appli.
function normaliser(e: Partial<Etat>): Etat {
  return {
    ...etatVide,
    ...e,
    activites: (e.activites ?? []).map((a) => ({
      ...a,
      presences: a.presences ?? Object.fromEntries(a.participants.map((p) => [p, 'oui' as Presence])),
      messages: a.messages ?? [],
    })),
  };
}

export function FournisseurEtat({ children }: { children: ReactNode }) {
  const [etat, setEtat] = useState<Etat>(etatVide);
  const [pret, setPret] = useState(false);
  // Solde à jour, lu de façon synchrone par miser().
  const jetonsRef = useRef(0);
  jetonsRef.current = etat.jetons;

  useEffect(() => {
    AsyncStorage.getItem(CLE)
      .then((brut) => brut && setEtat(normaliser(JSON.parse(brut))))
      .catch(() => {})
      .finally(() => setPret(true));
  }, []);

  useEffect(() => {
    if (pret) AsyncStorage.setItem(CLE, JSON.stringify(etat)).catch(() => {});
  }, [etat, pret]);

  const modifierActivite = (id: string, f: (a: Activite, moi: string) => Activite) =>
    setEtat((e) => {
      const moi = e.profil?.id;
      if (!moi) return e;
      return { ...e, activites: e.activites.map((a) => (a.id === id ? f(a, moi) : a)) };
    });

  const actions: Actions = {
    inscrire: (p) =>
      setEtat({
        profil: { ...p, id: nouvelId() },
        jetons: JETONS_DEPART,
        derniereRecharge: null,
        joueurs: joueursDemo(p.ville, p.quartier),
        activites: activitesDemo(p.ville, p.quartier),
      }),
    modifierProfil: (p) => setEtat((e) => (e.profil ? { ...e, profil: { ...e.profil, ...p } } : e)),
    deconnecter: () => setEtat(etatVide),
    creerActivite: (a) =>
      setEtat((e) => {
        if (!e.profil) return e;
        const moi = e.profil.id;
        const activite: Activite = { ...a, id: nouvelId(), participants: [moi], organisateurId: moi, presences: { [moi]: 'oui' }, messages: [] };
        return { ...e, activites: [...e.activites, activite] };
      }),
    basculerParticipation: (id) =>
      modifierActivite(id, (a, moi) => {
        if (a.organisateurId === moi) return a;
        if (a.participants.includes(moi)) {
          const { [moi]: _, ...presences } = a.presences;
          return { ...a, participants: a.participants.filter((x) => x !== moi), presences };
        }
        if (a.participants.length >= a.placesMax) return a;
        return { ...a, participants: [...a.participants, moi], presences: { ...a.presences, [moi]: 'oui' } };
      }),
    indiquerPresence: (id, presence) =>
      modifierActivite(id, (a, moi) => (a.participants.includes(moi) ? { ...a, presences: { ...a.presences, [moi]: presence } } : a)),
    envoyerMessage: (id, texte) =>
      modifierActivite(id, (a, moi) =>
        texte.trim() ? { ...a, messages: [...a.messages, { id: nouvelId(), auteurId: moi, texte: texte.trim(), date: new Date().toISOString() }] } : a,
      ),
    miser: (montant) => {
      if (montant <= 0 || montant > jetonsRef.current) return false;
      jetonsRef.current -= montant;
      setEtat((e) => ({ ...e, jetons: e.jetons - montant }));
      return true;
    },
    crediter: (montant) => {
      jetonsRef.current += montant;
      setEtat((e) => ({ ...e, jetons: e.jetons + montant }));
    },
    rechargeDisponible: etat.jetons < SEUIL_RECHARGE && etat.derniereRecharge !== aujourdhui(),
    recharger: () =>
      setEtat((e) => (e.jetons < SEUIL_RECHARGE && e.derniereRecharge !== aujourdhui() ? { ...e, jetons: e.jetons + RECHARGE, derniereRecharge: aujourdhui() } : e)),
    nomDe: (id) => (id === etat.profil?.id ? etat.profil.pseudo : etat.joueurs.find((j) => j.id === id)?.pseudo ?? 'Joueur'),
  };

  return <Contexte.Provider value={{ ...etat, ...actions, pret }}>{children}</Contexte.Provider>;
}

export function useEtat() {
  const c = useContext(Contexte);
  if (!c) throw new Error('useEtat doit être utilisé dans FournisseurEtat');
  return c;
}
