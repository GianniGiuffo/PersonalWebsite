# Controllo di sicurezza del 22 ottobre 2026

## Avviso PHP del 21 ottobre

L'[avviso ufficiale PHP](https://www.php.net/archive/2026.php#2026-10-21-5)
descrive CVE-2026-109618 e CVE-2026-109619: errori nella gestione della memoria
del motore PHP che possono consentire esecuzione di codice senza autenticazione.
Le versioni correttive sono 8.5.12, 8.4.27, 8.3.36 e 8.2.35, oppure i pacchetti
con patch in backport forniti dal distributore. Aggiornare il solo codice di un
sito PHP non corregge il motore.

Nel repository non sono presenti sorgenti PHP, Composer, PHP-FPM o configurazioni
FastCGI. Il sito usa Hugo, JavaScript nel browser e Tailwind per generare file
statici. La configurazione Caddy documentata usa `file_server`: questo progetto
non richiede PHP e non presenta il percorso di attacco descritto nell'avviso.

## Problemi corretti

- **Dipendenze di build:** l'audit iniziale segnalava otto pacchetti coinvolti
  in tre advisory: [braces](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm),
  [source-map-js](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) e
  [postcss-selector-parser](https://github.com/advisories/GHSA-rj75-hqrm-r3gf).
  Sono problemi di esaurimento delle risorse negli strumenti di sviluppo/build,
  non esecuzione PHP sul sito pubblico. Tailwind è stato aggiornato a 4.3.3;
  due override mirati usano `@parcel/watcher` 2.6.0 (senza la dipendenza vulnerabile
  da braces) e `postcss-selector-parser` 7.1.7. Il lockfile include
  `source-map-js` 1.2.2. Audit finale: zero vulnerabilità segnalate.
- **Metadati privati negli indici pubblici:** un documento sotto `/private/`
  con tag/categorie poteva pubblicare titolo, anteprima e collegamento attraverso
  le tassonomie Hugo, non coperte dal blocco Caddy su `/private/*`.
  Il problema è stato riprodotto con contenuti fittizi. I template ora filtrano
  documenti privati, termini senza documenti pubblici e relativi feed/sitemap.
  Le pagine dei termini esclusivamente privati non contengono metadati né link;
  Hugo può comunque creare file vuoti per questi percorsi.
  Anche i collegamenti di traduzione pubblici escludono pagine private.
  La sezione privata conserva la navigazione e genera soltanto HTML.

## Verifiche

- `npm audit`: zero vulnerabilità segnalate dopo gli aggiornamenti.
- `npm test`: build isolata con documenti italiani e inglesi, tag privati,
  tag condivisi, categorie e associazioni di traduzione tra pubblico e privato.
  Controlla tutti gli HTML, XML e JSON pubblici per eventuali divulgazioni e
  verifica che navigazione privata e tag pubblici funzionino ancora.
  Prima della correzione il test rilevava una divulgazione in `categories/index.html`.
- Build Hugo di produzione completata con minificazione e nuova toolchain.
- XML della build validati e ricezione di eventi del watcher nativo verificata.
- Revisione dei template, degli shortcode, del JavaScript del sito e delle
  configurazioni versionate. Non sono stati individuati altri problemi concreti
  sfruttabili da input di un visitatore nel codice esaminato.

## Limiti e pubblicazione

La verifica riguarda questo repository e le build locali. Le modifiche non
sono state pubblicate sul server. Per evitare di mantenere vecchi indici,
distribuire una build pulita e rimuovere dal deploy i file obsoleti.

Le richieste HTTPS di verifica al dominio pubblico non sono riuscite a completare
la connessione TLS da questo ambiente: non è stato possibile verificare dal vivo
redirect e blocchi Caddy. Questo esito non dimostra un problema del certificato
o del server.

Non sono disponibili qui la configurazione effettiva di produzione, l'inventario
dei container, le versioni degli interpreti o i log del server. La documentazione
menziona Nextcloud e il repository separato `PiServer`: Nextcloud utilizza PHP
e richiede una verifica separata del PHP effettivamente usato dal servizio,
compreso l'aggiornamento e il riavvio dei processi/container interessati.
L'assenza di PHP in questo sito statico non certifica gli altri servizi dello
stesso server. Non sono stati eseguiti exploit o test invasivi.
