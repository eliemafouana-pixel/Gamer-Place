import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BarreJetons, ChoixMise } from '../../components/jeux';
import { Bouton, Carte, Texte, styles } from '../../components/ui';
import { LETTRES, ligneGagnante, lettreDe, nouveauCarton, nouvelleUrne, type Carton } from '../../games/bingo';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

const ADVERSAIRES = ['Bot Karim', 'Bot Julie', 'Bot Moussa'];
const DELAI_MS = 1100;

type Partie = {
  mise: number;
  urne: number[];
  sortis: number[];
  cartons: Carton[]; // 0 = le mien, puis les adversaires
  gagnants: number[];
};

export default function Bingo() {
  const { profil, miser, crediter } = useEtat();
  const [mise, setMise] = useState(25);
  const [partie, setPartie] = useState<Partie | null>(null);
  const [message, setMessage] = useState('');
  const enCours = !!partie && !partie.gagnants.length;

  // Si on quitte en pleine partie, la mise est rendue.
  const miseEnJeu = useRef(0);
  miseEnJeu.current = enCours ? partie!.mise : 0;
  useEffect(() => () => void (miseEnJeu.current && crediter(miseEnJeu.current)), []);

  // Tire une boule à intervalle régulier jusqu'au premier bingo.
  useEffect(() => {
    if (!partie || partie.gagnants.length) return;
    const t = setTimeout(() => {
      const sortis = [...partie.sortis, partie.urne[partie.sortis.length]];
      const set = new Set(sortis);
      const gagnants = partie.cartons.map((c, i) => (ligneGagnante(c, set) ? i : -1)).filter((i) => i >= 0);
      if (gagnants.length) {
        const cagnotte = partie.mise * partie.cartons.length;
        if (gagnants.includes(0)) {
          const part = Math.floor(cagnotte / gagnants.length);
          crediter(part);
          setMessage(gagnants.length > 1 ? `🎉 Bingo partagé ! Tu gagnes ${part} jetons.` : `🎉 BINGO ! Tu gagnes ${part} jetons.`);
        } else {
          setMessage(`${gagnants.map((i) => ADVERSAIRES[i - 1]).join(' et ')} ${gagnants.length > 1 ? 'ont' : 'a'} fait bingo.`);
        }
      }
      setPartie({ ...partie, sortis, gagnants });
    }, DELAI_MS);
    return () => clearTimeout(t);
  }, [partie]);

  const commencer = () => {
    if (!miser(mise)) return setMessage('Pas assez de jetons pour cette mise.');
    setMessage('');
    setPartie({ mise, urne: nouvelleUrne(), sortis: [], cartons: [nouveauCarton(), ...ADVERSAIRES.map(nouveauCarton)], gagnants: [] });
  };

  const sortis = new Set(partie?.sortis ?? []);
  const derniere = partie?.sortis.at(-1);
  const ligneGagnee = partie && partie.gagnants.includes(0) ? new Set(ligneGagnante(partie.cartons[0], sortis)) : new Set<number>();

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={[styles.contenu, { alignItems: 'center' }]}>
      <BarreJetons />
      {partie && (
        <>
          <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: couleurs.accent, alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
            <Text style={{ color: couleurs.fond, fontSize: 16, fontWeight: '800' }}>{derniere ? lettreDe(derniere) : ''}</Text>
            <Text style={{ color: couleurs.fond, fontSize: 36, fontWeight: '900' }}>{derniere ?? '…'}</Text>
          </View>
          <Texte doux style={{ marginBottom: 12 }}>
            {partie.sortis.length} boules tirées · Cagnotte 🪙 {partie.mise * partie.cartons.length}
          </Texte>
          <View style={{ width: 320 }}>
            <View style={{ flexDirection: 'row' }}>
              {LETTRES.map((l) => (
                <Text key={l} style={{ width: 64, textAlign: 'center', color: couleurs.accent, fontSize: 22, fontWeight: '900' }}>{l}</Text>
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {partie.cartons[0].map((n, i) => {
                const coche = n === 0 || sortis.has(n);
                return (
                  <View key={i} style={{ width: 64, height: 56, padding: 3 }}>
                    <View
                      style={{
                        flex: 1,
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: ligneGagnee.has(i) ? couleurs.vert : coche ? couleurs.accent : couleurs.carte,
                        borderWidth: 1,
                        borderColor: couleurs.bordure,
                      }}
                    >
                      <Text style={{ color: coche ? couleurs.fond : couleurs.texte, fontSize: 18, fontWeight: '800' }}>{n === 0 ? '★' : n}</Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        </>
      )}
      {!!message && <Text style={{ color: couleurs.texte, fontSize: 17, fontWeight: '700', marginVertical: 12, textAlign: 'center' }}>{message}</Text>}
      {!enCours && (
        <View style={{ alignSelf: 'stretch', marginTop: 8 }}>
          <Texte doux style={{ textAlign: 'center', marginBottom: 8 }}>Prix du carton</Texte>
          <ChoixMise valeurs={[10, 25, 50, 100]} mise={mise} onChange={setMise} />
          <Bouton titre={partie ? 'Rejouer' : `Acheter un carton (${mise} jetons)`} onPress={commencer} />
          <Carte style={{ marginTop: 16 }}>
            <Texte doux>
              Tu joues contre 3 adversaires, {profil?.pseudo}. Les numéros sont cochés automatiquement. Le premier à compléter une ligne, une colonne ou une
              diagonale remporte la cagnotte.
            </Texte>
          </Carte>
        </View>
      )}
    </ScrollView>
  );
}
