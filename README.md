# 🐉 Calculateur Dokkan Battle — Calculateur de Défense

Calculateur de défense pour *Dragon Ball Z Dokkan Battle*. Il permet d'estimer
la défense d'un personnage, de visualiser les seuils de survie face aux boss et
de gérer ses propres boss personnalisés.

## Fonctionnalités

- Calcul de défense à partir des statistiques, du leader, des liens, des boosts
  multiplicatifs, des stacks et de la situation classe/type
- Seuil d'annulation et seuil de mort selon les PV de l'équipe
- Courbe de dégâts interactive (Plotly) avec positionnement des boss
- Gestion des boss : ajout, modification et masquage de boss personnalisés
- Sauvegarde, import/export et partage de configurations par lien
- Calculatrice intégrée, disponible en fenêtre flottante

## Organisation du projet

| Chemin | Rôle |
|---|---|
| `index.php` | Page principale du calculateur |
| `Boss.php` | Gestion des boss |
| `calculatriceDokkan.php` / `calculatricePopup.php` | Calculatrice |
| `assets/` | CSS, JavaScript et images |
| `dist/` | Version statique générée, déployée sur Cloudflare |
| `build-static.mjs` | Génère `dist/` (Node, multiplateforme) |
| `build-static.ps1` | Équivalent PowerShell pour Windows |
| `wrangler.jsonc` | Configuration du déploiement Cloudflare Workers |

## Développement local

Les pages portent l'extension `.php` par héritage, mais le site ne contient
**aucune logique serveur** : tous les calculs sont effectués en JavaScript dans
le navigateur et les données sont conservées dans le `localStorage`.

Avec WAMP, placer le dossier dans `www/` et ouvrir la page dans le navigateur.
Sinon, n'importe quel serveur statique suffit :

```bash
node build-static.mjs
npx serve dist
```

## Déploiement

Le site est déployé sur Cloudflare Workers en tant que ressources statiques.

```bash
node build-static.mjs   # génère dist/
npx wrangler deploy     # publie
```

Un push sur `main` déclenche également un déploiement automatique.

## Sécurité

- Les contenus fournis par l'utilisateur (noms de personnages et de boss,
  configurations importées, paramètre d'URL `?config=`) sont échappés avant tout
  affichage afin de prévenir les injections XSS.
- Plotly est chargé depuis une version épinglée avec contrôle d'intégrité (SRI).
- Les en-têtes de sécurité sont définis dans `dist/_headers` (Cloudflare) et
  dans `.htaccess` (Apache).

## Auteur

[Victorius500](https://github.com/Victorius500)
