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
        <Stack.Screen name="jeux/ludo" options={{ title: 'Ludo' }} />
        <Stack.Screen name="jeux/poker" options={{ title: 'Poker' }} />
        <Stack.Screen name="jeux/bingo" options={{ title: 'Bingo' }} />
        <Stack.Screen name="jeux/roulette" options={{ title: 'Roulette' }} />
        <Stack.Screen name="jeux/machine" options={{ title: 'Machine à sous' }} />
        <Stack.Screen name="activites/[id]" options={{ title: 'Discussion' }} />
        <Stack.Screen name="activites/nouvelle" options={{ title: 'Nouvelle activité', presentation: 'modal' }} />
      </Stack>
    </FournisseurEtat>
  );
}
