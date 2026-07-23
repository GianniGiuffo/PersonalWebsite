# Area privata con Caddy e Tailscale

L'area privata del sito non usa password, account o JavaScript per autenticare.
Il sito pubblico resta su `tommasofrancescon.it`; Caddy restituisce `404` per
le pagine private. Il Caddy del Raspberry ascolta anche su una porta pubblicata
solo su `127.0.0.1`; Tailscale Serve instrada a quella porta esclusivamente gli
URL privati all'interno del tailnet.

> Configura prima Caddy e Tailscale, poi pubblica il deploy che contiene
> contenuti privati.

## 1. Caddy

Nel repository `PiServer`, modifica `Caddyfile` e `compose.yaml`. Il primo
blocco impedisce l'accesso pubblico; il secondo serve gli stessi file soltanto
sul listener locale. La porta `8083` deve essere mappata esclusivamente a
`127.0.0.1` nel servizio Docker di Caddy.

```caddyfile
http://{$SITE_1_DOMAIN} {
    root * /srv/sites/site-1/current
    encode zstd gzip

    # Questi URL non sono mai disponibili sul dominio pubblico.
    @private path /private /private/* /en/private /en/private/*
    handle @private {
        respond 404
    }

    # Tutto il resto del sito rimane pubblico.
    handle {
        file_server
    }
}

# Questo listener non è esposto sulla LAN o su Internet: lo raggiunge soltanto
# Tailscale Serve tramite loopback.
http://:8083 {
    root * /srv/sites/site-1/current
    encode zstd gzip
    file_server
}
```

Non limitare il listener `127.0.0.1:8083` al solo percorso `/private`:
le pagine Hugo caricano i fogli di stile da URL assoluti come `/css/main.…css`.
Il listener deve quindi servire **tutta** la cartella `public`; è comunque
raggiungibile soltanto dal tailnet attraverso Tailscale Serve.

Se il blocco del dominio contiene già altri handler o proxy, integra i due
`handle` al suo interno mantenendo quello di `/private` prima del fallback.

Sul Raspberry, valida e ricrea il solo container Caddy:

```bash
cd /opt/raspberry-server
docker compose config --quiet
docker compose exec -T caddy caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
docker compose up -d caddy
```

## 2. Tailscale Serve

Sul server, aggiorna tutte le route Tailscale insieme. Questo conserva
Nextcloud su `/` e Pi-hole su `/admin/`, aggiungendo `/private/` e
`/en/private/`:

```bash
cd /opt/raspberry-server
sudo bash scripts/configure-tailscale-serve.sh
sudo tailscale serve status
```

Il secondo comando mostra l'URL MagicDNS, con una forma simile a:

```text
https://nome-server.nome-tailnet.ts.net
```

L'area privata si apre quindi a:

```text
https://nome-server.nome-tailnet.ts.net/private/
```

Tailscale Serve è disponibile solo ai dispositivi autorizzati nel tailnet;
se condividi il tailnet con altre persone, limita ulteriormente l'endpoint con
le access policy di Tailscale.

## 3. Collega il lucchetto del sito

In `hugo.toml`, inserisci l'URL esatto restituito da `tailscale serve status`:

```toml
[params]
privateURL = 'https://nome-server.nome-tailnet.ts.net/private/'
```

Finché `privateURL` è vuoto il lucchetto rimane volutamente disabilitato,
evitando di inviare richieste all'URL pubblico bloccato.

## 4. Verifica

1. Da una rete senza Tailscale, `https://tommasofrancescon.it/private/` deve
   restituire `404`.
2. Da un dispositivo connesso al tuo tailnet, l'URL MagicDNS deve aprire
   `/private/` e `/en/private/`.
3. Aprendo la pagina privata, le richieste a `/css/main.…css` devono restituire
   `200` nel pannello Network del browser. Se sono `404`, il listener locale
   sta servendo soltanto `/private` e va sostituito con il blocco completo qui
   sopra.
4. Solo dopo questi controlli, aggiungi contenuti in `content/*/private/`.

## 5. Aggiungere documenti

La sezione ora usa lo stesso stile della pagina Post. Crea un file Markdown in
`content/italian/private/` oppure in `content/english/private/`, ad esempio:

```md
---
title: "Nome del documento"
date: 2026-07-23
summary: "Breve descrizione mostrata nell'elenco."
tags: [personale]
---

Il contenuto del documento.
```

Non inserire file privati nelle altre sezioni: l'indice di ricerca pubblico,
il feed e la sitemap escludono automaticamente solo la sezione `private`.
