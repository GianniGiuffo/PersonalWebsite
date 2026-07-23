# Personal Website

Sito personale di Tommaso Francescon, realizzato con [Hugo](https://gohugo.io/). Il progetto raccoglie informazioni personali, articoli e progetti in un'esperienza editoriale bilingue italiano/inglese.

> **Stato:** il sito è pubblicato su `tommasofrancescon.it` tramite Caddy.

## Caratteristiche

- contenuti disponibili in italiano e inglese;
- sezioni About, articoli e progetti;
- area privata accessibile soltanto tramite Tailscale;
- layout personalizzati e tipografia basata su font locali;
- shortcode per contenuti esterni come mappe, YouTube, Spotify e Instagram;
- build statica ottimizzata per Caddy;
- output HTML, RSS e JSON per la home page.

## Tecnologie

- Hugo `0.163.3`;
- Tailwind CSS `4`;
- Node.js `24` per gli strumenti di build;
- Caddy per la pubblicazione sul server personale;
- Tailscale Serve per l'area privata.

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

Il sito viene pubblicato dal server personale tramite Caddy. Per rendere privata
la sezione `/private/`, segui [la configurazione Caddy e Tailscale](docs/private-area-caddy-tailscale.md).

## Licenza

Questo repository contiene il sito personale e i relativi contenuti. Non è attualmente definita una licenza di riuso.

---

## English

Personal website of Tommaso Francescon, built with [Hugo](https://gohugo.io/). The project contains personal information, posts and projects in an Italian/English bilingual experience.

> **Status:** the website is published at `tommasofrancescon.it` through Caddy.

The project includes localized content, custom layouts, a Tailscale-only private area,
external-content shortcodes, and a Caddy-ready static production build. See the
sections above for local development and project structure.
