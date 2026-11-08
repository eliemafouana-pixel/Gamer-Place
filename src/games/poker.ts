// Texas Hold'em No Limit : le joueur contre 3 adversaires gérés par l'ordinateur.
import { melanger } from './hasard';

export type Carte = { r: number; c: '♠' | '♥' | '♦' | '♣' }; // r de 2 à 14 (as)
export type Phase = 'preflop' | 'flop' | 'turn' | 'river' | 'fin';

export type JoueurPoker = {
  nom: string;
  humain: boolean;
  jetons: number;
  mise: number; // misé sur le tour d'enchères en cours
  contribution: number; // misé sur toute la main
  cartes: Carte[];
  couche: boolean;
  aParle: boolean;
};

export type Table = {
  joueurs: JoueurPoker[];
  paquet: Carte[];
  tableau: Carte[];
  phase: Phase;
  donneur: number;
  actif: number;
  miseCourante: number;
  relanceMin: number;
  petiteBlinde: number;
  journal: string[];
  gagnants: { nom: string; gain: number; main: string }[];
};

export type Action = { type: 'coucher' } | { type: 'suivre' } | { type: 'relancer'; total: number };

const COULEURS: Carte['c'][] = ['♠', '♥', '♦', '♣'];
const NOMS_RANGS: Record<number, string> = { 11: 'V', 12: 'D', 13: 'R', 14: 'A' };
export const nomCarte = (k: Carte) => `${NOMS_RANGS[k.r] ?? k.r}${k.c}`;
export const estRouge = (k: Carte) => k.c === '♥' || k.c === '♦';

const nouveauPaquet = () => melanger(COULEURS.flatMap((c) => Array.from({ length: 13 }, (_, i) => ({ r: i + 2, c }))));

// ---------- Évaluation des mains ----------

const NOMS_MAINS = ['Hauteur', 'Paire', 'Double paire', 'Brelan', 'Quinte', 'Couleur', 'Full', 'Carré', 'Quinte flush'];

function evaluer5(cartes: Carte[]): number[] {
  const rangs = cartes.map((k) => k.r).sort((a, b) => b - a);
  const couleur = cartes.every((k) => k.c === cartes[0].c);
  const uniques = [...new Set(rangs)];
  let hauteurQuinte = 0;
  if (uniques.length === 5) {
    if (rangs[0] - rangs[4] === 4) hauteurQuinte = rangs[0];
    else if (rangs[0] === 14 && rangs[1] === 5) hauteurQuinte = 5; // A-2-3-4-5
  }
  const compte = new Map<number, number>();
  rangs.forEach((r) => compte.set(r, (compte.get(r) ?? 0) + 1));
  const groupes = [...compte.entries()].sort((a, b) => b[1] - a[1] || b[0] - a[0]);
  const ordre = groupes.map((g) => g[0]);
  const formes = groupes.map((g) => g[1]).join('');

  if (hauteurQuinte && couleur) return [8, hauteurQuinte];
  if (formes === '41') return [7, ...ordre];
  if (formes === '32') return [6, ...ordre];
  if (couleur) return [5, ...rangs];
  if (hauteurQuinte) return [4, hauteurQuinte];
  if (formes === '311') return [3, ...ordre];
  if (formes === '221') return [2, ...ordre];
  if (formes === '2111') return [1, ...ordre];
  return [0, ...rangs];
}

export function comparer(a: number[], b: number[]): number {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    const d = (a[i] ?? 0) - (b[i] ?? 0);
    if (d) return d;
  }
  return 0;
}

// Meilleure combinaison de 5 cartes parmi 5 à 7.
export function meilleureMain(cartes: Carte[]): number[] {
  let meilleure: number[] = [-1];
  const n = cartes.length;
  for (let a = 0; a < n; a++)
    for (let b = a + 1; b < n; b++) {
      for (let c = b + 1; c < n; c++)
        for (let d = c + 1; d < n; d++)
          for (let e = d + 1; e < n; e++) {
            const s = evaluer5([cartes[a], cartes[b], cartes[c], cartes[d], cartes[e]]);
            if (comparer(s, meilleure) > 0) meilleure = s;
          }
    }
  return meilleure;
}

export const nomMain = (score: number[]) => NOMS_MAINS[score[0]];

// ---------- Déroulement d'une main ----------

const enJeu = (j: JoueurPoker) => !j.couche && (j.contribution > 0 || j.jetons > 0);
const peutAgir = (j: JoueurPoker) => !j.couche && j.jetons > 0;

function suivantQui(t: Table, depuis: number, condition: (j: JoueurPoker) => boolean): number {
  for (let k = 1; k <= t.joueurs.length; k++) {
    const i = (depuis + k) % t.joueurs.length;
    if (condition(t.joueurs[i])) return i;
  }
  return -1;
}

