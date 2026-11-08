import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BarreJetons, ChoixMise } from '../../components/jeux';
import { Bouton, Carte, Texte, styles } from '../../components/ui';
import { SYMBOLES, lancer, multiplicateur, symboleAleatoire } from '../../games/machine';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

export default function Machine() {
  const { miser, crediter } = useEtat();
  const [mise, setMise] = useState(10);
  const [rouleaux, setRouleaux] = useState(['7️⃣', '7️⃣', '7️⃣']);
  const [enCours, setEnCours] = useState(false);
  const [resultat, setResultat] = useState('Choisis ta mise et lance !');
  const minuteur = useRef<ReturnType<typeof setInterval> | null>(null);

  // Gain du lancer en cours, versé même si on quitte l'écran avant l'arrêt des rouleaux.
  const gainEnAttente = useRef(0);
  useEffect(
    () => () => {
      if (minuteur.current) clearInterval(minuteur.current);
      if (gainEnAttente.current) crediter(gainEnAttente.current);
    },
    [],
  );

  const jouer = () => {
    if (enCours) return;
    if (!miser(mise)) return setResultat("Pas assez de jetons pour cette mise.");
    setEnCours(true);
    setResultat('…');
    const final = lancer();
    const gain = mise * multiplicateur(final);
    gainEnAttente.current = gain;
    let tours = 0;
    minuteur.current = setInterval(() => {
      tours++;
      // Les rouleaux s'arrêtent l'un après l'autre.
      setRouleaux((r) => r.map((s, i) => (tours > 8 + i * 4 ? final[i] : symboleAleatoire())));
      if (tours > 16) {
        clearInterval(minuteur.current!);
        if (gain) crediter(gain);
        gainEnAttente.current = 0;
        setResultat(gain > mise ? `🎉 Gagné : ${gain} jetons !` : gain === mise ? 'Mise remboursée' : 'Perdu, retente ta chance');
        setEnCours(false);
      }
    }, 70);
  };

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={[styles.contenu, { alignItems: 'center' }]}>
      <BarreJetons />
      <View style={{ flexDirection: 'row', backgroundColor: '#2A0F3D', padding: 14, borderRadius: 20, borderWidth: 3, borderColor: couleurs.accent }}>
        {rouleaux.map((s, i) => (
          <View key={i} style={{ width: 84, height: 100, marginHorizontal: 5, backgroundColor: '#FFF8E7', borderRadius: 12, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontSize: 52 }}>{s}</Text>
          </View>
        ))}
      </View>
      <Text style={{ color: couleurs.texte, fontSize: 18, fontWeight: '700', marginVertical: 16 }}>{resultat}</Text>
      <ChoixMise valeurs={[10, 25, 50, 100]} mise={mise} onChange={setMise} />
      <View style={{ alignSelf: 'stretch' }}>
        <Bouton titre={enCours ? '…' : `Lancer (${mise} jetons)`} onPress={jouer} desactive={enCours} />
      </View>
      <Carte style={{ alignSelf: 'stretch', marginTop: 20 }}>
        <Texte style={{ fontWeight: '700', marginBottom: 6 }}>Gains</Texte>
        {SYMBOLES.map((x) => (
          <Texte key={x.s} doux>
            {x.s}
            {x.s}
            {x.s}  ×{x.triple}
          </Texte>
        ))}
        <Texte doux>Deux symboles identiques : mise remboursée</Texte>
      </Carte>
    </ScrollView>
  );
}
