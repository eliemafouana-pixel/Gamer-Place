# Gamer Place

Appli mobile (iOS, Android et web) pour rencontrer les gens de son quartier ou de sa ville, autour de jeux en ligne et d'activités sportives en vrai.

## Ce que contient cette première version

- **Accueil et inscription** : pseudo, ville, quartier, jeux et sports préférés. 1000 jetons virtuels offerts.
- **Près de moi** : les joueurs du quartier ou de toute la ville, en ligne ou non.
- **Jeux** (en jetons virtuels) :
  - Dames (règles françaises 10×10, à deux sur le même téléphone)
  - Ludo contre 3 adversaires
  - Poker Texas Hold'em contre 3 adversaires
  - Bingo à 75 boules
  - Roulette européenne
  - Machine à sous
  - 500 jetons gratuits par jour quand le solde passe sous 100.
- **Activités** : proposer ou rejoindre un match de foot, tennis, basket, volley, course ou pétanque. Chaque activité a sa discussion, la liste des participants et la confirmation de présence (je serai là, peut-être, je ne viens pas).
- **Profil** : modifier son quartier et ses préférences.

Les jeux se jouent uniquement en jetons virtuels. En France, le casino en ligne est interdit et seul le poker peut être proposé en argent réel, avec un agrément de l'ANJ.

Pour l'instant, les données sont enregistrées sur le téléphone : les autres joueurs, les adversaires des jeux et les activités sont des exemples, et les messages ne sont visibles que sur l'appareil qui les écrit. La prochaine étape est un serveur (comptes, géolocalisation, messagerie partagée, parties en ligne entre vrais joueurs).

## Lancer l'appli

```bash
npm install
npx expo start
```

Scanner le QR code avec l'appli **Expo Go** sur le téléphone, ou appuyer sur `w` pour l'ouvrir dans le navigateur.

## Organisation du code

- `src/app/` : les écrans (Expo Router)
- `src/games/` : la logique des jeux
- `src/data/` : catalogue des jeux et sports, données d'exemple
- `src/store.tsx` : état de l'appli et sauvegarde sur le téléphone
