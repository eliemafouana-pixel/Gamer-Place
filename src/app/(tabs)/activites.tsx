import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import { Bouton, Carte, Puce, Texte, styles } from '../../components/ui';
import { SPORTS, sportInfo } from '../../data/catalogue';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';
import type { Sport } from '../../types';

const formatDate = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export default function Activites() {
  const { profil, activites, basculerParticipation } = useEtat();
  const [filtre, setFiltre] = useState<Sport | null>(null);
  if (!profil) return null;

  const liste = activites
    .filter((a) => a.ville === profil.ville && new Date(a.date) > new Date() && (!filtre || a.sport === filtre))
    .sort((a, b) => a.date.localeCompare(b.date));

  return (
    <FlatList
      style={styles.ecran}
      contentContainerStyle={styles.contenu}
      data={liste}
      keyExtractor={(a) => a.id}
      ListHeaderComponent={
        <View style={{ marginBottom: 8 }}>
          <Bouton titre="+ Proposer une activité" onPress={() => router.push('/activites/nouvelle')} />
          <View style={[styles.rangee, { marginTop: 16 }]}>
            <Puce texte="Tout" actif={!filtre} onPress={() => setFiltre(null)} />
            {SPORTS.map((s) => (
              <Puce key={s.id} texte={s.emoji + ' ' + s.nom} actif={filtre === s.id} onPress={() => setFiltre(s.id)} />
            ))}
          </View>
        </View>
      }
      ListEmptyComponent={<Texte doux>Aucune activité prévue. Lance la première !</Texte>}
      renderItem={({ item: a }) => {
        const inscrit = a.participants.includes(profil.id);
        const organisateur = a.organisateurId === profil.id;
        const complet = a.participants.length >= a.placesMax;
        return (
          <Carte>
            <Text style={{ color: couleurs.texte, fontSize: 17, fontWeight: '700' }}>
              {sportInfo(a.sport).emoji} {a.titre}
            </Text>
            <Texte doux style={{ marginTop: 4 }}>📅 {formatDate(a.date)}</Texte>
            <Texte doux>📍 {a.lieu}, {a.quartier}</Texte>
            <Texte style={{ marginTop: 6 }}>
              👥 {a.participants.length} / {a.placesMax} participants · ✅ {a.participants.filter((p) => a.presences[p] === 'oui').length} confirmés
            </Texte>
            <Bouton titre={`💬 Discussion et présences (${a.messages.length})`} secondaire onPress={() => router.push(`/activites/${a.id}`)} />
            {organisateur ? (
              <Texte doux style={{ marginTop: 8 }}>Tu organises cette activité.</Texte>
            ) : (
              <Bouton
                titre={inscrit ? 'Me désinscrire' : complet ? 'Complet' : 'Participer'}
                secondaire={inscrit}
                desactive={!inscrit && complet}
                onPress={() => basculerParticipation(a.id)}
              />
            )}
          </Carte>
        );
      }}
    />
  );
}
