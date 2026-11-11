# yeezikwebsitetest

Sito di prova per il nuovo yeezik.com, fatto con [Astro](https://astro.build). Le pagine escono come HTML statico leggero; React è già configurato per inserire componenti (per esempio da React Bits) solo dove servono.

## Struttura

- `src/pages/` — una pagina per file: `index` (Home), `about`, `music`, `events`, `404`
- `src/layouts/Layout.astro` — parti comuni: riga in alto, menu mobile, footer
- `src/components/Wordmark.astro` — scritta gigante con la "I" in pixel
- `public/assets/` — `style.css`, `main.js` (menu, adattamento scritta, copia email), `ascii.js` (sfondo ASCII della Home)

## Comandi

- `npm install` — installa le dipendenze
- `npm run dev` — anteprima locale
- `npm run build` — crea il sito in `dist/`

## Cloudflare

Collegando la repo a Cloudflare Workers:

- Build command: `npm run build`
- Deploy command: `npx wrangler deploy` (usa `wrangler.jsonc`, che pubblica `dist/`)

## Componenti React (React Bits)

Mettere il componente in `src/components/` (es. `GradientASCII.jsx`) e usarlo in una pagina con una direttiva, così React si carica solo lì:

```astro
---
import GradientASCII from '../components/GradientASCII.jsx';
---
<GradientASCII client:visible />
```
