import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text } from 'react-native';
import { ChoixFavoris } from '../../components/ChoixFavoris';
import { Bouton, Carte, Champ, Texte, styles } from '../../components/ui';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

export default function Profil() {
  const { profil, jetons, modifierProfil, deconnecter } = useEtat();
  const [ville, setVille] = useState(profil?.ville ?? '');
  const [quartier, setQuartier] = useState(profil?.quartier ?? '');
  if (!profil) return null;

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
      <Carte>
        <Text style={{ color: couleurs.texte, fontSize: 22, fontWeight: '800' }}>{profil.pseudo}</Text>
        <Texte doux>
          {profil.quartier}, {profil.ville} · 🪙 {jetons} jetons
        </Texte>
      </Carte>
      <Champ libelle="Ville" value={ville} onChangeText={setVille} onEndEditing={() => ville.trim() && modifierProfil({ ville: ville.trim() })} />
      <Champ
        libelle="Quartier"
        value={quartier}
        onChangeText={setQuartier}
        onEndEditing={() => quartier.trim() && modifierProfil({ quartier: quartier.trim() })}
      />
      <ChoixFavoris
        jeux={profil.jeuxFavoris}
        sports={profil.sportsFavoris}
        onJeux={(jeuxFavoris) => modifierProfil({ jeuxFavoris })}
        onSports={(sportsFavoris) => modifierProfil({ sportsFavoris })}
      />
      <Bouton
        titre="Se déconnecter"
        secondaire
        onPress={() => {
          deconnecter();
          router.replace('/inscription');
        }}
      />
    </ScrollView>
  );
}
