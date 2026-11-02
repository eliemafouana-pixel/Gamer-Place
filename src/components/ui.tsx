import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps, type ViewStyle } from 'react-native';
import { couleurs, espace } from '../theme';

export function Bouton({ titre, onPress, secondaire, desactive }: { titre: string; onPress: () => void; secondaire?: boolean; desactive?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={desactive}
      onPress={onPress}
      style={({ pressed }) => [styles.bouton, secondaire && styles.boutonSecondaire, (pressed || desactive) && { opacity: 0.6 }]}
    >
      <Text style={[styles.boutonTexte, secondaire && { color: couleurs.texte }]}>{titre}</Text>
    </Pressable>
  );
}

export function Carte({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.carte, style]}>{children}</View>;
}

export function Champ({ libelle, ...props }: TextInputProps & { libelle: string }) {
  return (
    <View style={{ marginBottom: espace.m }}>
      <Text style={styles.libelle}>{libelle}</Text>
      <TextInput placeholderTextColor={couleurs.texteDoux} style={styles.champ} {...props} />
    </View>
  );
}

export function Puce({ texte, actif, onPress }: { texte: string; actif: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.puce, actif && styles.puceActive]}>
      <Text style={[styles.puceTexte, actif && { color: couleurs.fond }]}>{texte}</Text>
    </Pressable>
  );
}

export function Titre({ children }: { children: ReactNode }) {
  return <Text style={styles.titre}>{children}</Text>;
}

export function Texte({ children, doux, style }: { children: ReactNode; doux?: boolean; style?: object }) {
  return <Text style={[{ color: doux ? couleurs.texteDoux : couleurs.texte, fontSize: 15 }, style]}>{children}</Text>;
}

export const styles = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: couleurs.fond },
  contenu: { padding: espace.m, paddingBottom: espace.l * 2 },
  bouton: { backgroundColor: couleurs.accent, paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: espace.s },
  boutonSecondaire: { backgroundColor: 'transparent', borderWidth: 1, borderColor: couleurs.bordure },
  boutonTexte: { color: couleurs.fond, fontWeight: '700', fontSize: 16 },
  carte: { backgroundColor: couleurs.carte, borderRadius: 16, padding: espace.m, marginBottom: espace.m, borderWidth: 1, borderColor: couleurs.bordure },
  libelle: { color: couleurs.texteDoux, marginBottom: 6, fontSize: 14 },
  champ: { backgroundColor: couleurs.carte, color: couleurs.texte, borderRadius: 12, borderWidth: 1, borderColor: couleurs.bordure, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  puce: { borderWidth: 1, borderColor: couleurs.bordure, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8, marginBottom: 8 },
  puceActive: { backgroundColor: couleurs.accent, borderColor: couleurs.accent },
  puceTexte: { color: couleurs.texte, fontSize: 14 },
  rangee: { flexDirection: 'row', flexWrap: 'wrap' },
  titre: { color: couleurs.texte, fontSize: 22, fontWeight: '800', marginBottom: espace.m },
});
