# LaxyGuideCMS (Decap CMS)

Simple Decap CMS setup for managing `displayItem` content for a Museum Guide PWA.

## Features
- Local Decap CMS admin (`/admin`)
- Collection: Display Items (markdown in `content/displayItems`)
- Media handling (images/audio) in `public/media`
- Sample item included.

## Development

1. Install dependencies:
   npm install

2. Start a static dev server:
   npm start

3. Open http://localhost:3000/admin

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
```

## Notes
- `preview_path` points to `display/<slug>` (adjust to match PWA routing)
- Media paths served from `/media`.
