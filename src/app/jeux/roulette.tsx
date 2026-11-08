import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BarreJetons, ChoixMise } from '../../components/jeux';
import { Bouton, Texte, styles } from '../../components/ui';
import { cleDuPari, couleurNumero, gainDuPari, libelleDuPari, tirer, type Pari } from '../../games/roulette';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

const FOND = { rouge: '#C62828', noir: '#1E1E1E', vert: '#1B7F3B' };
const PARIS_SIMPLES: Pari[] = [{ type: 'rouge' }, { type: 'noir' }, { type: 'pair' }, { type: 'impair' }, { type: 'manque' }, { type: 'passe' }];
const DOUZAINES: Pari[] = [1, 2, 3].map((d) => ({ type: 'douzaine', douzaine: d as 1 | 2 | 3 }));

type Mise = { pari: Pari; montant: number };

export default function Roulette() {
  const { miser, crediter } = useEtat();
  const [jeton, setJeton] = useState(10);
  const [mises, setMises] = useState<Mise[]>([]);
  const [affiche, setAffiche] = useState<number | null>(null);
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState('Place tes jetons puis lance la bille.');
  const historique = useRef<number[]>([]);
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);

  const total = mises.reduce((s, m) => s + m.montant, 0);
  // Si on quitte l'écran avant la fin du tirage, les jetons misés sont rendus.
  const enAttente = useRef(0);
  enAttente.current = total;
  useEffect(
    () => () => {
      if (minuteur.current) clearInterval(minuteur.current);
      if (enAttente.current) crediter(enAttente.current);
    },
    [],
  );

  const miseSur = (p: Pari) => mises.find((m) => cleDuPari(m.pari) === cleDuPari(p))?.montant ?? 0;

  const placer = (pari: Pari) => {
    if (enCours) return;
    if (!miser(jeton)) return setResultat('Pas assez de jetons.');
    setMises((ms) => {
      const k = cleDuPari(pari);
      const existe = ms.find((m) => cleDuPari(m.pari) === k);
      return existe ? ms.map((m) => (m === existe ? { ...m, montant: m.montant + jeton } : m)) : [...ms, { pari, montant: jeton }];
    });
  };

  const annuler = () => {
    if (enCours || !total) return;
    crediter(total);
    setMises([]);
  };

  const lancer = () => {
    if (enCours || !mises.length) return;
    setEnCours(true);
    setResultat('La bille tourne…');
    const n = tirer();
    let tours = 0;
    minuteur.current = setInterval(() => {
      setAffiche(tirer());
      if (++tours > 22) {
        clearInterval(minuteur.current!);
        setAffiche(n);
        const gain = mises.reduce((s, m) => s + gainDuPari(m.pari, m.montant, n), 0);
        if (gain) crediter(gain);
        enAttente.current = 0;
        historique.current = [n, ...historique.current].slice(0, 10);
        setResultat(gain ? `🎉 ${n} ! Tu récupères ${gain} jetons.` : `${n}. Perdu cette fois.`);
        setMises([]);
        setEnCours(false);
      }
    }, 80);
  };

  const Case = ({ pari, texte, fond, largeur }: { pari: Pari; texte: string; fond: string; largeur: `${number}%` }) => {
    const m = miseSur(pari);
    return (
      <Pressable onPress={() => placer(pari)} style={{ width: largeur, padding: 2 }}>
        <View style={{ backgroundColor: fond, borderRadius: 6, paddingVertical: 10, alignItems: 'center', borderWidth: m ? 2 : 0, borderColor: couleurs.accent }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>{texte}</Text>
          {m > 0 && <Text style={{ color: couleurs.accent, fontSize: 11, fontWeight: '800' }}>🪙{m}</Text>}
        </View>
      </Pressable>
    );
  };

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <BarreJetons />
      <View style={{ alignItems: 'center', marginBottom: 12 }}>
        <View
          style={{
            width: 110,
            height: 110,
            borderRadius: 55,
            backgroundColor: affiche === null ? couleurs.carte : FOND[couleurNumero(affiche)],
            borderWidth: 6,
            borderColor: '#B8860B',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 40, fontWeight: '900' }}>{affiche ?? '?'}</Text>
        </View>
        <Text style={{ color: couleurs.texte, fontSize: 16, fontWeight: '700', marginTop: 10, textAlign: 'center' }}>{resultat}</Text>
        {historique.current.length > 0 && <Texte doux style={{ marginTop: 4 }}>Derniers : {historique.current.join(' · ')}</Texte>}
      </View>

      <Texte doux style={{ marginBottom: 6 }}>Valeur du jeton</Texte>
      <ChoixMise valeurs={[5, 10, 25, 100]} mise={jeton} onChange={setJeton} />

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        <Case pari={{ type: 'plein', numero: 0 }} texte="0" fond={FOND.vert} largeur="100%" />
        {Array.from({ length: 36 }, (_, i) => i + 1).map((n) => (
          <Case key={n} pari={{ type: 'plein', numero: n }} texte={String(n)} fond={FOND[couleurNumero(n) as 'rouge' | 'noir']} largeur="16.66%" />
        ))}
        {DOUZAINES.map((p) => (
          <Case key={cleDuPari(p)} pari={p} texte={libelleDuPari(p)} fond={couleurs.carte} largeur="33.33%" />
        ))}
        {PARIS_SIMPLES.map((p) => (
          <Case key={cleDuPari(p)} pari={p} texte={libelleDuPari(p)} fond={p.type === 'rouge' ? FOND.rouge : p.type === 'noir' ? FOND.noir : couleurs.carte} largeur="33.33%" />
        ))}
      </View>

      <Bouton titre={enCours ? '…' : total ? `Lancer la bille (${total} jetons misés)` : 'Place une mise'} onPress={lancer} desactive={enCours || !total} />
      <Bouton titre="Reprendre mes jetons" secondaire onPress={annuler} desactive={enCours || !total} />
      <Texte doux style={{ fontSize: 12, marginTop: 12 }}>
        Plein ×36 · Douzaine ×3 · Rouge, noir, pair, impair, 1-18, 19-36 ×2 (gain total, mise comprise).
      </Texte>
    </ScrollView>
  );
}
