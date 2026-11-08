import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { BarreJetons, ChoixMise } from '../../components/jeux';
import { Bouton, Texte, styles } from '../../components/ui';
import {
  CASES_SURES,
  CIRCUIT,
  ORDRE,
  celluleDepart,
  cellulePion,
  cellulesCouloir,
  choixBot,
  deplacer,
  lancerDe,
  nouvellePartie,
  passer,
  pionsJouables,
  type CouleurLudo,
  type PartieLudo,
} from '../../games/ludo';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

const TEINTE: Record<CouleurLudo, string> = { rouge: '#E53935', vert: '#43A047', jaune: '#FDD835', bleu: '#1E88E5' };
const NOMS: Record<CouleurLudo, string> = { rouge: 'Toi', vert: 'Bot Karim', jaune: 'Bot Julie', bleu: 'Bot Moussa' };
const COINS: Record<CouleurLudo, [number, number]> = { rouge: [0, 0], vert: [0, 9], jaune: [9, 9], bleu: [9, 0] };
const FACES = ['', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function Ludo() {
  const { miser, crediter } = useEtat();
  const [mise, setMise] = useState(50);
  const [partie, setPartie] = useState<PartieLudo | null>(null);
  const [erreur, setErreur] = useState('');
  const { width } = useWindowDimensions();
  const c = Math.floor(Math.min(width - 32, 480) / 15);

  const enCours = !!partie && !partie.gagnant;
  const miseEnJeu = useRef(0);
  miseEnJeu.current = enCours ? mise : 0;
  useEffect(() => () => void (miseEnJeu.current && crediter(miseEnJeu.current)), []);

  // Tour des adversaires, et passage automatique quand aucun pion ne peut bouger.
  useEffect(() => {
    if (!partie || partie.gagnant) return;
    const bot = partie.tour !== 'rouge';
    const t = setTimeout(() => {
      if (partie.de === null) {
        if (bot) setPartie({ ...partie, de: lancerDe(), message: '' });
        return;
      }
      if (!pionsJouables(partie, partie.de).length) return setPartie(passer(partie));
      if (bot) setPartie(deplacer(partie, choixBot(partie)));
    }, bot ? 650 : 900);
    return () => clearTimeout(t);
  }, [partie]);

  useEffect(() => {
    if (partie?.gagnant === 'rouge') crediter(mise * 4);
  }, [partie?.gagnant]);

  const commencer = () => {
    if (!miser(mise)) return setErreur('Pas assez de jetons pour cette mise.');
    setErreur('');
    setPartie(nouvellePartie());
  };

  const monTour = enCours && partie!.tour === 'rouge';
  const jouables = monTour && partie!.de !== null ? pionsJouables(partie!, partie!.de) : [];

  const Case = ({ l, col, fond, enfant }: { l: number; col: number; fond: string; enfant?: ReactNode }) => (
    <View style={{ position: 'absolute', top: l * c, left: col * c, width: c, height: c, backgroundColor: fond, borderWidth: 0.5, borderColor: '#00000022', alignItems: 'center', justifyContent: 'center' }}>
      {enfant}
    </View>
  );

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={[styles.contenu, { alignItems: 'center' }]}>
      <BarreJetons />
      {!partie || partie.gagnant ? (
        <View style={{ alignSelf: 'stretch' }}>
          {partie?.gagnant && (
            <Text style={{ color: couleurs.accent, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 12 }}>
              {partie.gagnant === 'rouge' ? `🏆 Tu as gagné ${mise * 4} jetons !` : `${NOMS[partie.gagnant]} a gagné la partie.`}
            </Text>
          )}
          <Texte doux style={{ textAlign: 'center', marginBottom: 8 }}>
            Tu joues les rouges contre 3 adversaires. Mise de chacun : le gagnant remporte 4 fois la mise.
          </Texte>
          <ChoixMise valeurs={[25, 50, 100]} mise={mise} onChange={setMise} />
          {!!erreur && <Texte style={{ color: couleurs.rouge, textAlign: 'center' }}>{erreur}</Texte>}
          <Bouton titre={`${partie ? 'Rejouer' : 'Commencer'} (${mise} jetons)`} onPress={commencer} />
        </View>
      ) : (
        <Text style={{ color: TEINTE[partie.tour], fontSize: 17, fontWeight: '800', marginBottom: 8 }}>
          {partie.tour === 'rouge' ? 'À toi de jouer' : `Au tour de ${NOMS[partie.tour]}`} {partie.message ? `· ${partie.message}` : ''}
        </Text>
      )}

      {partie && (
        <View style={{ width: c * 15, height: c * 15, backgroundColor: '#FAFAFA', borderRadius: 8, overflow: 'hidden', marginTop: 8 }}>
          {ORDRE.map((coul) => {
            const [l, col] = COINS[coul];
            return (
              <View key={coul} style={{ position: 'absolute', top: l * c, left: col * c, width: c * 6, height: c * 6, backgroundColor: TEINTE[coul], padding: c * 0.8 }}>
                <View style={{ flex: 1, backgroundColor: '#FFFFFF', borderRadius: c }} />
              </View>
            );
          })}
          {CIRCUIT.map(([l, col], i) => (
            <Case key={i} l={l} col={col} fond="#FFFFFF" enfant={CASES_SURES.has(i) ? <Text style={{ fontSize: c * 0.5, color: '#9E9E9E' }}>★</Text> : undefined} />
          ))}
          {ORDRE.map((coul) => (
            <View key={coul}>
              <Case l={celluleDepart(coul)[0]} col={celluleDepart(coul)[1]} fond={TEINTE[coul]} />
              {cellulesCouloir(coul).map(([l, col], i) => (
                <Case key={i} l={l} col={col} fond={TEINTE[coul]} />
              ))}
            </View>
          ))}
          <View style={{ position: 'absolute', top: 6 * c, left: 6 * c, width: 3 * c, height: 3 * c, backgroundColor: '#263238', alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ color: '#fff', fontSize: c * 1.2 }}>🏁</Text>
          </View>

          {ORDRE.flatMap((coul) =>
            partie.pions[coul].map((pos, i) => {
              const [l, col] = cellulePion(coul, pos, i);
              // Décale légèrement les pions d'une même case pour qu'ils restent visibles.
              const memeCase = partie.pions[coul].slice(0, i).filter((p) => p === pos && pos >= 0).length;
              const jouable = coul === 'rouge' && jouables.includes(i);
              return (
                <Pressable
                  key={coul + i}
                  disabled={!jouable}
                  onPress={() => setPartie(deplacer(partie, i))}
                  style={{
                    position: 'absolute',
                    top: l * c + c * 0.12 - memeCase * 3,
                    left: col * c + c * 0.12 + memeCase * 3,
                    width: c * 0.76,
                    height: c * 0.76,
                    borderRadius: c,
                    backgroundColor: TEINTE[coul],
                    borderWidth: jouable ? 3 : 2,
                    borderColor: jouable ? '#000' : '#FFFFFF',
                  }}
                />
              );
            }),
          )}
        </View>
      )}

      {enCours && (
        <View style={{ alignItems: 'center', marginTop: 14, alignSelf: 'stretch' }}>
          <Text style={{ fontSize: 56, color: couleurs.texte }}>{partie!.de ? FACES[partie!.de] : '🎲'}</Text>
          {monTour && partie!.de === null && <Bouton titre="Lancer le dé" onPress={() => setPartie({ ...partie!, de: lancerDe(), message: '' })} />}
          {monTour && jouables.length > 0 && <Texte doux>Touche un pion entouré de noir pour le déplacer.</Texte>}
        </View>
      )}
    </ScrollView>
  );
}
