# JeuCommu 🎲

Application Android **100 % hors ligne** pour animer des jeux d'ambiance en soirée, sur un seul téléphone
qu'on se passe entre joueurs.

- 🕵️ **Undercover** — un mot pour les civils, un mot voisin pour les undercover, rien pour Mr White.
- 🐺 **Loup-Garou** — distribution des rôles + narrateur guidé (nuits, pouvoirs, votes, victoires).
- 👥 Jusqu'à **15 joueurs** par session.
- 🏆 **Sessions multi-parties** avec classement cumulé et barème de points paramétrable.
- ⚙️ **Réglages accessibles à tout moment**, même en pleine partie (engrenage de la barre de titre).
- 🖤 Interface **noir et or**, pensée pour une pièce peu éclairée.
- 💾 Tout est stocké **en local** sur le téléphone (aucun compte, aucun réseau).

## Télécharger l'APK

1. Onglet **Releases** du dépôt GitHub.
2. Prendre `jeucommu.apk` (release **Dernière version (main)** pour le dernier build).
3. Sur le téléphone : ouvrir le fichier, autoriser « Installer des applications inconnues » pour le navigateur,
   puis installer.

L'APK est signé avec la clé de debug Android : c'est normal pour une app distribuée hors Play Store.

## Comment ça marche

Le parcours suit toujours le même ordre :

1. **Menu** — on choisit le jeu.
2. **Joueurs** — on nomme la session et on saisit les joueurs (max 15).
3. **Réglages** — composition du jeu (nombre d'infiltrés, de loups, rôles spéciaux…) et barème de points.
4. **Session** — on lance autant de **parties** que l'on veut ; les onglets *Partie*, *Classement* et
   *Historique* donnent l'état de la soirée en direct.

Une **session** = une soirée sur un seul jeu. Chaque partie enregistrée alimente son **classement**.
L'engrenage de la barre de titre ouvre les réglages depuis n'importe quel écran — menu, création,
session ou partie en cours ; les changements de composition s'appliquent à la partie suivante.

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

Les mots sont tirés au sort et **jamais affichés avant la distribution** : celui qui lance la partie
peut donc jouer, il ne les connaît pas. On peut retirer une autre paire à l'aveugle.

### Loup-Garou

L'app distribue les rôles (les loups voient leur meute), puis guide le narrateur étape par étape :
Cupidon, Salvateur, Voyante, Loups, Sorcière — en n'affichant que les étapes encore en jeu.
Elle calcule les morts (protection, potions, chagrin des amoureux), déclenche le tir du Chasseur,
gère le vote du jour et détecte la fin de partie.

Rôles disponibles : Loup-Garou, Villageois, Voyante, Sorcière, Chasseur, Cupidon, Salvateur, Petite Fille,
Marionnettiste, Colosse, Singe Savant.

- **Marionnettiste** — seconde vie : dévoré par les loups, sa marionnette meurt à sa place. Il reste en jeu
  mais devient muet (l'app le marque « muet » dans les listes) et ne communique plus que par gestes.
- **Colosse** — dévoré par les loups, il se réveille, découvre la meute sur le téléphone et emporte
  le loup de son choix dans la tombe.
- **Singe Savant** — une fois dans la partie, il retourne autant de cartes qu'il veut, une par une, et
  s'arrête quand il le souhaite. Une carte de Loup-Garou et il meurt (annoncé à l'aube). Il peut aussi
  passer son tour pour garder son pouvoir pour une nuit suivante.

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
2. Créer `src/games/<mon-jeu>/config.tsx` avec `defaultConfig`, `validate`, `describe` et `ConfigEditor` :
   c'est l'écran de réglages, réutilisé par l'assistant de création et par le panneau d'engrenage.
3. Ajouter son identifiant à `GameId` dans `src/types.ts`, son type de réglages à `GameConfig`
   et son barème dans `DEFAULT_SCORING`.
4. L'enregistrer dans `src/games/registry.ts` (dont les `camps` alimentent l'éditeur de barème).

Le composant appelle `onFinish(round)` avec le détail par joueur (rôle, camp, victoire, points) :
le classement de session se met à jour tout seul.
