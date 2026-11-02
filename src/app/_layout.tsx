import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { FournisseurEtat } from '../store';
import { couleurs } from '../theme';

export default function RacineLayout() {
  return (
    <FournisseurEtat>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: couleurs.fond },
          headerTintColor: couleurs.texte,
          contentStyle: { backgroundColor: couleurs.fond },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="inscription" options={{ headerShown: false }} />
        <Stack.Screen name="jeux/dames" options={{ title: 'Dames' }} />
        <Stack.Screen name="activites/nouvelle" options={{ title: 'Nouvelle activité', presentation: 'modal' }} />
      </Stack>
    </FournisseurEtat>
  );
}
