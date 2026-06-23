# Progression

## Status (hvor langt er vi)
Frontend-prototypen er færdig og kører som en ren klient-side app. Ingen backend, ingen persistens udover dark mode-valg.

- Stack: Vue 3 + TypeScript + Vite 5 + Tailwind CSS v4 (CSS-først via `@theme` i `src/style.css`).
- Designsprog: GT Mechanik-inspireret — lyst "paper"/sort "ink", hairline-grid, skarpe hjørner, Space Grotesk (overskrifter) + Space Mono (labels/tal), signal-rød accent.
- Sticky top-navigation i samme bredde som indholdet (`max-w-7xl` + ens gutters), indrammet som et kort.
  - CSV-import (skjult filinput bag styled knap)
  - Lightboxes som dropdown-menu (flyttet væk fra sidebar)
  - Dark mode-toggle (☾/☀)
  - Toolbar-række: fritekstsøg + prisfiltre (Min/Max/Eksakt) + opret tema
- Indhold som liste: produkter i en `<ul>` med fold-ud rækker ("Læs mere +"), kun én åben ad gangen, udvider kun ved klik.
- Prisfilter: kun varer hvis **enhedspris i DKK** ligger i det indtastede interval vises; varer uden enhedspris udelades når et filter er sat (`UnitPriceDKKValue`).
- Dark mode: `.dark`-klasse på `<html>` bytter CSS-variabler (`--color-paper/ink/muted`); valg gemmes i `localStorage` + falder tilbage til `prefers-color-scheme`; inline-script i `index.html` sætter temaet før paint (ingen flash).
- CSV-parsing via PapaParse (semikolon-separeret, 21 kolonner), EUR→DKK omregning (fast kurs 7.5).

