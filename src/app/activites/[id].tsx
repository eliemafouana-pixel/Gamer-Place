import { Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View, type ScrollViewInstance } from 'react-native';
import { Bouton, Carte, Puce, Texte, styles } from '../../components/ui';
import { sportInfo } from '../../data/catalogue';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';
import type { Presence } from '../../types';

const PRESENCES: { id: Presence; libelle: string; pastille: string }[] = [
  { id: 'oui', libelle: 'Je serai là', pastille: '✅' },
  { id: 'peut-etre', libelle: 'Peut-être', pastille: '🤔' },
  { id: 'non', libelle: 'Je ne viens pas', pastille: '❌' },
];
const pastille = (p?: Presence) => PRESENCES.find((x) => x.id === p)?.pastille ?? '⏳';

const heure = (iso: string) => new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
const dateLongue = (iso: string) =>
  new Date(iso).toLocaleString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });

export default function DiscussionActivite() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { profil, activites, nomDe, indiquerPresence, envoyerMessage, basculerParticipation } = useEtat();
  const [texte, setTexte] = useState('');
  const defilement = useRef<ScrollViewInstance>(null);
  const a = activites.find((x) => x.id === id);
  if (!a || !profil) return <Texte doux>Activité introuvable.</Texte>;

  const moi = profil.id;
  const participe = a.participants.includes(moi);
  const confirmes = a.participants.filter((p) => a.presences[p] === 'oui').length;

  const envoyer = () => {
    if (!texte.trim()) return;
    envoyerMessage(a.id, texte);
    setTexte('');
  };

  return (
    <KeyboardAvoidingView style={styles.ecran} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
      <Stack.Screen options={{ title: `${sportInfo(a.sport).emoji} ${a.titre}` }} />
      <ScrollView ref={defilement} contentContainerStyle={styles.contenu} onContentSizeChange={() => defilement.current?.scrollToEnd({ animated: true })}>
        <Carte>
          <Texte doux>📅 {dateLongue(a.date)}</Texte>
          <Texte doux>📍 {a.lieu}, {a.quartier}</Texte>
          <Texte style={{ marginTop: 6 }}>
            ✅ {confirmes} confirmé{confirmes > 1 ? 's' : ''} sur {a.participants.length} inscrit{a.participants.length > 1 ? 's' : ''} · {a.placesMax} places
          </Texte>
        </Carte>

        <Text style={styles.libelle}>Participants</Text>
        <View style={[styles.rangee, { marginBottom: 12 }]}>
          {a.participants.map((p) => (
            <View key={p} style={[styles.puce, { flexDirection: 'row' }]}>
              <Text style={styles.puceTexte}>
                {pastille(a.presences[p])} {nomDe(p)}
                {p === a.organisateurId ? ' (organise)' : ''}
                {p === moi ? ' (toi)' : ''}
              </Text>
            </View>
          ))}
        </View>

        {participe ? (
          <>
            <Text style={styles.libelle}>Ma présence</Text>
            <View style={styles.rangee}>
              {PRESENCES.map((x) => (
                <Puce key={x.id} texte={`${x.pastille} ${x.libelle}`} actif={a.presences[moi] === x.id} onPress={() => indiquerPresence(a.id, x.id)} />
              ))}
            </View>
          </>
        ) : (
          <Bouton titre="Participer pour rejoindre la discussion" onPress={() => basculerParticipation(a.id)} desactive={a.participants.length >= a.placesMax} />
        )}

        <Text style={[styles.libelle, { marginTop: 16 }]}>Discussion</Text>
        {a.messages.length === 0 && <Texte doux>Aucun message. Lance la discussion !</Texte>}
        {a.messages.map((m) => {
          const deMoi = m.auteurId === moi;
          return (
            <View
              key={m.id}
              style={{
                alignSelf: deMoi ? 'flex-end' : 'flex-start',
                maxWidth: '80%',
                backgroundColor: deMoi ? couleurs.accent : couleurs.carte,
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 8,
                marginBottom: 8,
              }}
            >
              {!deMoi && <Text style={{ color: couleurs.accent, fontWeight: '700', fontSize: 13 }}>{nomDe(m.auteurId)}</Text>}
              <Text style={{ color: deMoi ? couleurs.fond : couleurs.texte, fontSize: 15 }}>{m.texte}</Text>
              <Text style={{ color: deMoi ? '#00000088' : couleurs.texteDoux, fontSize: 11, alignSelf: 'flex-end' }}>{heure(m.date)}</Text>
            </View>
          );
        })}
      </ScrollView>

      {participe && (
        <View style={{ flexDirection: 'row', padding: 10, borderTopWidth: 1, borderTopColor: couleurs.bordure, backgroundColor: couleurs.fond }}>
          <TextInput
            value={texte}
            onChangeText={setTexte}
            onSubmitEditing={envoyer}
            placeholder="Écrire un message…"
            placeholderTextColor={couleurs.texteDoux}
            returnKeyType="send"
            style={[styles.champ, { flex: 1, marginRight: 8 }]}
          />
          <Pressable onPress={envoyer} style={{ backgroundColor: couleurs.accent, borderRadius: 12, paddingHorizontal: 16, justifyContent: 'center' }}>
            <Text style={{ color: couleurs.fond, fontWeight: '800' }}>Envoyer</Text>
          </Pressable>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
