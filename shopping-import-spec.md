# CSV Importspecifikation for shopping.csv

Denne fil beskriver formatet for `shopping.csv` og de vigtigste felter til din SaaS-import.

## Filformat
- Separator: semikolon (`;`)
- Encoding: UTF-8 (med mulig BOM)
- Antal kolonner: 21
- Der er ingen header-række; første linje er data
- Alle rækker er vigtige, fordi hver linje repræsenterer en separat post

## Kolonnebeskrivelser
1. `Category`
2. `Subcategory`
3. `Type`
4. `Title`
5. `ProductDetails`
6. `ProductCode`
7. `ShortDescription`
8. `LongDescription`
9. `Usage`
10. `Notes`
11. `PackOrQty`
12. `Countries`
13. `BenefitStatement`
14. `LinkText`
15. `UnitPrice`
16. `Quantity`
17. `TotalPrice`
18. `OtherValue`
19. `Validation`
20. `CountryCodes`
21. `DonationMessage`

## Anbefalet importkode (Python)
```python
import pandas as pd

cols = [
    "Category",
    "Subcategory",
    "Type",
    "Title",
    "ProductDetails",
    "ProductCode",
    "ShortDescription",
    "LongDescription",
    "Usage",
    "Notes",
    "PackOrQty",
    "Countries",
    "BenefitStatement",
    "LinkText",
    "UnitPrice",
    "Quantity",
    "TotalPrice",
    "OtherValue",
    "Validation",
    "CountryCodes",
    "DonationMessage",
]

df = pd.read_csv("shopping.csv", sep=";", header=None, encoding="utf-8")
df.columns = cols
```

## Vigtigste felter for visning og import
- `Category`
- `Subcategory`
- `Type`
- `Title`
- `ProductDetails`
- `ProductCode`
- `ShortDescription`
- `LongDescription`
- `Countries`
- `UnitPrice`
- `Quantity`
- `TotalPrice`
- `Validation`
- `DonationMessage`

## Bemærkninger
- Forsøg at bevare alle 21 kolonner i importen, da data er homogent fordelt
- Nogle felter indeholder linjeskift og længere tekst, så brug en parser, der kan håndtere tekstfelter korrekt
- Hvis du kun skal vise en oversigt, så brug `Title`, `Category`, `UnitPrice`, `TotalPrice`, `ShortDescription` og `Countries`

## Brug til donation-beregning
Du kan bruge dataene til at beregne, hvad et givent beløb i kroner kan købe i MSF.

- `UnitPrice` er prisen for én enhed i euro.
- `Quantity` viser, hvor mange enheder der indgår i pakken eller eksemplet.
- `TotalPrice` er det samlede beløb i euro for den angivne mængde i posten.
- `DonationMessage` er en beskrivelse, der kan vises direkte til brugeren.

### Typiske beregninger
1. Hvis du vil vise, hvad et beløb kan købe:
   - omregn brugerens beløb i kroner til euro med en aktuel valutakurs
   - find produkter hvor `UnitPrice` eller `TotalPrice` ligger under det omregnede beløb
   - vis `Title`, `DonationMessage`, `UnitPrice`, `Quantity` og `Countries`

2. Hvis du vil vise, hvor meget du kan få for en specifik pris:
   - brug `UnitPrice` til at beregne antal enheder: `antal = beløb_euro / UnitPrice`
   - hvis der er en `Quantity`, kan du vurdere, hvor mange pakker eller enheder brugeren får

### Eksempel
- Brugeren indtaster 500 kr.
- Antag valutakurs 1 EUR = 7,50 DKK → beløb_euro = 500 / 7,50 = 66,67 EUR
- Vælg produkter med `TotalPrice` ≤ 66,67 EUR eller `UnitPrice` ≤ 66,67 EUR
- Vis f.eks. `Title`, `DonationMessage`, `UnitPrice`, `Quantity`, `TotalPrice` og `Countries`

### Vigtige felter i UI
- `Title` (produktnavn)
- `DonationMessage` (kort forklaring/produktbeskrivelse)
- `UnitPrice` (enhedspris)
- `Quantity` (antal enheder eller pakker)
- `TotalPrice` (samlet pris for posten)
- `Countries` (hvor det bruges)
- `BenefitStatement` (hvad donationen gør)

