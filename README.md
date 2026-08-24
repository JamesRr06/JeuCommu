# Soirée Jeux 🎲

Application Android **100 % hors ligne** pour animer des jeux d'ambiance en soirée, sur un seul téléphone
qu'on se passe entre joueurs.

- 🕵️ **Undercover** — un mot pour les civils, un mot voisin pour les undercover, rien pour Mr White.
- 🐺 **Loup-Garou** — distribution des rôles + narrateur guidé (nuits, pouvoirs, votes, victoires).
- 👥 Jusqu'à **15 joueurs** par session.
- 🏆 **Sessions multi-parties** avec classement cumulé et barème de points paramétrable.
- 💾 Tout est stocké **en local** sur le téléphone (aucun compte, aucun réseau).

## Télécharger l'APK

1. Onglet **Releases** du dépôt GitHub.
2. Prendre `soiree-jeux.apk` (release **Dernière version (main)** pour le dernier build).
3. Sur le téléphone : ouvrir le fichier, autoriser « Installer des applications inconnues » pour le navigateur,
   puis installer.

L'APK est signé avec la clé de debug Android : c'est normal pour une app distribuée hors Play Store.

## Comment ça marche

Une **session** = une soirée. On y ajoute les joueurs (max 15), on lance autant de **parties** que l'on veut
(Undercover, Loup-Garou…), et chaque partie enregistrée alimente le **classement** de la session.

Barème par défaut (modifiable dans *Réglages*) :

| Undercover | pts | | Loup-Garou | pts |
|---|---|---|---|---|
| Civils | 1 | | Village | 1 |
| Undercover | 3 | | Loups-Garous | 2 |
| Mr White | 4 | | Amoureux | 3 |

Les points sont figés au moment où la partie est enregistrée : changer le barème ne réécrit pas l'historique.

### Undercover

Chaque joueur découvre son mot en privé, puis on décrit son mot à tour de rôle sans le prononcer.
Vote, élimination, révélation du rôle. Un Mr White éliminé peut tenter de deviner le mot des civils
pour voler la victoire. Les infiltrés gagnent dès qu'ils sont aussi nombreux que les civils.

### Loup-Garou

L'app distribue les rôles (les loups voient leur meute), puis guide le narrateur étape par étape :
Cupidon, Salvateur, Voyante, Loups, Sorcière — en n'affichant que les étapes encore en jeu.
Elle calcule les morts (protection, potions, chagrin des amoureux), déclenche le tir du Chasseur,
gère le vote du jour et détecte la fin de partie.

Rôles disponibles : Loup-Garou, Villageois, Voyante, Sorcière, Chasseur, Cupidon, Salvateur, Petite Fille.

## Développement

```bash
npm install
npm run dev        # app web sur http://localhost:5173
npm run build      # bundle de production dans dist/
npm run typecheck
```

Stack : React + TypeScript + Vite, empaqueté avec [Capacitor](https://capacitorjs.com/) pour Android.
Aucune dépendance réseau à l'exécution.

### Construire l'APK

Le workflow GitHub Actions `.github/workflows/android.yml` s'en charge à chaque push sur `main`
(et publie la release `dev-latest`). Un tag `v1.2.3` crée une release stable.

En local (nécessite JDK 21 + Android SDK) :

```bash
npm run build && npx cap add android && npx cap sync android && cd android && ./gradlew assembleDebug
```

### Ajouter un jeu

1. Créer `src/games/<mon-jeu>/MonJeu.tsx` exportant un composant `{ session, onFinish, onQuit }`.
2. Ajouter son identifiant à `GameId` dans `src/types.ts` et son barème dans `Scoring`.
3. L'enregistrer dans `src/games/registry.ts`.

Le composant appelle `onFinish(round)` avec le détail par joueur (rôle, camp, victoire, points) :
le classement de session se met à jour tout seul.