## Kørende funktionalitet
- CSV-upload, parsing, EUR→DKK
- Søgning + prisfiltrering (enhedspris-interval) + pagination
- Opret tema-lightboxes, åbn tema, fold-ud varedetaljer, kopiér linje, fjern vare, nulstil
- Lys/mørk visning
- Beskrivelse vises som Original (kildesprog) + DA (dansk) i fold-ud. Kildesprog (EN eller DE) detekteres med browserens `LanguageDetector` (heuristik som fallback). Dansk forsøges først med on-device `Translator`-API (gratis, privat, intet netværk; Chrome/Edge 138+), ellers gratis online-API (MyMemory, `api.mymemory.translated.net`, `<src>|da`, maks 500 tegn). Online-fallback **sender beskrivelsesteksten til en tredjepart**. Oversættes dovent ved åbning og caches pr. vare.
- Euro-beløb i beskrivelsen omregnes til DKK i den danske oversættelse (kurs 7.5). Både tal (`€50`, `50 EUR`, `50 euro`) og danske talord (`fem euro`, `femogtyve euro`, `to hundrede euro`) håndteres via `cleanNumber` + en dansk talord-parser.
- Supabase-persistens (gem/hent) med login: hele listen (items + themes) gemmes som ét snapshot-row pr. bruger i tabellen `shopping_lists` (jsonb, `id = auth.uid()`). `src/lib/supabase.ts` (klient + auth + `loadList`/`saveList`), `supabase/schema.sql` (tabel + bruger-scoped RLS).
- Auth: Supabase e-mail/password login via modal (`Log ind` / `Opret konto`), session vises i mastheaden, `Log ud`-knap. `Gem`/`Hent` og auto-gem (debounced) virker kun når man er logget ind. RLS er scoped til `authenticated` med `auth.uid() = id`, så hver bruger kun ser sin egen liste.
- Nøgler i `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Env-ændringer kræver genstart af dev-server.

## Vigtige filer
- `src/App.vue` — al UI og logik (single-file component)
- `src/style.css` — Tailwind v4 `@theme`, dark mode-variabler, basisstil
- `index.html` — fonts + pre-paint dark mode-script
- `vite.config.ts` — minimal (mangler `base` til Pages, se nedenfor)

## Hvad mangler til produktion

### 1. Supabase (data + auth)
Appen har i dag ingen persistens. For at gemme data på tværs af enheder/sessioner kræves:
- Opret Supabase-projekt; installer `@supabase/supabase-js`.
- Datamodel (forslag): `products`, `themes`, `theme_items` (eller `themes.items` som `jsonb`), evt. `imports`.
- Erstat in-memory `ref`-arrays i `App.vue` med Supabase-queries (læs/skriv).
- **Row Level Security (RLS): obligatorisk.** Slå RLS til på alle tabeller og skriv policies, så brugere kun ser/ændrer egne rækker. Uden RLS er den offentlige anon-key lig med fuld databaseadgang.
- Auth: brug Supabase Auth (tidligere `LoginForm.vue` er slettet og skal genskabes hvis login ønskes). Knyt rækker til `auth.uid()`.
- Evt. Realtime-subscription for live-opdatering.

### 2. Sikre miljøvariabler
- Vite eksponerer **kun** variabler med præfikset `VITE_` til klienten — og **alt** der bundles i frontend er offentligt (det ligger i JS-bundlet og kan læses af enhver). Frontend kan ikke holde på hemmeligheder.
- Brug `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY`. Anon-key er **designet til at være offentlig** og er kun sikker, fordi RLS beskytter dataene.
- `service_role`-key (og andre rigtige hemmeligheder) må **aldrig** i frontend. Skal noget hemmeligt bruges, kræver det en backend: Supabase **Edge Functions** / serverless, hvor secret kun findes server-side.
- Lokalt: `.env.local` (git-ignoreret). Tilføj en `.env.example` med tomme nøgler til dokumentation.
- `.gitignore` skal dække `.env` og `.env.*` (men ikke `.env.example`).
- I CI: læg `VITE_*`-værdier i **GitHub Actions repository secrets** og injicér dem ved build — vær opmærksom på at de stadig ender offentligt i det byggede output.

### 3. Hosting på privat repo med GitHub Pages
- **Sikkerheds-OBS:** GitHub Pages-sites er **offentlige som standard — også fra et privat repo** (på Free/Pro). Adgangskontrolleret/privat Pages findes kun på **GitHub Enterprise Cloud**. Et privat repo beskytter altså **kildekoden**, men **ikke** den hostede side eller dens bundle.
  - Konsekvens: `VITE_`-variabler, anon-key og al UI er offentligt tilgængelige. Databeskyttelse skal komme fra **Supabase Auth + RLS**, ikke fra "privat" hosting.
- `vite.config.ts`: sæt `base: '/<repo-navn>/'` ved project-Pages (`https://bruger.github.io/<repo>/`). Ved custom domæne eller user/org-Pages bruges `base: '/'`.
- SPA-routing: Pages har ingen server-side fallback. Lige nu er der ingen router, så det er ikke et problem. Tilføjes Vue Router i history-mode senere, kræves `404.html`-fallback eller hash-mode.
- Deploy via GitHub Actions: workflow der kører `npm ci` → `npm run build` og publicerer `dist/` med `actions/upload-pages-artifact` + `actions/deploy-pages`. Sørg for `.nojekyll` (Vite-output har `_`-mapper) — håndteres typisk af deploy-pages-action.
- Aktivér Pages i repo-settings med "GitHub Actions" som kilde.

## Næste skridt (rækkefølge)
1. Sæt `base` i `vite.config.ts` og opret GitHub Actions Pages-workflow (få den statiske app live).
2. Tilføj `.env.local` + `.env.example` og `.gitignore`-regler.
3. Opret Supabase-projekt, tabeller og **RLS-policies**.
4. Tilføj `@supabase/supabase-js`, byt in-memory state ud med queries.
5. Tilføj Supabase Auth + login-UI; knyt data til bruger.
6. (Valgfrit) Realtime, Edge Functions til alt der kræver ægte hemmeligheder.

## Noter
- UI er i GT Mechanik-stil — teknisk/industrielt, monokromt med rød accent. Modsat det tidligere mørke "SaaS-glas"-udtryk.
- Tailwind v4 læser **ikke** en `tailwind.config.cjs` (fjernet); temaet defineres i `src/style.css` via `@theme`.