### Prioriterede værdier til visning
Når formålet er at vise, hvad en donation kan købe, er de vigtigste elementer:
- `Title`: produktets navn
- `DonationMessage` eller `ShortDescription`: beskrivelse af formålet
- `UnitPrice`: pris pr. enhed
- `Quantity`: antal enheder i tilbuddet
- `TotalPrice`: pris for hele tilbuddet

## Valutakonvertering
- Brugeren kan indtaste beløb i danske kroner (DKK).
- Konverter til euro med en aktuel kurs: `beløb_euro = beløb_dkk / kurs_dkk_per_eur`.
- Hvis du også vil vise returværdien i kroner for et produkt, kan du beregne: `pris_dkk = pris_eur * kurs_dkk_per_eur`.
- Ved visning af `UnitPrice` og `TotalPrice` kan du derfor både vise EUR og DKK.

## Datalagring og upload
- Gem dine importerede poster i en simpel database eller fil, så appen kan huske dem mellem genindlæsninger.
- For en lille app er `SQLite` et godt valg: det kræver ingen serveropsætning og kan køre i samme app.
- Alternativt kan du gemme poster i JSON, hvis det er en meget lille løsning.
- Hver post skal gemmes som en række med alle de 21 felter plus beregnede felter som `UnitPriceEUR`, `UnitPriceDKK`, `TotalPriceEUR`, `TotalPriceDKK` og `search_text`.

### Uploadfunktion
- Tilføj en upload-knap i UI, der accepterer CSV-filer.
- Backend kan modtage uploaden og parsere filen med semikolon-separator og UTF-8.
- Når CSV er læst, indsætter du posterne i din database og returnerer dem til frontend.

### Upload-rute (eksempel)
- HTTP POST `/upload` med `multipart/form-data`
- Inputnavn: `file`
- Backend-parsing:
  1. læs filens binære data
  2. decode til `utf-8`
  3. parse med `;` separator og `header=None`
  4. valider at hver række har 21 kolonner
  5. gem i databasen
  6. returner antallet af importerede poster

### Mulig backend-arkitektur
- **Python / FastAPI**
  - upload-endpoint med `UploadFile`
  - gem data i SQLite med `sqlalchemy` eller `sqlite3`
- **Node.js / Express**
  - upload med `multer`
  - gem i SQLite eller JSON-fil

### UI: upload-knap og tabel
- Tilføj en upload-knap, der accepterer `.csv`-filer.
- Efter upload skal data vises i en tabel, hvor hver CSV-linje er en række.
- Tabellen kan indeholde kolonner som:
  - `Title`
  - `Category`
  - `Type`
  - `UnitPrice` (EUR og DKK)
  - `Quantity`
  - `TotalPrice` (EUR og DKK)
  - `Countries`
  - `DonationMessage`
  - status for manglende data
- Hver række skal være klikbar eller have en fjern-knap, så brugeren kan slette rækker, der ikke skal gemmes.

### Datavalidering i tabel
- Marker rækker med manglende eller ugyldige værdier:
  - hvis `UnitPrice` mangler eller ikke kan parses
  - hvis `TotalPrice` mangler eller ikke kan parses
  - hvis vigtige felter som `Title` eller `DonationMessage` mangler
- Vis en tydelig statuskolonne i tabellen med fx `OK`, `Manglende data` eller `Ugyldig pris`.
- Giv brugeren mulighed for at fjerne rækker, der ikke kan importeres.

### Fjern rækker uden data
- Hvis en række er tom eller næsten tom, vis en handling som “Fjern række”.
- Efter fjernelse skal tabellen opdatere med de resterende gyldige data.
- Hvis ingen data er tilbage, skal tabellen vise en venlig besked: “Ingen importdata. Upload en ny CSV-fil.”

### Opdatering efter upload
- Når backend har accepteret uploaden, send de parsed rækker tilbage til frontend.
- Frontend viser tabellen og lader brugeren gennemgå data inden endelig gemning.
- Tilføj en separat knap: `Gem import` eller `Bekræft`, som skriver validerede rækker til databasen.

