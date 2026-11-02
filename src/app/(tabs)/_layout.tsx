import { Redirect } from 'expo-router';
import { Tabs } from 'expo-router/tabs';
import { ActivityIndicator, Text, View } from 'react-native';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

const icone = (emoji: string) => () => <Text style={{ fontSize: 20 }}>{emoji}</Text>;

export default function OngletsLayout() {
  const { pret, profil } = useEtat();
  if (!pret) {
    return (
      <View style={{ flex: 1, backgroundColor: couleurs.fond, justifyContent: 'center' }}>
        <ActivityIndicator color={couleurs.accent} />
      </View>
    );
  }
  if (!profil) return <Redirect href="/inscription" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: couleurs.fond },
        headerTintColor: couleurs.texte,
        tabBarStyle: { backgroundColor: couleurs.carte, borderTopColor: couleurs.bordure },
        tabBarActiveTintColor: couleurs.accent,
        tabBarInactiveTintColor: couleurs.texteDoux,
        sceneStyle: { backgroundColor: couleurs.fond },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Près de moi', tabBarIcon: icone('📍') }} />
      <Tabs.Screen name="jeux" options={{ title: 'Jeux', tabBarIcon: icone('🎮') }} />
      <Tabs.Screen name="activites" options={{ title: 'Activités', tabBarIcon: icone('⚽') }} />
      <Tabs.Screen name="profil" options={{ title: 'Profil', tabBarIcon: icone('👤') }} />
    </Tabs>
  );
}
