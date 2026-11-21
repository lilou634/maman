# NeuroPlay 🧠

Un site personnel pour découvrir les neurosciences en partant de zéro :

- **Apprendre** : 7 leçons courtes (neurone, synapse, carte du cerveau, mémoire, sommeil, plasticité, perception), chacune avec un quiz, plus un glossaire avec recherche.
- **Mini-jeux** : carte du cerveau, faire tirer un neurone, temps de réaction, effet Stroop, mémoire des chiffres, illusion de Müller-Lyer. Chaque jeu explique ce qui s'est passé dans votre tête.
- **Actus** : un fil d'actualités sur le cerveau qui se renouvelle tout seul (relu toutes les 20 minutes), en français et en anglais, avec un badge « Nouveau » et des favoris.
- **Progression** : points d'expérience, niveaux, records et badges, enregistrés dans votre navigateur.

## Lancer le site

Il faut seulement **Python 3**, déjà présent sur Mac et Linux. Sur Windows, installez-le depuis https://www.python.org/downloads/ en cochant « Add Python to PATH ». Aucune autre installation n'est nécessaire.

**Le plus simple :** double-cliquez sur `lancer-windows.bat` (Windows) ou `lancer-mac.command` (Mac).
Le site s'ouvre tout seul sur http://localhost:8000.

**Ou dans un terminal**, depuis ce dossier :

```bash
python3 server.py
```

Sur Windows : `python server.py`. Pour arrêter : `Ctrl + C`. Pour changer de port : `python3 server.py --port 8080`.

> Ouvrir `public/index.html` directement marche pour les leçons et les jeux, mais pas pour les actualités : c'est le petit serveur qui va les chercher.

## Les sources d'actualités

Elles sont listées dans `feeds.json`. Vous pouvez en ajouter ou en retirer : il suffit d'un nom, d'une langue (`fr` ou `en`) et de l'adresse d'un flux RSS ou Atom. Une astuce pour suivre n'importe quel sujet ou site : Google Actualités fournit un flux pour toute recherche, par exemple
`https://news.google.com/rss/search?q=alzheimer&hl=fr&gl=FR&ceid=FR:fr`.

Si une source ne répond pas, les autres continuent de s'afficher. Le détail est visible en bas de l'en-tête de la page Actus (« Détail des sources »).

**Sur Mac**, si toutes les sources indiquent une erreur de certificat : ouvrez le dossier Python dans Applications et double-cliquez sur `Install Certificates.command`.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `server.py` | Petit serveur local : affiche le site et lit les flux d'actualités |
| `feeds.json` | Liste des sources d'actualités |
| `public/data.js` | Contenu des leçons, quiz, glossaire et ressources |
| `public/games.js` | Les mini-jeux |
| `public/app.js` | Navigation, progression, page d'actualités |
| `public/style.css` | Apparence (thème clair et sombre) |
