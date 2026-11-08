import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChoixFavoris } from '../components/ChoixFavoris';
import { FondAccueil } from '../components/FondAccueil';
import { Bouton, Champ, Texte } from '../components/ui';
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
    <View style={{ flex: 1, backgroundColor: couleurs.fond }}>
      <FondAccueil />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }} keyboardShouldPersistTaps="handled">
          <View style={{ alignItems: 'center', marginTop: 28, marginBottom: 28 }}>
            <LinearGradient
              colors={['#FFB020', '#FF3CAC']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ width: 96, height: 96, borderRadius: 28, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-6deg' }] }}
            >
              <Text style={{ fontSize: 46 }}>🎮</Text>
            </LinearGradient>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 44,
                fontWeight: '900',
                letterSpacing: 1,
                textAlign: 'center',
                marginTop: 18,
                textShadowColor: '#FF3CAC88',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 18,
              }}
            >
              Gamer <Text style={{ color: couleurs.accent }}>Place</Text>
            </Text>
            <Text style={{ color: '#D7D9F5', fontSize: 16, textAlign: 'center', marginTop: 8, lineHeight: 22 }}>
              Joue en ligne et fais du sport{'\n'}avec les gens de ton quartier
            </Text>
            <View style={{ flexDirection: 'row', marginTop: 14, gap: 8 }}>
              {['🎲 Jeux', '⚽ Sport', '💬 Rencontres'].map((t) => (
                <View key={t} style={{ backgroundColor: '#FFFFFF1A', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: '#FFFFFF26' }}>
                  <Text style={{ color: '#FFFFFF', fontSize: 13 }}>{t}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: '#0F1226CC', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#FFFFFF1F' }}>
            <Text style={{ color: couleurs.texte, fontSize: 20, fontWeight: '800', textAlign: 'center', marginBottom: 16 }}>Crée ton compte</Text>
            <Champ libelle="Pseudo" value={pseudo} onChangeText={setPseudo} placeholder="Ex. Elie_75" autoCapitalize="none" />
            <Champ libelle="Ville" value={ville} onChangeText={setVille} placeholder="Ex. Paris" />
            <Champ libelle="Quartier" value={quartier} onChangeText={setQuartier} placeholder="Ex. Belleville" />
            <ChoixFavoris jeux={jeux} sports={sports} onJeux={setJeux} onSports={setSports} />
            <Texte doux style={{ marginTop: 12, fontSize: 13, textAlign: 'center' }}>
              🪙 {JETONS_DEPART} jetons virtuels offerts. Les jetons n'ont aucune valeur en argent réel.
            </Texte>
            <Bouton titre="C'est parti !" onPress={valider} desactive={!valide} />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
