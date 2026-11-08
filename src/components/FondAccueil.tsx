import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

// Icônes de jeux et de sports qui flottent doucement derrière l'écran d'accueil.
const DECOR = [
  { e: '🎲', top: '6%', left: '8%', taille: 34, duree: 3800 },
  { e: '⚽', top: '10%', left: '78%', taille: 40, duree: 4200 },
  { e: '🃏', top: '24%', left: '88%', taille: 28, duree: 3500 },
  { e: '🏀', top: '30%', left: '4%', taille: 30, duree: 4600 },
  { e: '🎰', top: '46%', left: '86%', taille: 32, duree: 4000 },
  { e: '🎾', top: '58%', left: '6%', taille: 28, duree: 3700 },
  { e: '🎡', top: '70%', left: '82%', taille: 34, duree: 4400 },
  { e: '🏐', top: '82%', left: '12%', taille: 32, duree: 3900 },
  { e: '🔢', top: '90%', left: '70%', taille: 28, duree: 4100 },
  { e: '⚫', top: '18%', left: '40%', taille: 18, duree: 3600 },
] as const;

function Flottant({ e, top, left, taille, duree }: (typeof DECOR)[number]) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const boucle = Animated.loop(
      Animated.sequence([
        Animated.timing(v, { toValue: 1, duration: duree, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(v, { toValue: 0, duration: duree, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]),
    );
    boucle.start();
    return () => boucle.stop();
  }, [v, duree]);
  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top,
        left,
        fontSize: taille,
        opacity: 0.22,
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -14] }) },
          { rotate: v.interpolate({ inputRange: [0, 1], outputRange: ['-8deg', '8deg'] }) },
        ],
      }}
    >
      {e}
    </Animated.Text>
  );
}

export function FondAccueil() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={['#2B0A57', '#1A1060', '#0B1A4A', '#0F1226']} locations={[0, 0.35, 0.7, 1]} style={StyleSheet.absoluteFill} />
      {/* Halos lumineux */}
      <View style={[styles.halo, { top: -80, left: -60, backgroundColor: '#FF3CAC' }]} />
      <View style={[styles.halo, { bottom: -100, right: -80, backgroundColor: '#2B86C5' }]} />
      <View style={[styles.halo, { top: '35%', right: -120, width: 220, height: 220, backgroundColor: '#FFB020', opacity: 0.12 }]} />
      {DECOR.map((d) => (
        <Flottant key={d.e} {...d} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  halo: { position: 'absolute', width: 280, height: 280, borderRadius: 140, opacity: 0.22 },
});
