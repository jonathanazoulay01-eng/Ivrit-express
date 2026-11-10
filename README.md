# Ivrit Express

Appli web installable (PWA) pour apprendre l'hébreu moderne : 60 étapes réparties en 5 mondes, 600 mots, 300 phrases.

Chaque étape : 1) cartes des mots, 2) jeu des mots, 3) phrases (lecture + remettre dans l'ordre), 4) contrôle (8/10 pour débloquer la suivante).
Défi du jour (révision, insiste sur les erreurs) + série de jours 🔥 + rappel quotidien.

Voyelles : étapes 1-6 partout, 7-36 seulement pendant l'apprentissage, 37-60 sans (toucher un mot pour les voir).

## Mettre en ligne (GitHub Pages, gratuit)
1. Créer un dépôt public sur github.com (ex. `ivrit-express`).
2. Y déposer tous les fichiers de ce dossier.
3. Settings → Pages → Branch `main` / root → Save.
4. Ouvrir `https://jonathanazoulay01-eng.github.io/Ivrit-express/` sur le téléphone, puis "Installer" / "Sur l'écran d'accueil".

## Ajouter du contenu
Tout est dans `data.js` (monde 1) et `data2.js` (mondes 2 à 5) : ajouter une étape = copier un bloc `{ id, emoji, title, nikud, words, sentences }`.
