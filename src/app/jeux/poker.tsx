import { useEffect, useRef, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BarreJetons, ChoixMise } from '../../components/jeux';
import { Bouton, Carte as Cadre, Texte, styles } from '../../components/ui';
import {
  agir,
  aSuivre,
  bornesRelance,
  creerTable,
  decisionBot,
  estRouge,
  meilleureMain,
  nomCarte,
  nomMain,
  nouvelleMain,
  pot,
  type Carte,
  type Table,
} from '../../games/poker';
import { useEtat } from '../../store';
import { couleurs } from '../../theme';

function CarteJeu({ carte, cachee, petite }: { carte?: Carte; cachee?: boolean; petite?: boolean }) {
  const l = petite ? 30 : 44;
  return (
    <View
      style={{
        width: l,
        height: l * 1.4,
        borderRadius: 6,
        marginHorizontal: 2,
        backgroundColor: cachee ? '#3949AB' : '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#00000033',
      }}
    >
      {!cachee && carte && (
        <Text style={{ color: estRouge(carte) ? '#C62828' : '#111', fontWeight: '800', fontSize: petite ? 12 : 17 }}>{nomCarte(carte)}</Text>
      )}
    </View>
  );
}

const PHASES: Record<string, string> = { preflop: 'Avant le flop', flop: 'Flop', turn: 'Turn', river: 'River', fin: 'Fin de la main' };

