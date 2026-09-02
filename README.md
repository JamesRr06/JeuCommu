# JeuCommu 🎲

Application Android **100 % hors ligne** pour animer des jeux d'ambiance en soirée, sur un seul téléphone
qu'on se passe entre joueurs.

- 🕵️ **Undercover** — un mot pour les civils, un mot voisin pour les undercover, rien pour Mr White.
- 🐺 **Loup-Garou** — distribution des rôles + narrateur guidé (nuits, pouvoirs, votes, victoires).
- 👥 Jusqu'à **15 joueurs** par session.
- 🏆 **Sessions multi-parties** avec classement cumulé et barème de points paramétrable.
- ⚙️ **Réglages accessibles à tout moment**, même en pleine partie (engrenage de la barre de titre).
- 🖤 Interface **noir et or**, pensée pour une pièce peu éclairée, avec un ciel étoilé animé
  et un emblème par étape de nuit pour guider le narrateur d'un coup d'œil.
- ⏱️ **Minuteur de débat** réglable (5 min par défaut) avec vibration et bips en fin de temps.
- 🎯 **Compositions conseillées** selon le nombre de joueurs, proposées d'un bouton et jamais imposées.
- ✨ Navigation **fluide** : les écrans glissent dans le sens de la navigation, les listes se déroulent en
  cascade, les boutons répondent au doigt et les moments forts (révélation, élimination, victoire) sont
  soulignés par une vibration courte et un reflet doré.
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
L'engrenage de la barre de titre ouvre les réglages depuis la création, la session et même une partie
en cours ; les changements de composition s'appliquent à la partie suivante. Le menu d'accueil n'en a
pas : tout ce qui se règle appartient à une session.

Barème par défaut (modifiable dans *Réglages*) :

| Undercover | pts | | Loup-Garou | pts |
|---|---|---|---|---|
| Civils | 1 | | Village | 1 |
| Undercover | 3 | | Loups-Garous | 2 |
| Mr White | 4 | | Amoureux | 3 |

Les points sont figés au moment où la partie est enregistrée : changer le barème ne réécrit pas l'historique.

Le **minuteur de débat** (réglages du Loup-Garou, 5 min par défaut, 0 pour le désactiver) démarre tout seul
au lever du jour. Pause, +1 min et relance restent accessibles ; à zéro, l'app vibre, émet trois bips et
passe la carte en rouge.

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

**24 rôles** sont disponibles. Chacun porte un bouton **ⓘ** dans l'écran de composition : survol à la
souris, appui au doigt, et le détail complet du rôle tel que l'app le joue s'affiche.

*Base* — Loup-Garou, Villageois, Voyante, Sorcière, Chasseur, Cupidon, Salvateur, Petite Fille
(rôle purement oral : l'app ne lui ouvre pas d'étape).

*Morts et secondes vies*

- **Marionnettiste** — dévoré par les loups, sa marionnette meurt à sa place. Il reste en jeu mais devient
  muet (badge « muet ») et ne communique plus que par gestes. Le poison de la Sorcière passe outre.
- **Ancien** — survit à la première morsure. Mais tué par le vote du village, sa rancune supprime tous les
  pouvoirs villageois : l'app n'ouvre plus aucune étape de nuit du village.
- **Colosse** — dévoré par les loups, il découvre la meute sur le téléphone et emporte le loup de son choix.
- **Idiot du Village** — le premier vote qui le condamne retourne sa carte : il est épargné, mais perd son
  droit de vote (badge « sans voix »). Un second vote l'élimine pour de bon.
- **Servante Dévouée** — à chaque vague de morts, elle peut prendre la place d'un éliminé **sans voir sa
  carte**. Elle hérite du rôle et de ses pouvoirs — les potions déjà bues restent bues, mais son tir de
  Chasseur est intact — et le rôle du mort n'est jamais révélé. Une seule fois dans la partie.

*Information*

- **Singe Savant** — une fois dans la partie, il retourne autant de cartes qu'il veut, une par une, et
  s'arrête quand il le souhaite. Une carte de loup et il meurt, annoncé à l'aube.
- **Renard** — chaque nuit, l'app lui dit si un loup se cache parmi une cible et ses deux voisins vivants.
  L'ordre de la table est celui de saisie des joueurs. Une réponse négative lui coûte son flair.
- **Corbeau** — désigne chaque nuit un joueur qui commence la journée avec deux voix contre lui : l'app
  l'affiche en tête de l'écran du jour et le marque « +2 voix ». Le décompte reste au narrateur.

*Camps et bascules*

- **Chien-Loup** — au moment où l'app lui montre sa carte, il choisit son camp. S'il rejoint la meute, il
  la découvre aussitôt et compte comme loup jusqu'au bout.
- **Enfant Sauvage** — désigne un modèle la première nuit. Si le modèle meurt, l'app le réveille en privé
  la nuit suivante pour lui annoncer sa bascule et lui montrer la meute.
- **Loup-Garou Blanc** — se réveille avec la meute, puis seul chaque nuit paire pour dévorer un loup. Il ne
  gagne son camp *solitaire* (barème dédié) que s'il est le dernier survivant ; sinon il gagne avec la meute.
- **Villageois-Villageois** — l'app lui demande de montrer sa carte à toute la table ; badge « innocent ».

*Vote et mise en scène*

- **Bouc Émissaire** — ajoute un bouton « Égalité » au vote. En cas d'égalité il meurt, puis désigne les
  joueurs privés de vote pour la journée suivante (badge « ne vote pas »).
- **Juge Bègue** — une fois dans la partie, l'app lui propose un second vote immédiat après le premier,
  avec un nouveau minuteur de débat.
- **Voleur** — deux cartes supplémentaires (deux villageois) rejoignent le paquet et deux cartes au hasard
  restent au milieu. La première nuit, il les découvre et peut en prendre une ; si les deux sont des loups,
  il est obligé d'échanger. La composition réellement distribuée peut donc être plus légère qu'annoncée.
- **Comédien** — trois pouvoirs non utilisés dans la partie (Voyante, Salvateur, Renard, Corbeau, Chasseur)
  sont mis de côté. Chaque nuit il en joue un, l'app enchaîne aussitôt sur l'étape correspondante, et la
  carte est écartée.

### Composition conseillée

L'écran de réglages propose une composition adaptée à l'effectif (1 loup pour 4-5 joueurs, 2 jusqu'à 9,
3 jusqu'à 13, 4 au-delà ; les pouvoirs arrivent progressivement). Un bouton l'applique d'un coup — et rien
n'oblige à la suivre : c'est un simple repère d'équilibrage, la composition reste entièrement libre.

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
