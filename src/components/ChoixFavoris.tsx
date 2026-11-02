import { Text, View } from 'react-native';
import { JEUX, SPORTS } from '../data/catalogue';
import type { Sport } from '../types';
import { Puce, styles } from './ui';

const basculer = <T,>(liste: T[], x: T) => (liste.includes(x) ? liste.filter((y) => y !== x) : [...liste, x]);

export function ChoixFavoris({
  jeux,
  sports,
  onJeux,
  onSports,
}: {
  jeux: string[];
  sports: Sport[];
  onJeux: (j: string[]) => void;
  onSports: (s: Sport[]) => void;
}) {
  return (
    <View>
      <Text style={styles.libelle}>Jeux préférés</Text>
      <View style={styles.rangee}>
        {JEUX.map((j) => (
          <Puce key={j.id} texte={`${j.emoji} ${j.nom}`} actif={jeux.includes(j.id)} onPress={() => onJeux(basculer(jeux, j.id))} />
        ))}
      </View>
      <Text style={[styles.libelle, { marginTop: 8 }]}>Sports préférés</Text>
      <View style={styles.rangee}>
        {SPORTS.map((s) => (
          <Puce key={s.id} texte={`${s.emoji} ${s.nom}`} actif={sports.includes(s.id)} onPress={() => onSports(basculer(sports, s.id))} />
        ))}
      </View>
    </View>
  );
}