function miser(t: Table, i: number, montant: number) {
  const j = t.joueurs[i];
  const m = Math.min(montant, j.jetons);
  j.jetons -= m;
  j.mise += m;
  j.contribution += m;
}

export function creerTable(nomHumain: string, cave: number, petiteBlinde = 10): Table {
  const noms = [nomHumain, 'Bot Karim', 'Bot Julie', 'Bot Moussa'];
  return {
    joueurs: noms.map((nom, i) => ({ nom, humain: i === 0, jetons: cave, mise: 0, contribution: 0, cartes: [], couche: false, aParle: false })),
    paquet: [],
    tableau: [],
    phase: 'fin',
    donneur: noms.length - 1,
    actif: -1,
    miseCourante: 0,
    relanceMin: petiteBlinde * 2,
    petiteBlinde,
    journal: [],
    gagnants: [],
  };
}

export function nouvelleMain(ancienne: Table): Table {
  const t: Table = structuredClone(ancienne);
  t.joueurs.forEach((j) => Object.assign(j, { mise: 0, contribution: 0, cartes: [], couche: j.jetons === 0, aParle: false }));
  if (t.joueurs.filter((j) => !j.couche).length < 2) return t;
  t.paquet = nouveauPaquet();
  t.tableau = [];
  t.phase = 'preflop';
  t.journal = [];
  t.gagnants = [];
  t.donneur = suivantQui(t, t.donneur, (j) => !j.couche);
  const actifs = t.joueurs.filter((j) => !j.couche).length;
  // À deux, le donneur poste la petite blinde.
  const pb = actifs === 2 ? t.donneur : suivantQui(t, t.donneur, (j) => !j.couche);
  const gb = suivantQui(t, pb, (j) => !j.couche);
  miser(t, pb, t.petiteBlinde);
  miser(t, gb, t.petiteBlinde * 2);
  t.miseCourante = t.petiteBlinde * 2;
  t.relanceMin = t.petiteBlinde * 2;
  t.joueurs.forEach((j) => !j.couche && (j.cartes = [t.paquet.pop()!, t.paquet.pop()!]));
  t.actif = suivantQui(t, gb, peutAgir);
  return avancerSiNecessaire(t);
}

export const pot = (t: Table) => t.joueurs.reduce((s, j) => s + j.contribution, 0);

export function aSuivre(t: Table, i = t.actif) {
  const j = t.joueurs[i];
  return Math.min(t.miseCourante - j.mise, j.jetons);
}

// Bornes du montant total de mise (sur ce tour) pour une relance.
export function bornesRelance(t: Table, i = t.actif) {
  const j = t.joueurs[i];
  const max = j.mise + j.jetons;
  const min = Math.min(t.miseCourante + t.relanceMin, max);
  return { min, max, possible: max > t.miseCourante };
}

export function agir(ancienne: Table, action: Action): Table {
  const t: Table = structuredClone(ancienne);
  const i = t.actif;
  const j = t.joueurs[i];
  if (action.type === 'coucher') {
    j.couche = true;
    t.journal.push(`${j.nom} se couche`);
  } else if (action.type === 'suivre') {
    const montant = aSuivre(t, i);
    miser(t, i, montant);
    t.journal.push(montant ? `${j.nom} suit ${montant}` : `${j.nom} parole`);
  } else {
    const { min, max } = bornesRelance(t, i);
    const total = Math.max(min, Math.min(action.total, max));
    const relance = total - t.miseCourante;
    miser(t, i, total - j.mise);
    if (relance >= t.relanceMin) {
      t.relanceMin = relance;
      // Une vraie relance rouvre les enchères pour les autres.
      t.joueurs.forEach((x, k) => k !== i && (x.aParle = false));
    }
    t.miseCourante = Math.max(t.miseCourante, j.mise);
    t.journal.push(j.jetons === 0 ? `${j.nom} fait tapis (${j.mise})` : `${j.nom} relance à ${j.mise}`);
  }
  j.aParle = true;
  t.actif = suivantQui(t, i, peutAgir);
  return avancerSiNecessaire(t);
}

function tourTermine(t: Table) {
  return t.joueurs.every((j) => !peutAgir(j) || (j.aParle && j.mise === t.miseCourante));
}

