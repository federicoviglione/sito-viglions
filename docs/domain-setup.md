# Setup dominio `federicoviglione.com`

Guida operativa per acquistare il dominio, collegarlo al sito Netlify e (opzionalmente) configurare una casella email professionale `@federicoviglione.com` con **Google Workspace**.

> Da seguire **una sola volta**, in sequenza. Serve: carta di pagamento, accesso admin a Netlify del sito, circa 40–60 minuti (più 1–24 h di attesa per la propagazione DNS).

---

## Panoramica

Alla fine della guida avremo:

- Dominio `federicoviglione.com` registrato a nome di Federico, WHOIS privato, auto-rinnovo attivo.
- DNS gestiti su **Cloudflare** (gratis, veloci, con CNAME flattening per l'apex).
- Sito Netlify raggiungibile su `https://federicoviglione.com` con SSL automatico (Let's Encrypt).
- Record DNS difensivi: `CAA` (solo Let's Encrypt può emettere TLS) e DNSSEC attivo.
- **Email lockdown** anti-spoofing: null MX + SPF restrittivo + DMARC reject. **Nessuna casella email attiva** sul dominio in questa fase — l'hardening previene comunque lo spoofing.

> **Email dedicata (opzionale, in futuro):** se un giorno servirà una casella professionale `@federicoviglione.com`, la Sezione 4 ha il runbook completo per Google Workspace. Per ora si salta — il dominio resta "no-mail" e Federico continua a usare la casella istituzionale (`@unimi.it` / `@unito.it`).

---

## 1. Acquisto del dominio

### Registrar consigliato: Cloudflare Registrar

Per il TLD `.com` la scelta migliore è **Cloudflare Registrar**: rivende i domini al prezzo netto del registry (~9.77 $/anno per `.com`, senza markup), WHOIS privacy inclusa gratis, nessun upselling. Vincolo: i DNS devono essere gestiti su Cloudflare (cosa che faremo comunque nella Sezione 2.2).

- Prezzo: ~9.77 $/anno per `.com`.
- WHOIS privacy inclusa gratis, sempre.
- Auto-rinnovo onesto: prezzo di rinnovo identico a quello di registrazione.
- Setup integrato con Cloudflare DNS (un click, niente delega manuale dei nameserver).
- Link: <https://dash.cloudflare.com/?to=/:account/domains/register/federicoviglione.com>

> **Alternative accettabili** se Cloudflare avesse problemi: Porkbun (~10 $/anno, WHOIS privacy gratis, UX moderna), Namecheap (~13 $/anno, WHOIS privacy il primo anno). **Da evitare:** GoDaddy (upselling aggressivo, rinnovi cari).

### Checklist in fase di checkout

- [ ] **Nome esatto:** `federicoviglione.com` (verifica due volte: nessun typo nel cognome — `viglione`, una sola "g").
- [ ] **Durata:** registra per **2 anni**. Riduce il rischio di dimenticanze e Google dà un micro-segnale di trust ai domini con registrazione più lunga.
- [ ] **WHOIS privacy:** ON (automatica su Cloudflare).
- [ ] **Auto-renewal:** ON + carta con scadenza futura.
- [ ] **DNSSEC:** lo abiliteremo dopo aver configurato i DNS (Sezione 3.3).

> **Nota su Cloudflare Registrar:** quando registri un dominio direttamente su Cloudflare, i DNS vengono creati automaticamente sull'account Cloudflare in uso. Salta dunque la Sezione 2.2 (delega nameserver) — i nameserver sono già impostati. Aggiungi solo i record DNS della Sezione 2.2 (tabella CNAME).

---

## 2. Collegamento a Netlify

### 2.1 Aggiungi il custom domain su Netlify

1. Netlify dashboard → progetto del sito (`sito-viglions`) → **Domain management** (o **Site configuration → Domains**).
2. **Add a domain** → inserisci `federicoviglione.com` → Verify.
3. Netlify chiederà se sei il proprietario: conferma. A questo punto comparirà nella lista dei domini del sito, con stato "Awaiting External DNS".
4. **Non** cliccare "Set up Netlify DNS" — gestiamo i DNS su Cloudflare.

> **Perché non Netlify DNS:** Cloudflare ha analytics migliori, nameserver più veloci, edge DDoS protection gratuito e supporta correttamente i record CAA/DMARC/DKIM che ci servono per l'email. Netlify DNS è più semplice ma più limitato.

### 2.2 Configura i DNS su Cloudflare

Se hai registrato il dominio su Cloudflare Registrar, i nameserver sono già attivi. Se hai usato un altro registrar (es. Porkbun, Namecheap), prima delega i nameserver a Cloudflare:

1. **Cloudflare dashboard** (<https://dash.cloudflare.com>) → **Add a site** → `federicoviglione.com` → **Free plan**.
2. Cloudflare assegna due nameserver (es. `kim.ns.cloudflare.com`, `lee.ns.cloudflare.com`). Copiali.
3. Dashboard del tuo registrar → `federicoviglione.com` → **Authoritative Nameservers** → sostituisci i nameserver di default con quelli di Cloudflare.
4. Attendi che Cloudflare rilevi il cambio (da 15 min a 24 h — tipicamente 30 min). Ti arriverà un'email di conferma "Your site is now active on Cloudflare".

Una volta che il dominio è attivo su Cloudflare, aggiungi questi record (**DNS → Records → Add record**):

| Type  | Name | Target                             | Proxy status   | TTL  |
|-------|------|------------------------------------|----------------|------|
| CNAME | `@`  | `apex-loadbalancer.netlify.com`    | **DNS only** (grigio) | Auto |
| CNAME | `www`| `apex-loadbalancer.netlify.com`    | **DNS only** (grigio) | Auto |

- Entrambi i record puntano allo stesso endpoint `apex-loadbalancer.netlify.com`. Netlify identifica il progetto corretto dal `Host` header della richiesta HTTP, non dal target DNS — quindi `apex-loadbalancer` è sufficiente.
- Se il registrar ha importato record di parking (CNAME `*`, CNAME `www`, A `@` verso IP del registrar), **eliminali tutti** prima di aggiungere quelli qui sopra.
- Cloudflare supporta **CNAME sull'apex** (cosiddetto *CNAME flattening*): tecnicamente sarebbe illegale nel DNS standard, ma Cloudflare lo risolve trasparentemente. Questa è la ragione principale per cui usiamo Cloudflare.
- **Proxy status = DNS only** (nuvoletta grigia, NON arancione). Se lasci il proxy ON, Cloudflare intercetta le richieste e Netlify non riesce a emettere il certificato Let's Encrypt. Tecnicamente è possibile un setup con proxy ON + SSL "Full (strict)" + Origin Certificate, ma è complicato e per un sito statico non dà benefici reali.

### 2.3 Attendi la propagazione e abilita HTTPS

1. Aspetta 5–30 minuti (tipicamente rapido dopo il cambio nameserver).
2. Dal tuo terminale:
   ```bash
   dig +short federicoviglione.com
   dig +short www.federicoviglione.com
   ```
   Deve rispondere con un IP di Netlify (o il CNAME `apex-loadbalancer.netlify.com`).
3. Netlify dashboard → **Domain management** → il dominio dovrebbe passare a **Netlify DNS configured** o equivalente.
4. Clicca **Verify DNS configuration** se serve. Netlify richiederà il certificato a Let's Encrypt (5–15 min).
5. Una volta emesso, abilita **Force HTTPS** (tutto il traffico HTTP viene rediretto a HTTPS).
6. Imposta il **primary domain**: scegli `federicoviglione.com` (apex, senza `www`). Il `www` farà redirect 301 all'apex.

> **Perché apex e non www:** per un sito accademico personale l'URL più corto è più pulito (firma email, profili istituzionali, citazioni). Tecnicamente `www` è storicamente più robusto per CDN, ma nel 2024+ questa distinzione conta poco per siti statici.

---

## 3. Hardening DNS

### 3.1 Record CAA

Il record **CAA** (Certification Authority Authorization) dice al mondo quali CA possono emettere certificati TLS per il tuo dominio. Se un attaccante riesce a convincere una CA diversa a emettere un certificato fraudolento, il CAA blocca l'emissione lato CA.

Aggiungi su Cloudflare DNS:

| Type | Name | Value                                                    | TTL  |
|------|------|----------------------------------------------------------|------|
| CAA  | `@`  | `0 issue "letsencrypt.org"`                              | Auto |
| CAA  | `@`  | `0 issuewild "letsencrypt.org"`                          | Auto |
| CAA  | `@`  | `0 iodef "mailto:alby.ianna@gmail.com"`                  | Auto |

- Le prime due autorizzano Let's Encrypt (che Netlify usa) per certificati normali e wildcard.
- `iodef` è un indirizzo dove le CA possono segnalare tentativi falliti. Usiamo la casella di Alberto (admin tecnico del dominio) — i report CAA sono rarissimi ma se arrivano è utile che finiscano a chi sa interpretarli.
- **Non aggiungere mai altre CA** (es. Google Trust Services) a meno che non ti servano: più CA autorizzate = superficie d'attacco maggiore.

### 3.2 Email lockdown (anti-spoofing, nessuna casella attiva)

Anche se non ospitiamo email sul dominio, **un attaccante potrebbe inviare email falsificate** con mittente `@federicoviglione.com` (phishing a colleghi/dipartimenti, richieste di referenze false, danni reputazionali). Per bloccare questo scenario aggiungiamo tre record che dichiarano ufficialmente: *"nessuno può inviare né ricevere email per questo dominio — scartate qualsiasi messaggio che dica il contrario"*.

Aggiungi su Cloudflare DNS:

**Null MX** (RFC 7505) — "nessun server accetta email per questo dominio":

| Type | Name | Priority | Target | TTL  |
|------|------|----------|--------|------|
| MX   | `@`  | 0        | `.`    | Auto |

Il target è letteralmente un punto `.` (la root del DNS). È lo standard per dire "MX intenzionalmente vuoto" — i server di posta conformi non tentano nemmeno la consegna.

**Null SPF** — "nessun server è autorizzato a inviare email da questo dominio":

| Type | Name | Value             | TTL  |
|------|------|-------------------|------|
| TXT  | `@`  | `v=spf1 -all`     | Auto |

`-all` = hardfail. Tutto ciò che non è esplicitamente autorizzato (e qui non c'è nessuna autorizzazione) viene marcato come forgeria.

**DMARC reject** — "qualsiasi email che dichiara di venire da qui va rifiutata":

| Type | Name      | Value                                                                     | TTL  |
|------|-----------|---------------------------------------------------------------------------|------|
| TXT  | `_dmarc`  | `v=DMARC1; p=reject; rua=mailto:alby.ianna@gmail.com; adkim=s; aspf=s`    | Auto |

- `p=reject` — rigetto totale (rigetto alla SMTP, non "spam folder")
- `adkim=s` / `aspf=s` — allineamento strict (richiede match esatto del dominio, non "organizational domain")
- `rua=mailto:...` — Alberto riceve i report aggregati in caso di tentativi di spoofing (arrivano come XML giornalieri da Gmail/Microsoft/ecc., utili per monitoraggio)

> **Se in futuro passerai a email dedicata** (Sezione 4), questi tre record vanno **tutti sostituiti** con i valori del provider scelto. Le due configurazioni sono mutuamente esclusive: una dice "nessuna email qui", l'altra dice "email legittima, ecco come autenticarla". Mai tenerle attive insieme — romperebbero entrambe.

### 3.3 DNSSEC

DNSSEC firma crittograficamente le risposte DNS, impedendo DNS spoofing (cache poisoning). Setup:

1. **Cloudflare DNS → DNS → Settings → DNSSEC → Enable DNSSEC.** Cloudflare genera un record DS.
2. Se il registrar è Cloudflare: la firma DS viene pubblicata automaticamente — non devi fare nulla in più.
3. Se il registrar è esterno (Porkbun/Namecheap/...): copia il record DS dalla dashboard Cloudflare e incollalo nella sezione DNSSEC del registrar.
4. Verifica dopo 1 h: <https://dnssec-analyzer.verisignlabs.com/federicoviglione.com> → tutto verde.

---

## 4. Email dedicata con Google Workspace (OPZIONALE — solo se in futuro servirà)

> **Puoi saltare completamente le Sezioni 4, 5 e 6** se, come deciso inizialmente, non serve una casella email sul dominio. I record di email lockdown (Sezione 3.2) bastano per evitare lo spoofing e Federico continua a usare la casella istituzionale.
>
> Segui da qui in avanti **solo** quando Federico vorrà una casella `@federicoviglione.com`. Prima dei passi sotto, **rimuovi i tre record di email lockdown** (null MX, null SPF, DMARC reject): altrimenti la policy `p=reject` entra in conflitto con i nuovi record Google Workspace e l'email esce inutilizzabile.

1. Vai su <https://workspace.google.com> → **Get started**.
2. Piano consigliato: **Business Starter** (6 €/utente/mese, 30 GB/utente, Gmail + Drive + Calendar + Meet). Per un solo utente (Federico) è il minimo e basta.
3. Inserisci:
   - Nome azienda: "Federico Viglione" (o simile)
   - Dimensione: "Solo io"
   - Paese: Italia
4. Dominio: **"Yes, I have a domain"** → `federicoviglione.com`.
5. Crea il primo account admin: `federico@federicoviglione.com` (password forte, salvala in un password manager).
6. Completa il flusso di pagamento.

### 4.1 Verifica dominio

Google Workspace chiede di dimostrare che il dominio è tuo, prima di attivare l'email. Due modi:

- **TXT record** (più rapido): Google fornisce un valore tipo `google-site-verification=ABC123...`. Aggiungilo come TXT su Cloudflare con Name=`@`.
- MX record: Google imposta lui gli MX quando verifichi. Preferisco il TXT perché è esplicito.

Dopo il dig di verifica, Google marca il dominio come verificato. Il record TXT di verifica puoi **lasciarlo**: non fa danno e Google potrebbe ri-verificare in futuro.

---

## 5. Google Workspace — record DNS email

Questi sono i record che fanno *funzionare* l'email. Vanno aggiunti su Cloudflare DNS. I valori qui sotto sono quelli ufficiali di Google Workspace al 2024+.

### 5.1 MX (ricezione email)

Google ha semplificato a **un singolo MX** (il vecchio setup a 5 MX con `ASPMX`/`ALT1-4` funziona ancora ma non serve più).

| Type | Name | Priority | Target                | TTL  |
|------|------|----------|-----------------------|------|
| MX   | `@`  | 1        | `smtp.google.com.`    | Auto |

> **Cosa fa:** dice ai server del mondo "le email per `@federicoviglione.com` le consegni a `smtp.google.com`". Senza questo, nessuna email arriva.

### 5.2 SPF (mittenti autorizzati)

| Type | Name | Value                                 | TTL  |
|------|------|---------------------------------------|------|
| TXT  | `@`  | `v=spf1 include:_spf.google.com ~all` | Auto |

> **Cosa fa:** dichiara che solo i server Google possono inviare email con mittente `@federicoviglione.com`. `~all` = "softfail" (email da altri server sospette ma non bloccate). Dopo qualche settimana puoi passare a `-all` (hardfail).
>
> **Attenzione:** un solo record SPF per dominio. Se in futuro aggiungi Mailchimp/Brevo/altri, vanno messi nello **stesso** TXT con più `include:`, non in un secondo record. Esempio: `v=spf1 include:_spf.google.com include:mailgun.org ~all`.

### 5.3 DKIM (firma crittografica)

La chiave DKIM la genera Google, non la scegli tu.

1. **Google Workspace Admin Console** (<https://admin.google.com>) → **Apps → Google Workspace → Gmail**.
2. **Authenticate email** → **Generate new record** → **2048-bit** (scelta di default).
3. Copia il valore generato: comincia con `v=DKIM1; k=rsa; p=MIGfMA0GCS...` (lunghissimo).
4. Aggiungi su Cloudflare DNS:

| Type | Name                          | Value                        | TTL  |
|------|-------------------------------|------------------------------|------|
| TXT  | `google._domainkey`           | `<il valore copiato>`        | Auto |

> **Nota su Cloudflare e record lunghi:** la UI di Cloudflare accetta valori TXT fino a ~2048 caratteri. Incolla tutto in una sola riga, senza spazi o interruzioni. Cloudflare gestisce automaticamente lo *string-chunking* del protocollo DNS.

5. Torna in Google Admin → **Start authentication** (Google verifica il DNS e attiva la firma).
6. Aspetta ~1 h (fino a 48 h) per la propagazione completa.

### 5.4 DMARC (policy anti-spoofing)

| Type | Name      | Value                                                                                         | TTL  |
|------|-----------|-----------------------------------------------------------------------------------------------|------|
| TXT  | `_dmarc`  | `v=DMARC1; p=none; rua=mailto:federico@federicoviglione.com; pct=100; adkim=r; aspf=r`        | Auto |

> **Cosa fa:** dice ai server riceventi cosa fare se un'email *dichiara* di venire da `@federicoviglione.com` ma fallisce SPF e/o DKIM.
>
> **Parti da `p=none`** (solo monitoraggio) per 2–4 settimane. Ricevi i report aggregati (XML via email, parsabili con <https://dmarcian.com> o <https://postmarkapp.com/dmarc>). Una volta verificato che nessun mittente legittimo fallisce, alza a `p=quarantine` (email sospette → spam), poi a `p=reject` (email sospette → rifiutate). Il percorso ideale finale è `p=reject`.
>
> **Dal 2024 Gmail e Yahoo scartano** email da domini senza almeno SPF+DKIM+DMARC=none. Senza DMARC, le email di Federico finirebbero in spam.

---

## 6. Alias, catch-all, webmail

### 6.1 Alias

Google Workspace dà **fino a 30 alias gratis** per account utente. Configura da **Admin Console → Users → federico@... → User information → Alternate email addresses**.

Suggeriti per un sito accademico (tutti inoltrano alla casella principale):

- `info@federicoviglione.com` — contatti generici pubblicati sul sito
- `contact@federicoviglione.com` — variante neutra, comoda per firme email
- `f.viglione@federicoviglione.com` — formato istituzionale, comodo per submission a riviste

In Gmail puoi rispondere *da* un alias selezionandolo nel campo "From" del messaggio.

### 6.2 Catch-all (opzionale)

Se vuoi che **qualunque** email a `qualunquecosa@federicoviglione.com` arrivi comunque:

- Admin Console → **Apps → Gmail → Default routing** → Add setting → "if envelope recipient matches `@federicoviglione.com`" → forward to `federico@federicoviglione.com`.
- **Sconsigliato** se il dominio viene pubblicato ovunque: diventa un magnete per spam. Meglio configurare alias specifici.

### 6.3 Webmail e app

- Webmail: <https://mail.google.com> (login con `federico@federicoviglione.com`).
- App mobile Gmail (iOS/Android): aggiungi account Google con le credenziali del dominio.
- Nessun IMAP/SMTP manuale da configurare — l'account si comporta come un account Gmail qualsiasi.

---

## 7. Verifica end-to-end

Al termine, esegui questa checklist. Tutti i controlli devono passare.

### 7.1 DNS sito

```bash
dig +short federicoviglione.com
dig +short www.federicoviglione.com
```
Atteso: IP Netlify o CNAME `apex-loadbalancer.netlify.com`.

### 7.2 HTTPS e redirect

```bash
curl -I https://federicoviglione.com
# → HTTP/2 200

curl -I http://federicoviglione.com
# → 301 redirect verso https://federicoviglione.com

curl -I https://www.federicoviglione.com
# → 301 redirect verso https://federicoviglione.com
```

SSL grade: <https://www.ssllabs.com/ssltest/analyze.html?d=federicoviglione.com> → grade **A** o **A+**.

### 7.3 Email lockdown (anti-spoofing)

Con il setup "no-mail" di questa fase, verifichiamo che il lockdown sia attivo:

```bash
dig MX federicoviglione.com +short
# → deve rispondere "0 ." (null MX)

dig TXT federicoviglione.com +short
# → deve contenere "v=spf1 -all"

dig TXT _dmarc.federicoviglione.com +short
# → deve contenere "v=DMARC1; p=reject; ..."
```

Test che lo spoofing sia effettivamente bloccato:

1. Vai su <https://www.learndmarc.com> → inserisci `federicoviglione.com`.
2. Atteso: **SPF → -all (hardfail)**, **DMARC → p=reject**. Questo è lo stato desiderato per un dominio senza email.
3. In alternativa, prova a inviarti un'email spoofed con tool come <https://emkei.cz/> con mittente falso `*@federicoviglione.com`: dovrebbe essere rifiutata dai principali provider (Gmail, Outlook) o finire direttamente nel bin "rejected".

> **Se hai completato le Sezioni 4–6 (email dedicata con Google Workspace)** questo test **non si applica** — sei in configurazione email attiva. Verifica invece con <https://www.mail-tester.com>: mandi un'email dalla casella nuova all'indirizzo di test, obiettivo 10/10 su SPF + DKIM + DMARC.

### 7.4 Admin Sveltia CMS

- <https://federicoviglione.com/admin/> carica il pannello Sveltia.
- Login con Netlify Identity di Federico funziona come prima.
- Nuova pubblicazione → salvataggio → deploy automatico in ~30 s.

### 7.5 DNSSEC

- <https://dnssec-analyzer.verisignlabs.com/federicoviglione.com> → tutti i check verdi.

---

## 8. Appendice — cambiare provider email in futuro

Se un giorno Federico vorrà lasciare Google Workspace, i record DNS da sostituire sono **solo questi quattro** (MX, SPF, DKIM, DMARC). Il resto della configurazione (dominio, Netlify, CAA, DNSSEC) non si tocca.

Valori rapidi per gli altri provider più comuni:

**Fastmail**
- MX: `in1-smtp.messagingengine.com.` (prio 10), `in2-smtp.messagingengine.com.` (prio 20)
- SPF: `v=spf1 include:spf.messagingengine.com ?all`
- DKIM: 3 CNAME (`fm1._domainkey`, `fm2._domainkey`, `fm3._domainkey` → `fm1.federicoviglione.com.dkim.fmhosted.com` ecc.)

**Zoho**
- MX: `mx.zoho.eu.` (prio 10), `mx2.zoho.eu.` (prio 20), `mx3.zoho.eu.` (prio 50)
- SPF: `v=spf1 include:zoho.eu ~all`
- DKIM: generato nel pannello Zoho Mail Admin

Per i valori aggiornati, la documentazione ufficiale del provider è sempre la fonte di verità — non copiare valori da guide vecchie.

---

## Appunti finali

- **Tempi realistici:** acquisto dominio + config Netlify + hardening DNS (incluso email lockdown) = circa 45–60 min di lavoro + 15–30 min di propagazione. La config email dedicata (Sezioni 4–6, opzionale) aggiunge 1–2 h + attesa propagazione DKIM fino a 48 h.
- **Costi ricorrenti:** ~10 $/anno (solo dominio, su Cloudflare Registrar) nella configurazione attuale. Se un giorno si aggiungerà Google Workspace Business Starter: +72 €/anno, totale ~**80 €/anno**.
- **Backup:** prima di eliminare/sostituire qualunque record DNS, fai uno screenshot della zona completa su Cloudflare. Tornare indietro da un errore è molto più veloce se hai la foto di "com'era prima".
- **Passaggio a email dedicata in futuro:** quando deciderete di aggiungere una casella, **rimuovi prima** i tre record di email lockdown (null MX `0 .`, SPF `-all`, DMARC `p=reject`) **prima** di applicare i record Google Workspace. Sovrapporre le due configurazioni rompe entrambe (la policy `p=reject` farebbe rifiutare anche le email legittime di Gmail).
- **Record TXT Google di verifica**: rilevante solo se completata la Sezione 4. Non toccarlo dopo il setup — Google potrebbe ri-verificare il dominio in futuro.
