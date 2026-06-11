# Au dodo 🌙 — le sablier du rituel du coucher

PWA toute simple (HTML/CSS/JS, zéro dépendance) pour accompagner le rituel du coucher d'un petit :
un grand sablier se vide pendant chaque étape — 👕 Pyjama, 📖 Histoire, 🍼 Biberon, 🪥 Dents, 🤗 Câlin — et se
retourne à chaque changement, le sable prenant la couleur de l'étape. Une barre de progression
colorée (un segment par étape) montre l'avancée du rituel complet… puis au dodo !

- Durée et ordre des étapes configurables (réglages persistés sur le téléphone, rien ne sort).
- Intro animée au lancement qui récapitule les étapes jusqu'au dodo (désactivable dans les réglages).
- 27 langues (français, anglais, mandarin, hindi, espagnol, arabe, bengali, portugais, russe, ourdou,
  indonésien, allemand, japonais, swahili, marathi, télougou, turc, tamoul, vietnamien, coréen,
  filipino, persan, italien, thaï, pendjabi, polonais, ukrainien), détection automatique de la langue
  de l'appareil au premier lancement, droite-à-gauche pour l'arabe, l'ourdou et le persan.
- Carillon doux à chaque changement d'étape, berceuse à la fin (sons générés, aucun fichier audio).
- L'écran reste allumé pendant le rituel (Wake Lock, iOS ≥ 16.4).
- Fonctionne hors-ligne une fois installée (service worker).
- Reprise automatique si l'app est fermée par mégarde en plein rituel.

## Dev local

```
node tools/serve.js          # http://localhost:4173
```

Mode test : ajouter `?speed=60` à l'URL → le temps passe 60× plus vite (rituel de 30 min en 30 s).
Le service worker n'est pas enregistré sur localhost (pour éviter les caches pendant le dev).

## Icônes

```
powershell -ExecutionPolicy Bypass -File tools\make-icons.ps1
```

## Déploiement (GitHub Pages)

App en ligne : **https://dataonduty.github.io/rituel-dodo/**
(repo `Dataonduty/rituel-dodo`, Pages servi depuis la branche `gh-pages`)

À chaque mise à jour :

1. **Incrémenter la version du cache** dans `sw.js` (`dodo-v1` → `dodo-v2`).
2. Pousser sur les deux branches :

```
git push origin main
git push origin main:gh-pages
```

## Installation sur iPhone

1. Ouvrir https://dataonduty.github.io/rituel-dodo/ dans **Safari**.
2. Bouton **Partager** → **« Sur l'écran d'accueil »**.
3. Lancer l'app depuis son icône : plein écran, hors-ligne, écran maintenu allumé pendant le rituel.
