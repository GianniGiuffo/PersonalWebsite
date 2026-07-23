# Area privata con Caddy e Tailscale

L'area privata del sito non usa password, account o JavaScript per autenticare.
Il sito pubblico resta su `tommasofrancescon.it`; Caddy restituisce `404` per
le pagine private. Una seconda istanza Caddy, accessibile solo su `127.0.0.1`,
viene invece pubblicata da Tailscale Serve all'interno del tailnet.

> Configura prima Caddy e Tailscale, poi pubblica il deploy che contiene
> contenuti privati.

## 1. Caddy

Nel Caddyfile esistente, prima del `file_server` pubblico, aggiungi il primo
blocco `handle`. Sostituisci `/PERCORSO/DEL/SITO/PUBLIC` con la directory
effettivamente servita da Caddy.

```caddyfile
tommasofrancescon.it {
    root * /PERCORSO/DEL/SITO/PUBLIC
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
http://127.0.0.1:8081 {
    root * /PERCORSO/DEL/SITO/PUBLIC
    encode zstd gzip
    file_server
}
```

Se il blocco del dominio contiene già altri handler o proxy, integra i due
`handle` al suo interno mantenendo quello di `/private` prima del fallback.

Valida e ricarica senza interrompere Caddy:

```bash
sudo caddy validate --config /etc/caddy/Caddyfile --adapter caddyfile
sudo systemctl reload caddy
```

## 2. Tailscale Serve

Sul server, pubblica il listener locale nel tailnet:

```bash
sudo tailscale serve --bg --https=443 http://127.0.0.1:8081
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
3. Solo dopo questi due controlli, aggiungi contenuti in `content/*/private/`.