function avancerSiNecessaire(t: Table): Table {
  const restants = t.joueurs.filter((j) => !j.couche);
  if (restants.length === 1) return terminer(t);
  if (!tourTermine(t)) {
    // Si un seul joueur peut encore miser et qu'il a égalisé, inutile de lui demander.
    const actifs = t.joueurs.filter(peutAgir);
    if (!(actifs.length === 1 && actifs[0].mise >= t.miseCourante)) return t;
  }
  t.joueurs.forEach((j) => Object.assign(j, { mise: 0, aParle: false }));
  t.miseCourante = 0;
  t.relanceMin = t.petiteBlinde * 2;
  if (t.phase === 'river') return terminer(t);
  if (t.phase === 'preflop') {
    t.tableau.push(t.paquet.pop()!, t.paquet.pop()!, t.paquet.pop()!);
    t.phase = 'flop';
  } else {
    t.tableau.push(t.paquet.pop()!);
    t.phase = t.phase === 'flop' ? 'turn' : 'river';
  }
  t.actif = suivantQui(t, t.donneur, peutAgir);
  // Plus personne (ou un seul) ne peut miser : on dévoile la suite directement.
  if (t.joueurs.filter(peutAgir).length < 2) return avancerSiNecessaire(t);
  return t;
}

function terminer(t: Table): Table {
  t.phase = 'fin';
  t.actif = -1;
  const restants = t.joueurs.map((j, i) => ({ j, i })).filter(({ j }) => !j.couche);
  const gains = new Map<number, number>();

  if (restants.length === 1) {
    gains.set(restants[0].i, pot(t));
  } else {
    const scores = new Map(restants.map(({ j, i }) => [i, meilleureMain([...j.cartes, ...t.tableau])]));
    // Pots secondaires : on découpe les contributions par paliers.
    const paliers = [...new Set(t.joueurs.map((j) => j.contribution).filter((c) => c > 0))].sort((a, b) => a - b);
    let precedent = 0;
    for (const palier of paliers) {
      const montant = t.joueurs.reduce((s, j) => s + Math.max(0, Math.min(j.contribution, palier) - precedent), 0);
      const eligibles = restants.filter(({ j }) => j.contribution >= palier).map(({ i }) => i);
      precedent = palier;
      if (!eligibles.length) {
        // Personne d'éligible (cas rare) : on rend au plus gros contributeur encore en jeu.
        const repli = restants.reduce((a, b) => (b.j.contribution > a.j.contribution ? b : a)).i;
        gains.set(repli, (gains.get(repli) ?? 0) + montant);
        continue;
      }
      const meilleur = eligibles.reduce((m, i) => (comparer(scores.get(i)!, scores.get(m)!) > 0 ? i : m));
      const gagnants = eligibles.filter((i) => comparer(scores.get(i)!, scores.get(meilleur)!) === 0);
      const part = Math.floor(montant / gagnants.length);
      gagnants.forEach((i, k) => gains.set(i, (gains.get(i) ?? 0) + part + (k === 0 ? montant - part * gagnants.length : 0)));
    }
    t.gagnants = [...gains.entries()].map(([i, gain]) => ({ nom: t.joueurs[i].nom, gain, main: nomMain(scores.get(i)!) }));
  }
  if (restants.length === 1) t.gagnants = [{ nom: restants[0].j.nom, gain: pot(t), main: '' }];
  gains.forEach((g, i) => (t.joueurs[i].jetons += g));
  return t;
}

// ---------- Adversaires gérés par l'ordinateur ----------

function forceAvantFlop(c: Carte[]): number {
  const [a, b] = [Math.max(c[0].r, c[1].r), Math.min(c[0].r, c[1].r)];
  let f = (a + b) / 28; // de 0,15 à 1
  if (a === b) f += 0.35;
  if (c[0].c === c[1].c) f += 0.06;
  if (a - b === 1) f += 0.04;
  return Math.min(1, f);
}

function forceApresFlop(j: JoueurPoker, tableau: Carte[]): number {
  const s = meilleureMain([...j.cartes, ...tableau]);
  const duTableau = tableau.length >= 5 ? meilleureMain(tableau)[0] : -1;
  const base = [0.15, 0.45, 0.65, 0.75, 0.82, 0.86, 0.92, 0.97, 1][s[0]];
  // Une combinaison qui vient entièrement du tableau ne vaut pas grand-chose.
  return s[0] === duTableau ? base * 0.5 : base + (s[0] === 1 && s[1] >= 11 ? 0.1 : 0);
}

export function decisionBot(t: Table): Action {
  const j = t.joueurs[t.actif];
  const force = t.phase === 'preflop' ? forceAvantFlop(j.cartes) : forceApresFlop(j, t.tableau);
  const ala = force + (Math.random() - 0.5) * 0.2;
  const prix = aSuivre(t);
  const cote = prix / (pot(t) + prix || 1);
  const { min, max, possible } = bornesRelance(t);

  if (ala > 0.8 && possible) return { type: 'relancer', total: Math.min(max, Math.max(min, t.miseCourante + Math.round(pot(t) * 0.75))) };
  if (ala > 0.62 && possible && Math.random() < 0.4) return { type: 'relancer', total: min };
  if (prix === 0) return { type: 'suivre' };
  if (ala > cote + 0.25 || (prix <= t.petiteBlinde * 2 && ala > 0.3)) return { type: 'suivre' };
  return { type: 'coucher' };
}