### UX-flow
1. Brugeren klikker på `Upload CSV`.
2. Appen sender filen til backend.
3. Backend parser filen og validerer hver række.
4. Frontend viser en tabel med alle rækker og valideringsstatus.
5. Brugeren kan fjerne dårlige rækker.
6. Brugeren bekræfter importen.
7. Backend gemmer de validerede rækker i databasen.

### Eksempel på tabelimplementering
- Brug en HTML-tabel eller et datagrid-komponent.
- Inkluder en kolonne med knapper: `Fjern`.
- Inkluder en statuskolonne: `Validering`.
- Gør `DonationMessage`, `UnitPrice` og `TotalPrice` kopierbare via en lille kopi-knap.

### Overview vs. detaljevisning
- **Overview:** vis kun de vigtigste felter i tabel eller kortformat, så brugeren hurtigt kan sammenligne mange poster.
  - typiske felter: `Title`, `Category`, `UnitPrice`, `TotalPrice`, `Countries`, `Validation`
  - vis lille tekst eller `DonationMessage` som kort beskrivelse
  - vis valideringsstatus og antal manglende felter
- **Detaljevisning:** når brugeren klikker på en linje, åben et panel eller en modal med hele posten.
  - vis alle felter i struktureret form
  - fremhæv `ProductDetails`, `ShortDescription`, `LongDescription`, `Usage`, `Notes` og `DonationMessage`
  - vis både EUR og DKK, og gør beløbene nemme at kopiere
- **Interaction:** brug accordion, drawer eller modal for at reducere støj i overview
  - start med en ren tabel uden alt for meget tekst
  - lad brugeren ekspandere de linjer, de vil se detaljer for

### Bedste visning for mange data
- Brug en kompakt tabel med sortering og søgning
- Hold long text skjult i overview, men vis den i detaljevisning
- Tilføj visuelle indikatorer for fx:
  - manglende felter
  - gyldig pris
  - om posten er klar til import
- I oversigten kan du bruge badges eller statusfarver: grøn = ok, gul = mangler data, rød = fejl

### Bedste visning for enkeltrække-element
- Når én linje er valgt, vis:
  - `Title` øverst
  - `Category` / `Subcategory` / `Type`
  - `Countries` og `CountryCodes`
  - `DonationMessage` og `BenefitStatement`
  - `UnitPrice` og `TotalPrice` i begge valutaer
  - `Quantity`, `PackOrQty`, `Validation`
  - lange beskrivelser i kommentarsektion: `ProductDetails`, `ShortDescription`, `LongDescription`, `Usage`, `Notes`
- Giv gerne en `Kopiér`-knap for hele posten eller for specifikke felter

### Anbefalet layout
- Desktop: tabel + detaljepanel
- Mobil: kortlistning med ekspandérbare elementer
- Hold overview-strukturen enkel og lad detaljerne være valgfrie

### Bemærkning
- Dette gør appen nem at scanne for brugeren: først oversigt, så kun de poster, der kræver opmærksomhed.

### Bemærkning
- Dette gør appen robust og bruger-venlig: upload-funktionen hjælper med at kontrollere datakvalitet, før der gemmes noget permanent.

## Gem ved brugerens valg
- Når brugeren uploader en CSV, kan du også gemme en kildeoplysning og tidspunkt.
- Efter upload kan appen vise dem som “sidst opdateret” eller “importeret fil”.

## Filtrering fra beløb til beløb
Indbyg et filter, hvor brugeren kan angive:
- minimumsbeløb
- maksimumsbeløb

Filtrering kan anvendes på:
- `UnitPrice` i euro eller DKK
- `TotalPrice` i euro eller DKK

Eksempel:
- `min_beløb_dkk = 200`, `max_beløb_dkk = 500`
- konverter til euro
- vælg poster med `TotalPrice` i det omregnede interval

## Fritekstsøgning
- Søg i alle felter på tværs af hver linje
- Inkluder mindst disse felter i søgningen:
  - `Category`
  - `Subcategory`
  - `Type`
  - `Title`
  - `ProductDetails`
  - `ShortDescription`
  - `LongDescription`
  - `Usage`
  - `Notes`
  - `Countries`
  - `BenefitStatement`
  - `DonationMessage`
- Søgeoutput skal returnere hele linjen/posten, hvis nogen felt matcher.

