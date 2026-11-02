// Règles des dames françaises (internationales) sur un damier 10×10 :
// - les pions avancent d'une case en diagonale et prennent en avant comme en arrière ;
// - les dames sont « volantes » (déplacement et prise à distance) ;
// - la prise est obligatoire, et il faut choisir la rafle qui prend le plus de pièces ;
// - les pièces prises restent sur le damier jusqu'à la fin de la rafle ;
// - un pion n'est promu que s'il termine son coup sur la dernière rangée.

export const TAILLE = 10;

export type Couleur = 'blanc' | 'noir';
export type Piece = { couleur: Couleur; dame: boolean };
export type Damier = (Piece | null)[];
export type Coup = { chemin: number[]; prises: number[] };

const DIRECTIONS = [
  [-1, -1],
  [-1, 1],
  [1, -1],
  [1, 1],
];

const idx = (l: number, c: number) => l * TAILLE + c;
const dansDamier = (l: number, c: number) => l >= 0 && l < TAILLE && c >= 0 && c < TAILLE;
export const caseJouable = (i: number) => (Math.floor(i / TAILLE) + (i % TAILLE)) % 2 === 1;

export function damierInitial(): Damier {
  return Array.from({ length: TAILLE * TAILLE }, (_, i) => {
    const l = Math.floor(i / TAILLE);
    if (!caseJouable(i)) return null;
    if (l <= 3) return { couleur: 'noir', dame: false };
    if (l >= 6) return { couleur: 'blanc', dame: false };
    return null;
  });
}

// Les blancs jouent vers le haut (ligne 0), les noirs vers le bas.
const sens = (c: Couleur) => (c === 'blanc' ? -1 : 1);

function rafles(d: Damier, depart: number, piece: Piece, pos: number, prises: number[], chemin: number[]): Coup[] {
  const l = Math.floor(pos / TAILLE);
  const c = pos % TAILLE;
  const suites: Coup[] = [];

  for (const [dl, dc] of DIRECTIONS) {
    let ll = l + dl;
    let cc = c + dc;
    if (piece.dame) {
      // Une dame glisse sur les cases vides jusqu'à la pièce à prendre.
      while (dansDamier(ll, cc) && (d[idx(ll, cc)] === null || idx(ll, cc) === depart)) {
        ll += dl;
        cc += dc;
      }
    }
    if (!dansDamier(ll, cc)) continue;
    const cible = idx(ll, cc);
    const p = d[cible];
    if (!p || p.couleur === piece.couleur || prises.includes(cible)) continue;

    let al = ll + dl;
    let ac = cc + dc;
    while (dansDamier(al, ac) && (d[idx(al, ac)] === null || idx(al, ac) === depart)) {
      const arrivee = idx(al, ac);
      const nouvellesPrises = [...prises, cible];
      const nouveauChemin = [...chemin, arrivee];
      const suite = rafles(d, depart, piece, arrivee, nouvellesPrises, nouveauChemin);
      suites.push(...(suite.length ? suite : [{ chemin: nouveauChemin, prises: nouvellesPrises }]));
      if (!piece.dame) break;
      al += dl;
      ac += dc;
    }
  }
  return suites;
}

function deplacementsSimples(d: Damier, pos: number, piece: Piece): Coup[] {
  const l = Math.floor(pos / TAILLE);
  const c = pos % TAILLE;
  const coups: Coup[] = [];
  for (const [dl, dc] of DIRECTIONS) {
    if (!piece.dame && dl !== sens(piece.couleur)) continue;
    let ll = l + dl;
    let cc = c + dc;
    while (dansDamier(ll, cc) && d[idx(ll, cc)] === null) {
      coups.push({ chemin: [pos, idx(ll, cc)], prises: [] });
      if (!piece.dame) break;
      ll += dl;
      cc += dc;
    }
  }
  return coups;
}

export function coupsLegaux(d: Damier, trait: Couleur): Coup[] {
  const prises: Coup[] = [];
  const simples: Coup[] = [];
  d.forEach((p, pos) => {
    if (!p || p.couleur !== trait) return;
    prises.push(...rafles(d, pos, p, pos, [], [pos]));
    simples.push(...deplacementsSimples(d, pos, p));
  });
  if (!prises.length) return simples;
  const max = Math.max(...prises.map((c) => c.prises.length));
  return prises.filter((c) => c.prises.length === max);
}

export function jouer(d: Damier, coup: Coup): Damier {
  const suivant = [...d];
  const depart = coup.chemin[0];
  const arrivee = coup.chemin[coup.chemin.length - 1];
  const piece = suivant[depart]!;
  suivant[depart] = null;
  coup.prises.forEach((i) => (suivant[i] = null));
  const ligne = Math.floor(arrivee / TAILLE);
  const promu = !piece.dame && ligne === (piece.couleur === 'blanc' ? 0 : TAILLE - 1);
  suivant[arrivee] = { ...piece, dame: piece.dame || promu };
  return suivant;
}

export const adversaire = (c: Couleur): Couleur => (c === 'blanc' ? 'noir' : 'blanc');
