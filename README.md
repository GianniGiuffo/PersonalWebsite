# Personal Website

Sito personale di Tommaso Francescon, realizzato con [Hugo](https://gohugo.io/). Il progetto raccoglie informazioni personali, articoli e progetti in un'esperienza editoriale bilingue italiano/inglese.

> **Stato:** la versione 1.0 è completata. Il sito non è ancora pubblico; la pubblicazione sarà effettuata in un secondo momento.

## Caratteristiche

- contenuti disponibili in italiano e inglese;
- sezioni About, articoli e progetti;
- area privata protetta e configurata per non essere indicizzata;
- layout personalizzati e tipografia basata su font locali;
- shortcode per contenuti esterni come mappe, YouTube, Spotify e Instagram;
- build ottimizzata e predisposta per Netlify;
- output HTML, RSS e JSON per la home page.

## Tecnologie

- Hugo `0.163.3`;
- Tailwind CSS `4`;
- Node.js `24` per gli strumenti di build;
- Netlify per il deployment previsto.

## Sviluppo locale

Prerequisiti: Hugo extended e Node.js installati.

```bash
npm install
hugo server -D
```

Il sito sarà disponibile all'indirizzo indicato da Hugo, normalmente `http://localhost:1313/`.

Per generare la build di produzione:

```bash
hugo build --gc --minify
```

I file generati vengono salvati nella directory `public/`.

## Struttura principale

```text
content/    contenuti localizzati
layouts/    template e shortcode Hugo
assets/     CSS e asset elaborati da Hugo
static/     file copiati direttamente nella build
config/     configurazione del sito
public/     output della build
```

## Lingue

La lingua predefinita è l'italiano. La versione inglese è disponibile nella relativa struttura localizzata e può essere selezionata dal sito tramite il language switcher.

## Pubblicazione

La configurazione per Netlify è presente in `netlify.toml`. Prima della pubblicazione definitiva è necessario verificare dominio, contenuti e impostazioni del deployment.

## Licenza

Questo repository contiene il sito personale e i relativi contenuti. Non è attualmente definita una licenza di riuso.

---

## English

Personal website of Tommaso Francescon, built with [Hugo](https://gohugo.io/). The project contains personal information, posts and projects in an Italian/English bilingual experience.

> **Status:** version 1.0 is complete. The website is not public yet; publication will take place later.

The project includes localized content, custom layouts, a protected private area, external-content shortcodes, and a Netlify-ready production build. See the sections above for local development and project structure.
