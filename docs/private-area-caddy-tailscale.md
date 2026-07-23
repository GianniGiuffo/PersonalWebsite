# Area privata con Caddy e Tailscale

L'area privata del sito non usa password, account o JavaScript per autenticare.
Il sito pubblico resta su `tommasofrancescon.it`: l'ingresso `/private/`
reindirizza a una pagina informativa, mentre gli URL dei documenti privati
restituiscono `404`. Il Caddy del Raspberry ascolta anche su una porta pubblicata
solo su `127.0.0.1`; Tailscale Serve espone l'intero sito Hugo sulla porta HTTPS
dedicata `8443`, accessibile esclusivamente dal tailnet.

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

    # L'ingresso pubblico mostra le istruzioni, non i documenti.
    @privateEntry path /private /private/ /en/private /en/private/
    handle @privateEntry {
        redir /accesso-privato/ 302
    }

    # I documenti privati non sono mai disponibili sul dominio pubblico.
    @privateDocuments path /private/* /en/private/*
    handle @privateDocuments {
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

Sul server, aggiorna tutte le route Tailscale insieme. Lo script conserva
Nextcloud su `/` e Pi-hole su `/admin/` nella porta HTTPS standard `443`, e
pubblica l'intero sito Hugo sulla porta HTTPS `8443`:

```bash
cd /opt/raspberry-server
sudo bash scripts/configure-tailscale-serve.sh
sudo tailscale serve status
```

Il secondo comando mostra l'URL MagicDNS, con una forma simile a:

```text
https://nome-server.nome-tailnet.ts.net:8443
```

L'area privata si apre quindi a:

```text
https://nome-server.nome-tailnet.ts.net:8443/private/
```

Tailscale Serve è disponibile solo ai dispositivi autorizzati nel tailnet;
se condividi il tailnet con altre persone, limita ulteriormente l'endpoint con
le access policy di Tailscale.

## 3. Collega il lucchetto del sito

In `hugo.toml`, inserisci l'URL esatto restituito da `tailscale serve status`:

```toml
[params]
privateURL = 'https://nome-server.nome-tailnet.ts.net:8443/private/'
```

Il lucchetto apre prima la pagina pubblica `/accesso-privato/`. Il pulsante
presente nella pagina usa `privateURL` per raggiungere Tailscale. In questo modo
le istruzioni restano visibili anche quando Tailscale è spento o disconnesso.
Finché `privateURL` è vuoto il lucchetto rimane volutamente disabilitato.

## 4. Verifica

1. Da una rete senza Tailscale, `https://tommasofrancescon.it/private/` deve
   reindirizzare a `/accesso-privato/`, mentre un URL come
   `/private/primo-post/` deve restituire `404`.
2. Da un dispositivo connesso al tuo tailnet,
   `https://nome-server.nome-tailnet.ts.net:8443/private/` deve aprire l'area
   privata italiana.
3. Aprendo la pagina privata, le richieste a `/css/main.…css` devono restituire
   `200` nel pannello Network del browser. Se sono `404`, il listener locale
   sta servendo soltanto `/private` e va sostituito con il blocco completo qui
   sopra.
4. Solo dopo questi controlli, aggiungi contenuti in
   `content/italian/private/`.

## 5. Aggiungere documenti

La sezione ora usa lo stesso stile della pagina Post. Crea un file Markdown
soltanto in `content/italian/private/`, ad esempio:

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
