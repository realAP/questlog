Fremdbibliotheken, unverändert aus dem npm-Paket übernommen. Die Version steht im Dateinamen,
damit Browser und Service Worker nach einem Update keine alte Datei aus dem Cache nehmen.

| Datei                   | Paket             | Lizenz |
|-------------------------|-------------------|--------|
| `htmx-2.0.11.min.js`    | htmx.org 2.0.11   | 0BSD   |
| `alpine-3.17.5.min.js`  | alpinejs 3.17.5 (`dist/cdn.min.js`) | MIT (laut `package.json`, keine Lizenzdatei im Paket) |
| `motion-14.12.0.js`     | motion 14.12.0 (`dist/motion.js`, globales `Motion`) | MIT |

Aktualisieren: Tarball von `https://registry.npmjs.org/<paket>/-/<paket>-<version>.tgz` laden,
Datei kopieren, Version im Dateinamen und in `templates/fragments/head.html` anpassen.