## Visning pr. linje
Hver CSV-post skal vises som en separat enhed i UI.
- Vis `Title` øverst
- Vis `DonationMessage`, `CountryCodes`, `Countries` og `BenefitStatement`
- Vis `UnitPrice`, `Quantity` og `TotalPrice` både i EUR og i DKK
- Gør værdierne nemme at kopiere:
  - Tilføj en “kopiér”-knap for pris per linje
  - Gør tekst og tal markerbare

### Eksempel på UI-linje
- Titel: `Title`
- Beskrivelse: `DonationMessage`
- Pris: `UnitPrice` EUR / `pris_dkk` DKK
- Antal: `Quantity`
- Samlet pris: `TotalPrice` EUR / `total_dkk` DKK
- Land: `Countries`
- Søgbar tekst: alt feltindhold
- Kopiér funktion: brugeren kan kopiere f.eks. `DonationMessage` og `UnitPrice`

## Fremtidssikring og skalering
- Design appen med modulær arkitektur, så nye funktioner kan tilføjes uden at bryde eksisterende flow.
- Hold frontend og backend adskilt: brug en API-first tilgang, så andre værktøjer kan integreres senere.
- Gem data i en struktureret database (f.eks. SQLite, Supabase) og brug et klart schema for poster og lightboxes.
- Lav et lag for datatransformation og validering, så legacy CSV-formater kan håndteres med nye parser-regler.
- Brug konfigurationsfiler eller settings, så du nemt kan skifte valutakurs, temaer og visningsregler.
- Sørg for versionering af dataformat, så du kan indføre nye felter eller ændre CSV-import uden at miste kompatibilitet.
- Gør det muligt at tilføje nye “temaer” og “lightboxes” dynamisk i UI, uden at skulle omstrukturere databasen.
- Hold den grundlæggende datamodel enkel, men forbered den på at understøtte:
  - flere temaer per post
  - brugeroprettede samlinger
  - ekstern auth og adgangskontrol
  - integration med eksterne services (auth, mail, analytics)

### Skalerbar udvidelse
- Start med en lille, funktionsdygtig minimumsløsning (MVP).
- Tilføj derefter lag for:
  - autentificering og adgangsstyring
  - brugerdefinerede lightboxes
  - søgning og avanceret filtrering
  - eksport/import og historik
- Dokumentér alle vigtige API-ruter og dataskemaer, så nye udviklere nemt kan bygge videre.

## Brugerdefinerede tema-lightboxes
- Gør det muligt for brugeren at oprette egne samlinger eller “lightboxes” med et tema.
- Et tema kan være fx `Vaccine`, `Mad til underernærede`, `Nødhjælp`, eller et andet brugerdefineret navn.
- Hver lightbox indeholder en liste af poster fra CSV-importen.
- Brugeren kan tilføje og fjerne poster fra sine egne lightboxes.

### Funktioner for lightboxes
- Opret ny lightbox med titel og beskrivelse
- Tilmeld/fjern poster til/fra en lightbox
- Se en lightbox som et udvalg af produkter med antal enheder, enhedspris og beskrivelse
- Gem lightbox-navnene i databasen eller i brugerens session
- Giv mulighed for at vise lightbox-oversigt og åbne en lightbox for at se detaljerne

### Hvad vises i en lightbox
- `Title` (produktnavn)
- `DonationMessage` eller `ShortDescription` (beskrivelse)
- `UnitPrice` (enhedspris)
- `Quantity` (antal enheder)
- `TotalPrice` (samlet pris)
- `Countries` eller `CountryCodes`
- evt. tema-badge som `Vaccine`, `Mad`, `Sundhed`

### Brugervenlighed
- Vis lightbox-navne i en sidebar eller som kategoriknapper i toppen
- Lad brugeren filtrere eller søge inden for en valgt lightbox
- Gør det nemt at oprette en ny lightbox fra en knap: `Opret ny tema-lightbox`
- Vis valgte poster, så brugeren kan genbruge dem i donor-kommunikation eller kampagner

### Backend-opsætning
- Gem lightboxes som egne objekter i databasen med felter: `name`, `description`, `created_at`, `item_ids`
- For hver importeret post gemmes et unikt ID, så lightboxes kun refererer til disse IDs
- Støt flere themes pr. post, så en post kan være tilføjet i flere lightboxes samtidigt
