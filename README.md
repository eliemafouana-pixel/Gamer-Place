# Gamer Place

Appli mobile (iOS, Android et web) pour rencontrer les gens de son quartier ou de sa ville, autour de jeux en ligne et d'activités sportives en vrai.

## Ce que contient cette première version

- **Inscription** : pseudo, ville, quartier, jeux et sports préférés. 1000 jetons virtuels offerts.
- **Près de moi** : les joueurs du quartier ou de toute la ville, en ligne ou non.
- **Jeux** : jeu de dames (règles françaises 10×10, à deux sur le même téléphone). Ludo, poker, bingo, roulette et machine à sous sont annoncés « bientôt ».
- **Activités** : proposer ou rejoindre un match de foot, tennis, basket, volley, course ou pétanque.
- **Profil** : modifier son quartier et ses préférences.

Les jeux se jouent uniquement en jetons virtuels. En France, le casino en ligne est interdit et seul le poker peut être proposé en argent réel, avec un agrément de l'ANJ.

Pour l'instant, les données sont enregistrées sur le téléphone et les autres joueurs et activités sont des exemples. La prochaine étape est un serveur (comptes, géolocalisation, messagerie, parties en ligne entre joueurs).

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
