import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { Bouton, Champ, Puce, Texte, styles } from '../../components/ui';
import { SPORTS } from '../../data/catalogue';
import { useEtat } from '../../store';
import type { Sport } from '../../types';

const JOURS = [
  { libelle: "Aujourd'hui", decalage: 0 },
  { libelle: 'Demain', decalage: 1 },
  { libelle: 'Dans 2 jours', decalage: 2 },
  { libelle: 'Dans 3 jours', decalage: 3 },
  { libelle: 'Dans une semaine', decalage: 7 },
];
const HEURES = [9, 10, 12, 14, 16, 18, 19, 20];

export default function NouvelleActivite() {
  const { profil, creerActivite } = useEtat();
  const [sport, setSport] = useState<Sport>('football');
  const [titre, setTitre] = useState('');
  const [lieu, setLieu] = useState('');
  const [jour, setJour] = useState(1);
  const [heure, setHeure] = useState(18);
  const [places, setPlaces] = useState('10');
  if (!profil) return null;

  const date = new Date();
  date.setDate(date.getDate() + jour);
  date.setHours(heure, 0, 0, 0);
  const placesMax = parseInt(places, 10);
  const valide = titre.trim() && lieu.trim() && placesMax >= 2 && date > new Date();

  const valider = () => {
    if (!valide) return;
    creerActivite({ sport, titre: titre.trim(), lieu: lieu.trim(), ville: profil.ville, quartier: profil.quartier, date: date.toISOString(), placesMax });
    router.back();
  };

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu} keyboardShouldPersistTaps="handled">
      <Text style={styles.libelle}>Sport</Text>
      <View style={styles.rangee}>
        {SPORTS.map((s) => (
          <Puce key={s.id} texte={s.emoji + ' ' + s.nom} actif={sport === s.id} onPress={() => setSport(s.id)} />
        ))}
      </View>
      <View style={{ height: 12 }} />
      <Champ libelle="Titre" value={titre} onChangeText={setTitre} placeholder="Ex. Foot à 5 entre voisins" />
      <Champ libelle="Lieu" value={lieu} onChangeText={setLieu} placeholder="Ex. City stade de la mairie" />
      <Text style={styles.libelle}>Jour</Text>
      <View style={styles.rangee}>
        {JOURS.map((j) => (
          <Puce key={j.decalage} texte={j.libelle} actif={jour === j.decalage} onPress={() => setJour(j.decalage)} />
        ))}
      </View>
      <Text style={[styles.libelle, { marginTop: 8 }]}>Heure</Text>
      <View style={styles.rangee}>
        {HEURES.map((h) => (
          <Puce key={h} texte={`${h}h`} actif={heure === h} onPress={() => setHeure(h)} />
        ))}
      </View>
      <View style={{ height: 12 }} />
      <Champ libelle="Nombre de places (toi compris)" value={places} onChangeText={setPlaces} keyboardType="number-pad" />
      {date <= new Date() && <Texte doux>Cette heure est déjà passée, choisis-en une autre.</Texte>}
      <Bouton titre="Publier l'activité" onPress={valider} desactive={!valide} />
    </ScrollView>
  );
}
