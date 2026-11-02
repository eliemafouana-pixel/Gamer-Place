import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoixFavoris } from '../components/ChoixFavoris';
import { Bouton, Champ, Texte, styles } from '../components/ui';
import { JETONS_DEPART, useEtat } from '../store';
import { couleurs } from '../theme';
import type { Sport } from '../types';

export default function Inscription() {
  const { inscrire } = useEtat();
  const [pseudo, setPseudo] = useState('');
  const [ville, setVille] = useState('');
  const [quartier, setQuartier] = useState('');
  const [jeux, setJeux] = useState<string[]>([]);
  const [sports, setSports] = useState<Sport[]>([]);

  const valide = pseudo.trim() && ville.trim() && quartier.trim();

  const valider = () => {
    if (!valide) return;
    inscrire({ pseudo: pseudo.trim(), ville: ville.trim(), quartier: quartier.trim(), jeuxFavoris: jeux, sportsFavoris: sports });
    router.replace('/');
  };

  return (
    <SafeAreaView style={styles.ecran}>
      <ScrollView contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
        <Text style={{ color: couleurs.accent, fontSize: 32, fontWeight: '900', marginTop: 16 }}>Gamer Place</Text>
        <Texte doux style={{ marginBottom: 24 }}>
          Joue en ligne et fais du sport avec les gens de ton quartier.
        </Texte>
        <Champ libelle="Pseudo" value={pseudo} onChangeText={setPseudo} placeholder="Ex. Elie_75" autoCapitalize="none" />
        <Champ libelle="Ville" value={ville} onChangeText={setVille} placeholder="Ex. Paris" />
        <Champ libelle="Quartier" value={quartier} onChangeText={setQuartier} placeholder="Ex. Belleville" />
        <ChoixFavoris jeux={jeux} sports={sports} onJeux={setJeux} onSports={setSports} />
        <Texte doux style={{ marginTop: 16, fontSize: 13 }}>
          Tu reçois {JETONS_DEPART} jetons virtuels pour commencer. Les jetons n'ont aucune valeur en argent réel.
        </Texte>
        <Bouton titre="Créer mon compte" onPress={valider} desactive={!valide} />
      </ScrollView>
    </SafeAreaView>
  );
}
