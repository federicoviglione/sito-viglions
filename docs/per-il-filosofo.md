# Per Viglions — guida all'editing

Benvenuto, Federico. Questa è la tua guida per aggiornare il tuo sito in autonomia. Niente codice, niente terminale: tutto avviene nel browser attraverso un piccolo pannello di amministrazione.

Il sito è su https://sito-viglions.netlify.app (per ora usiamo il dominio gratuito di Netlify; quando attiveremo un dominio personalizzato cambierà solo l'indirizzo, non il funzionamento). Il pannello di amministrazione è su https://sito-viglions.netlify.app/admin/.

Se qualcosa qui sotto non è chiaro o smette di funzionare, scrivi ad Alberto (alby.ianna@gmail.com).

---

## 1. Accedere

1. Vai su https://sito-viglions.netlify.app/admin/.
2. Clicca **Sign in with GitHub** e autorizza con l'account GitHub che Alberto ha invitato al repository.

Una volta dentro vedrai l'interfaccia di **Sveltia CMS**: una barra laterale a sinistra con tutte le sezioni del sito (Site, Bio, News, Publications, Talks, Organized events) e un'area principale dove si modifica.

> Se compare un errore di autenticazione, esci (in alto a destra) e riaccedi. A volte Sveltia tiene in cache una sessione scaduta.

---

## 2. Modificare contenuti esistenti

Quasi tutto sul sito è già compilato a partire dal tuo CV. Per cambiare qualcosa:

1. Dalla barra laterale, clicca la sezione (es. **Publications**).
2. Vedrai l'elenco delle voci. Clicca quella da modificare.
3. Modifica i campi. Il pannello a destra mostra un'anteprima dal vivo.
4. Clicca **Save** (in alto a destra) quando hai finito.
5. Dopo qualche secondo, clicca **Publish**.

Il sito si ricostruisce da solo. Ricarica https://sito-viglions.netlify.app e dopo massimo 1–2 minuti vedrai le modifiche.

> **Cosa significano "Save" e "Publish":** Save memorizza una bozza che vedi solo tu nel CMS. Publish scrive la modifica sul sito pubblico. Trattandosi del tuo sito personale, puoi pubblicare direttamente — non c'è un flusso di approvazione.

---

## 3. Aggiungere nuovi contenuti

Il flusso è lo stesso per ogni sezione. Esempio: un nuovo talk.

1. **Talks** nella barra laterale → **New Talks** (in alto a destra).
2. Compila:
   - **Title** — titolo completo del talk
   - **Venue** — es. "Università di Bologna, Department of Philosophy"
   - **Location** — es. "Bologna, Italy" (facoltativo)
   - **Date** — scegli dal calendario
   - **Type** — invited, contributed, keynote, seminar o workshop
   - **URL** / **Slides URL** / **Video URL** — facoltativi
   - **Abstract** — facoltativo, qualche frase
3. **Save** → **Publish**.

Lo stesso flusso vale per **Publications**, **News** e **Organized events**. I campi obbligatori sono contrassegnati da un asterisco; il pannello non lascia salvare finché non sono compilati.

> **Le pubblicazioni compaiono sul sito sotto il titolo "Research"**, raggruppate automaticamente per tipo: Books, Journal articles, Book chapters, Edited volumes e così via. Basta impostare correttamente il campo **Type** e la voce finisce nel gruppo giusto.

> **Suggerimento — campi `order`:** Publications e Organized events hanno un campo **Order** facoltativo. I numeri più bassi compaiono prima *a parità di anno*. Lascialo al valore predefinito (99) a meno che tu non voglia forzare un ordine preciso.

---

## 4. Caricare il CV

Il sito ha un bottone **Download CV** nella sezione About che punta a `/files/cv.pdf`. Per sostituire il segnaposto con il tuo CV vero:

1. Dalla barra laterale, vai su **Site** → clicca la voce esistente.
2. Scorri fino al campo **CV PDF**.
3. Clicca l'area di caricamento (al momento mostra `/files/cv.pdf`).
4. Trascina il nuovo PDF, oppure clicca per sceglierlo dal computer.
5. Il file viene caricato — Sveltia lo rinomina e lo gestisce per te.
6. **Save** → **Publish**.

Il bottone in homepage ora punta al nuovo CV.

> **Nota sul nome del file:** il percorso `/files/cv.pdf` è referenziato in più punti, ma Sveltia gestisce la rinomina in modo trasparente. Puoi caricare `viglione-cv-2026.pdf` e funzionerà comunque.

---

## 5. Caricare una foto

La sezione About ha uno spazio per il ritratto accanto alla bio. Per caricarlo:

1. **Site** → voce esistente.
2. Campo **Photo** → carica.
3. Consigliato: JPG verticale, proporzioni circa 4:5 (es. 600×750 px), massimo ~500 KB. Sveltia lo comprime. Va bene anche una foto quadrata: viene ritagliata automaticamente, tenendo il volto in alto.
4. Facoltativo: campo **Photo credit** per il nome del fotografo.
5. **Save** → **Publish**.

Se lasci vuoto il campo Photo, la sezione About mostra solo il testo — nessuna immagine rotta.

> **Importante — usa il campo Photo, non il testo della bio.** Nell'editor di **Bio** c'è un pulsante per inserire immagini: se metti la foto lì, finisce *dentro* il testo, grande e sotto il paragrafo. Solo la foto caricata nel campo **Photo** di **Site** viene messa a fianco della bio sul computer (e sopra il testo sul telefono, dove non ci sarebbe spazio per affiancarla).

