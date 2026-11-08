import { Pressable, Text, View } from 'react-native';
import { RECHARGE, useEtat } from '../store';
import { couleurs } from '../theme';
import { Puce, styles } from './ui';

export function BarreJetons() {
  const { jetons, rechargeDisponible, recharger } = useEtat();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, alignSelf: 'stretch' }}>
      <Text style={{ color: couleurs.accent, fontSize: 20, fontWeight: '800' }}>🪙 {jetons}</Text>
      {rechargeDisponible && (
        <Pressable onPress={recharger} style={[styles.puce, styles.puceActive, { marginBottom: 0 }]}>
          <Text style={{ color: couleurs.fond, fontWeight: '700' }}>+{RECHARGE} jetons gratuits</Text>
        </Pressable>
      )}
    </View>
  );
}

export function ChoixMise({ valeurs, mise, onChange }: { valeurs: number[]; mise: number; onChange: (m: number) => void }) {
  return (
    <View style={[styles.rangee, { justifyContent: 'center' }]}>
      {valeurs.map((v) => (
        <Puce key={v} texte={`🪙 ${v}`} actif={mise === v} onPress={() => onChange(v)} />
      ))}
    </View>
  );
}
