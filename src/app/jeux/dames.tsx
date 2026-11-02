import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { Bouton, Texte, styles } from '../../components/ui';
import { TAILLE, adversaire, caseJouable, coupsLegaux, damierInitial, jouer, type Couleur } from '../../games/dames';
import { couleurs } from '../../theme';

const nom = (c: Couleur) => (c === 'blanc' ? 'Blancs' : 'Noirs');

export default function Dames() {
  const [damier, setDamier] = useState(damierInitial);
  const [trait, setTrait] = useState<Couleur>('blanc');
  const [selection, setSelection] = useState<number | null>(null);
  const { width } = useWindowDimensions();
  const caseTaille = Math.floor(Math.min(width - 36, 520) / TAILLE);
  const cote = caseTaille * TAILLE;

  const coups = useMemo(() => coupsLegaux(damier, trait), [damier, trait]);
  const gagnant = coups.length === 0 ? adversaire(trait) : null;
  const departsPossibles = new Set(coups.map((c) => c.chemin[0]));
  const coupsSelection = selection === null ? [] : coups.filter((c) => c.chemin[0] === selection);
  const arrivees = new Map(coupsSelection.map((c) => [c.chemin[c.chemin.length - 1], c]));
  const prisesObligatoires = coups.length > 0 && coups[0].prises.length > 0;

  const toucher = (i: number) => {
    if (gagnant) return;
    const coup = arrivees.get(i);
    if (coup) {
      setDamier(jouer(damier, coup));
      setTrait(adversaire(trait));
      setSelection(null);
    } else {
      setSelection(departsPossibles.has(i) ? i : null);
    }
  };

  const recommencer = () => {
    setDamier(damierInitial());
    setTrait('blanc');
    setSelection(null);
  };

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={[styles.contenu, { alignItems: 'center' }]}>
      <Text style={{ color: couleurs.texte, fontSize: 18, fontWeight: '700', marginBottom: 4 }}>
        {gagnant ? `🏆 Les ${nom(gagnant)} ont gagné !` : `Au tour des ${nom(trait)}`}
      </Text>
      <Texte doux style={{ marginBottom: 12, minHeight: 20 }}>
        {!gagnant && prisesObligatoires ? 'Prise obligatoire : il faut prendre le plus de pièces possible.' : ' '}
      </Texte>
      <View style={{ borderWidth: 2, borderColor: couleurs.bordure }}>
      <View style={{ width: cote, height: cote, flexDirection: 'row', flexWrap: 'wrap' }}>
        {damier.map((p, i) => {
          const jouable = caseJouable(i);
          const estSelection = selection === i;
          const estArrivee = arrivees.has(i);
          const estDepart = !gagnant && selection === null && departsPossibles.has(i);
          return (
            <Pressable
              key={i}
              onPress={() => jouable && toucher(i)}
              style={{
                width: caseTaille,
                height: caseTaille,
                backgroundColor: jouable ? (estSelection ? '#7A5C2E' : '#8B5A2B') : '#F0D9B5',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {p && (
                <View
                  style={{
                    width: caseTaille * 0.78,
                    height: caseTaille * 0.78,
                    borderRadius: caseTaille,
                    backgroundColor: p.couleur === 'blanc' ? '#F7F3EA' : '#1C1C1C',
                    borderWidth: estDepart || estSelection ? 3 : 1,
                    borderColor: estSelection ? couleurs.accent : estDepart ? couleurs.vert : '#00000055',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {p.dame && <Text style={{ fontSize: caseTaille * 0.4, color: couleurs.accent }}>♛</Text>}
                </View>
              )}
              {estArrivee && (
                <View style={{ width: caseTaille * 0.3, height: caseTaille * 0.3, borderRadius: caseTaille, backgroundColor: couleurs.accent }} />
              )}
            </Pressable>
          );
        })}
      </View>
      </View>
      <Texte doux style={{ marginTop: 12, textAlign: 'center' }}>
        Touche un pion entouré de vert, puis une case jaune. Partie à deux sur le même téléphone.
      </Texte>
      <View style={{ width: cote }}>
        <Bouton titre="Nouvelle partie" secondaire onPress={recommencer} />
      </View>
    </ScrollView>
  );
}