---

## 6. Cambiare l'aspetto del sito (Theme settings)

In fondo a **Site** → voce esistente c'è il pannello **Theme settings**. Qui puoi sperimentare in tranquillità — non si rompe niente, e ogni modifica è reversibile:

- **Palette** — lo schema colori complessivo (carta, testo e colore d'accento cambiano insieme). Il default è *Bianca granata* (carta bianca, accento granata); le alternative sono *Bordeaux*, *Blu editoriale*, *Foresta* e *Ambra*.
- **Show portrait photo in About** — disattiva la foto se preferisci solo testo.
- **Name size in the header** — compact / default / large.
- **Hidden sections** — le sezioni in questa lista esistono nel CMS ma non compaiono sul sito. **News e Organized events sono nascoste di default**; toglile dalla lista per farle apparire in homepage.
- **Hidden CV blocks in About** — nasconde i blocchi che stanno tra la bio e Research: *Academic positions*, *Education*, *Editorial roles*, *Memberships*, *Peer review*. Aggiungi alla lista quelli che non vuoi mostrare. I contenuti **restano salvati** nel CMS: se cambi idea basta toglierli dalla lista e ricompaiono, senza doverli riscrivere.
- **Section order** — trascina per riordinare le sezioni della homepage.

Come sempre: **Save** → **Publish**, aspetta un paio di minuti, ricarica.

---

## 7. Fissare una news in alto (pin)

Alcune news meritano di restare visibili anche dopo che la data è passata (es. un premio importante, un evento in arrivo che vuoi mettere in evidenza). Contrassegnale come **pinned**:

1. **News** → apri la voce.
2. Attiva l'interruttore **Pinned**.
3. **Save** → **Publish**.

Le voci pinned restano nella sezione News per sempre. Quelle non pinned spariscono da sole quando la data è più vecchia di ~6 mesi — la sezione si cura da sola.

> **Quando fare pin:** premi, borse, contratti per libri, posizioni in visita. **Quando non farlo:** talk di routine (compaiono comunque sotto Talks), seminari locali, post da blog.

> **Nota:** la sezione News è nascosta in homepage di default. Per mostrarla, togli "News" da **Hidden sections** nelle Theme settings (vedi sezione 6).

---

## 8. Cosa succede dopo aver cliccato Publish

Dietro le quinte:

1. Sveltia scrive la modifica nel repository GitHub (in silenzio — non lo vedi).
2. Netlify rileva la modifica e avvia una build (~30–60 secondi).
3. La nuova build sostituisce il sito pubblico.
4. Tempo totale da Publish alla pubblicazione: di solito 1–2 minuti.

Puoi continuare a lavorare nel CMS mentre una build è in corso — la modifica successiva si mette in coda.

---

## 9. Problemi — il sito non si aggiorna dopo 2 minuti

Nel 99% dei casi è una cache. Prova in questo ordine:

1. **Ricarica forzata:** Cmd-Shift-R (Mac) o Ctrl-F5 (Windows). Costringe il browser a scaricare la versione più recente.
2. **Finestra in incognito:** apri il sito in una finestra privata. Se lì vedi la versione nuova, era la cache del browser.
3. **Aspetta altri 5 minuti:** le code di build di Netlify a volte si allungano nelle ore di punta.
4. **Ancora niente?** Scrivi ad Alberto con: (a) cosa hai cambiato, (b) quando hai cliccato Publish, (c) uno screenshot del CMS con la modifica salvata. Controllerà il log di build su Netlify.

---

## 10. Dove vivono i contenuti

Tutto ciò che modifichi dal CMS è salvato come file di testo in un repository GitHub (`sito-viglions`). Non devi interagire con GitHub — se ne occupa Sveltia — ma saperlo significa che:

- **Non puoi perdere dati per sbaglio.** Ogni modifica è un commit Git; Alberto può ripristinare qualsiasi versione precedente.
- **Puoi esportare tutto il sito.** Se un giorno vorrai passare a un'altra piattaforma, tutti i contenuti sono in file Markdown e JSON leggibili.
- **Le bozze non sporcano il sito pubblico.** Un Save senza Publish resta una bozza non pubblicata, visibile solo nel CMS.

---

## 11. Riferimento rapido

| Attività | Sezione | Azione |
|------|---------|--------|
| Aggiornare bio / affiliazione | Site → voce | Modifica i campi → Save → Publish |
| Cambiare colori / sezioni visibili | Site → Theme settings | Scegli la palette, modifica le sezioni nascoste → Save → Publish |
| Nascondere posizioni, formazione, ecc. | Site → Theme settings → Hidden CV blocks | Aggiungi i blocchi da nascondere → Save → Publish |
| Aggiungere una pubblicazione | Publications → New | Compila i campi → Save → Publish |
| Aggiungere un talk | Talks → New | Compila i campi → Save → Publish |
| Aggiungere una news | News → New | Scegli il tipo (upcoming/recent/award/visit) → Save → Publish |
| Sostituire il CV | Site → CV PDF | Carica il nuovo PDF → Save → Publish |
| Cambiare la foto | Site → Photo | Carica la nuova immagine → Save → Publish |
| Evidenziare una news per sempre | News → voce | Attiva Pinned → Save → Publish |

---

È tutto. Il CMS è volutamente minimale: se ti accorgi di volere una funzione che non c'è, scrivi ad Alberto invece di arrangiarti con soluzioni di fortuna — probabilmente sono 10 minuti di lavoro per aggiungerla.
