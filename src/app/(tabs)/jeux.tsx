import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { BarreJetons } from '../../components/jeux';
import { Carte, Texte, styles } from '../../components/ui';
import { JEUX } from '../../data/catalogue';
import { couleurs } from '../../theme';

export default function Jeux() {
  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      <Texte doux style={{ marginBottom: 4 }}>Mes jetons virtuels</Texte>
      <BarreJetons />
      {JEUX.map((j) => (
        <Pressable key={j.id} disabled={!j.disponible} onPress={() => router.push(`/jeux/${j.id}` as never)}>
          <Carte style={{ flexDirection: 'row', alignItems: 'center', opacity: j.disponible ? 1 : 0.55 }}>
            <Text style={{ fontSize: 34, marginRight: 14 }}>{j.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={{ color: couleurs.texte, fontSize: 17, fontWeight: '700' }}>{j.nom}</Text>
              <Texte doux>{j.description}</Texte>
            </View>
            <Text style={{ color: j.disponible ? couleurs.vert : couleurs.texteDoux, fontSize: 13 }}>
              {j.disponible ? 'Jouer ›' : 'Bientôt'}
            </Text>
          </Carte>
        </Pressable>
      ))}
      <Texte doux style={{ fontSize: 12, marginTop: 8 }}>
        Les jeux se jouent en jetons virtuels, sans valeur en argent réel.
      </Texte>
    </ScrollView>
  );
}
