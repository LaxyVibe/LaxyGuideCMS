# Laxy Guide CMS

Now uses npm + Vite build (no CDN) and a separate workspace package for the custom Create Audio Guide widget.

## Features
- Local Decap CMS admin (`/admin`)
- Collection: Display Items (markdown in `content/displayItems`)
- Media handling (images/audio) in `public/media`
- Sample item included.

## Development

Install dependencies and start dev server:

```bash
npm install
npm run dev
```

Visit: http://localhost:5173 (default Vite port) to load Decap CMS.

Local backend lets you test without Git. For production change the `backend` block in `admin/config.yml` to use `git-gateway` (Netlify) or `github`.

## Production Backend Example (GitHub)
```yaml
backend:
  name: github
  repo: your-github-user/your-repo
  branch: main
```
Ensure you configure authentication (e.g. Netlify Identity or other OAuth provider) per Decap CMS docs.

## Display Item Front Matter Fields
- title (string)
- shortTitle (optional string)
- slug (string, lowercase, hyphenated)
- category (select)
- year (int, optional)
- location (string - internal code / room)
- coordinates.lat / coordinates.lng (numbers)
- tags (list of strings)
- images (list of image files)
- audio (file - optional)
- body (markdown description)

## Structure

- `index.html` basic shell with module entry `/src/main.js`
- `src/main.js` initializes Decap CMS and Netlify Identity, registers custom widget package
- `packages/create-audio-guide-widget` isolated widget source (can later be published to npm)
- Legacy `widgets/CreateAudioGuide/` directory kept temporarily (will be removed after migration) but not used now.

## Building

```bash
npm run build
```
Outputs production assets to `dist/` via Vite.

## Netlify Functions

`/.netlify/functions/generate-audio.js` used by widget for audio generation (placeholder).

## Migration Notes

CDN script tags removed. Decap CMS and Netlify Identity are imported as modules. Custom widget API replaced with ES module exports and registered through `registerWidget`.

## Folder Structure
```
admin/
  index.html
  config.yml
content/
  displayItems/
public/
  media/
    images/
    audio/
index.html
src/
  main.js
packages/
  create-audio-guide-widget/
```

## Notes
- `preview_path` points to `display/<slug>` (adjust to match PWA routing)
- Media paths served from `/media`.
