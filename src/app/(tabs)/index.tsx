import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Carte, Puce, Texte, styles } from '../../components/ui';
import { JEUX, sportInfo } from '../../data/catalogue';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

type Portee = 'quartier' | 'ville';

export default function PresDeMoi() {
  const { profil, joueurs } = useEtat();
  const [portee, setPortee] = useState<Portee>('quartier');
  if (!profil) return null;

  const proches = joueurs
    .filter((j) => j.ville === profil.ville && (portee === 'ville' || j.quartier === profil.quartier))
    .sort((a, b) => Number(b.enLigne) - Number(a.enLigne));

  return (
    <FlatList
      style={styles.ecran}
      contentContainerStyle={styles.contenu}
      data={proches}
      keyExtractor={(j) => j.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 8 }}>
          <Texte doux style={{ marginBottom: 12 }}>
            {portee === 'quartier' ? `Joueurs à ${profil.quartier}, ${profil.ville}` : `Joueurs à ${profil.ville}`}
          </Texte>
          <View style={styles.rangee}>
            <Puce texte="Mon quartier" actif={portee === 'quartier'} onPress={() => setPortee('quartier')} />
            <Puce texte="Toute la ville" actif={portee === 'ville'} onPress={() => setPortee('ville')} />
          </View>
        </View>
      }
      ListEmptyComponent={<Texte doux>Personne pour l'instant. Invite tes voisins !</Texte>}
      renderItem={({ item: j }) => (
        <Carte>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={{ color: couleurs.texte, fontSize: 17, fontWeight: '700' }}>{j.pseudo}</Text>
            <Text style={{ color: j.enLigne ? couleurs.vert : couleurs.texteDoux, fontSize: 13 }}>
              {j.enLigne ? '● en ligne' : '○ hors ligne'}
            </Text>
          </View>
          <Texte doux style={{ marginTop: 2, marginBottom: 8 }}>{j.quartier}</Texte>
          <Texte>
            {j.jeuxFavoris.map((id) => JEUX.find((x) => x.id === id)?.emoji).join(' ')}
            {'  '}
            {j.sportsFavoris.map((s) => sportInfo(s).emoji).join(' ')}
          </Texte>
        </Carte>
      )}
    />
  );
}