export default function Poker() {
  const { profil, miser, crediter } = useEtat();
  const [cave, setCave] = useState(500);
  const [table, setTable] = useState<Table | null>(null);
  const [erreur, setErreur] = useState('');

  // Les jetons restés sur la table reviennent au joueur quand il quitte l'écran.
  const surTable = useRef(0);
  surTable.current = table ? table.joueurs[0].jetons : 0;
  useEffect(() => () => void (surTable.current && crediter(surTable.current)), []);

  // Les adversaires jouent automatiquement.
  useEffect(() => {
    if (!table || table.phase === 'fin' || table.joueurs[table.actif]?.humain) return;
    const t = setTimeout(() => setTable(agir(table, decisionBot(table))), 800);
    return () => clearTimeout(t);
  }, [table]);

  const sAsseoir = () => {
    if (!miser(cave)) return setErreur('Pas assez de jetons pour cette cave.');
    setErreur('');
    setTable(nouvelleMain(creerTable(profil?.pseudo ?? 'Moi', cave)));
  };

  const mainSuivante = () => {
    if (!table) return;
    // Un adversaire ruiné se recave pour que la partie continue.
    const t = { ...table, joueurs: table.joueurs.map((j) => (!j.humain && j.jetons === 0 ? { ...j, jetons: cave } : j)) };
    setTable(nouvelleMain(t));
  };

  const quitter = () => {
    if (!table) return;
    crediter(table.joueurs[0].jetons);
    setTable(null);
  };

  if (!table) {
    return (
      <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
        <BarreJetons />
        <Cadre>
          <Texte style={{ fontWeight: '700', fontSize: 18, marginBottom: 6 }}>Texas Hold'em</Texte>
          <Texte doux>Tu joues contre 3 adversaires. Blindes 10 / 20. Choisis combien de jetons tu apportes à la table.</Texte>
        </Cadre>
        <ChoixMise valeurs={[200, 500, 1000]} mise={cave} onChange={setCave} />
        {!!erreur && <Texte style={{ color: couleurs.rouge, textAlign: 'center' }}>{erreur}</Texte>}
        <Bouton titre={`S'asseoir à la table (${cave} jetons)`} onPress={sAsseoir} />
      </ScrollView>
    );
  }

  const moi = table.joueurs[0];
  const monTour = table.phase !== 'fin' && table.actif === 0;
  const prix = monTour ? aSuivre(table) : 0;
  const relance = monTour ? bornesRelance(table) : null;
  const total = pot(table);
  const maMain = moi.cartes.length && table.tableau.length >= 3 ? nomMain(meilleureMain([...moi.cartes, ...table.tableau])) : '';
  const finie = table.phase === 'fin';

  return (
    <ScrollView style={styles.ecran} contentContainerStyle={styles.contenu}>
      {table.joueurs.slice(1).map((j, k) => {
        const i = k + 1;
        return (
          <View
            key={j.nom}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 10,
              marginBottom: 6,
              borderRadius: 12,
              backgroundColor: couleurs.carte,
              borderWidth: 2,
              borderColor: table.actif === i ? couleurs.accent : 'transparent',
              opacity: j.couche ? 0.45 : 1,
            }}
          >
            <View>
              <Texte style={{ fontWeight: '700' }}>
                {j.nom} {table.donneur === i ? '🔘' : ''}
              </Texte>
              <Texte doux style={{ fontSize: 13 }}>
                🪙 {j.jetons} {j.mise ? `· mise ${j.mise}` : ''} {j.couche ? '· couché' : ''}
              </Texte>
            </View>
            <View style={{ flexDirection: 'row' }}>
              {j.cartes.map((c, n) => (
                <CarteJeu key={n} carte={c} cachee={!finie || j.couche} petite />
              ))}
            </View>
          </View>
        );
      })}

      <View style={{ backgroundColor: '#0B6B3A', borderRadius: 60, paddingVertical: 18, alignItems: 'center', marginVertical: 10, borderWidth: 4, borderColor: '#5D3A1A' }}>
        <Text style={{ color: '#E8F5E9', fontWeight: '700', marginBottom: 8 }}>
          {PHASES[table.phase]} · Pot 🪙 {total}
        </Text>
        <View style={{ flexDirection: 'row', minHeight: 62 }}>
          {table.tableau.map((c, n) => (
            <CarteJeu key={n} carte={c} />
          ))}
        </View>
      </View>

      <View style={{ alignItems: 'center', marginBottom: 8 }}>
        <View style={{ flexDirection: 'row', marginBottom: 6 }}>
          {moi.cartes.map((c, n) => (
            <CarteJeu key={n} carte={c} />
          ))}
        </View>
        <Texte style={{ fontWeight: '700' }}>
          {moi.nom} {table.donneur === 0 ? '🔘' : ''} · 🪙 {moi.jetons} {moi.mise ? `· mise ${moi.mise}` : ''}
        </Texte>
        {!!maMain && <Texte doux>Ta main : {maMain}</Texte>}
      </View>

      {finie ? (
        <>
          {table.gagnants.map((g) => (
            <Text key={g.nom} style={{ color: couleurs.accent, fontWeight: '800', fontSize: 16, textAlign: 'center' }}>
              🏆 {g.nom} gagne {g.gain} {g.main ? `avec ${g.main}` : ''}
            </Text>
          ))}
          {moi.jetons > 0 ? <Bouton titre="Main suivante" onPress={mainSuivante} /> : <Texte style={{ textAlign: 'center', marginTop: 8 }}>Tu n'as plus de jetons à cette table.</Texte>}
          <Bouton titre={`Quitter la table (récupérer ${moi.jetons} jetons)`} secondaire onPress={quitter} />
        </>
      ) : monTour ? (
        <>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Bouton titre="Se coucher" secondaire onPress={() => setTable(agir(table, { type: 'coucher' }))} />
            </View>
            <View style={{ flex: 1 }}>
              <Bouton titre={prix ? `Suivre ${prix}` : 'Parole'} onPress={() => setTable(agir(table, { type: 'suivre' }))} />
            </View>
          </View>
          {relance?.possible && (
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Bouton titre={`Relancer à ${relance.min}`} secondaire onPress={() => setTable(agir(table, { type: 'relancer', total: relance.min }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Bouton titre={`Tapis (${relance.max})`} secondaire onPress={() => setTable(agir(table, { type: 'relancer', total: relance.max }))} />
              </View>
            </View>
          )}
        </>
      ) : (
        <Texte doux style={{ textAlign: 'center' }}>{table.joueurs[table.actif]?.nom} réfléchit…</Texte>
      )}

      {table.journal.length > 0 && (
        <Cadre style={{ marginTop: 14 }}>
          {table.journal.slice(-5).map((l, n) => (
            <Texte key={n} doux style={{ fontSize: 13 }}>
              {l}
            </Texte>
          ))}
        </Cadre>
      )}
    </ScrollView>
  );
}
