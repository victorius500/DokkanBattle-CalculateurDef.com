/**
 * Génère la version statique du site dans dist/, prête pour Cloudflare.
 *
 * Équivalent multiplateforme de build-static.ps1 : cette version tourne
 * aussi bien en local que sur les serveurs de build Cloudflare (Linux).
 *
 * Usage :  node build-static.mjs
 */

import { readFile, writeFile, mkdir, rm, cp, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(fileURLToPath(import.meta.url));
const dist = path.join(root, 'dist');

const PAGES = ['index', 'Boss', 'calculatriceDokkan', 'calculatricePopup'];

const HEADERS = `/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=()
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.plot.ly; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self' blob:; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'
`;
// Note : 'unsafe-eval' est requis par Plotly, qui construit ses fonctions de
// trace dynamiquement (new Function). Sans lui, le graphique ne s'affiche pas.

/** Remplace les liens page.php par page.html, uniquement en contexte de lien. */
function rewriteLinks(text) {
    for (const page of PAGES) {
        text = text.replace(new RegExp(`(["'/])${page}\\.php`, 'g'), `$1${page}.html`);
    }
    return text;
}

console.log('Construction de la version statique...');

// 1. Repartir d'un dossier dist propre.
//    On vide son contenu plutot que de supprimer le dossier lui-meme :
//    sous Windows, un dossier ouvert par un autre processus refuse d'etre
//    supprime (EBUSY) alors que son contenu reste effacable.
await mkdir(dist, { recursive: true });
for (const entree of await readdir(dist)) {
    await rm(path.join(dist, entree), { recursive: true, force: true });
}

// 2. Copier les ressources
await cp(path.join(root, 'assets'), path.join(dist, 'assets'), { recursive: true });
console.log('  assets/ copie');

// 3. Convertir les pages PHP en HTML
for (const page of PAGES) {
    const source = path.join(root, `${page}.php`);
    if (!existsSync(source)) throw new Error(`Fichier introuvable : ${source}`);

    let html = await readFile(source, 'utf8');
    html = html.replace(/^\s*<\?php[\s\S]*?\?>\s*/, ''); // retirer l'entete PHP
    html = rewriteLinks(html);

    await writeFile(path.join(dist, `${page}.html`), html, 'utf8');
    console.log(`  ${page}.php -> ${page}.html`);
}

// 4. Reecrire les liens .php contenus dans le JavaScript
const jsDir = path.join(dist, 'assets', 'js');
for (const file of await readdir(jsDir)) {
    if (!file.endsWith('.js')) continue;
    const full = path.join(jsDir, file);
    const original = await readFile(full, 'utf8');
    const updated = rewriteLinks(original);
    if (updated !== original) {
        await writeFile(full, updated, 'utf8');
        console.log(`  liens corriges dans assets/js/${file}`);
    }
}

// 5. En-tetes de securite (equivalent Cloudflare du .htaccess)
await writeFile(path.join(dist, '_headers'), HEADERS, 'utf8');
console.log('  _headers genere');

// 6. Verification : plus aucune trace de PHP
let restes = 0;
for (const page of PAGES) {
    const html = await readFile(path.join(dist, `${page}.html`), 'utf8');
    if (/<\?php|\.php/.test(html)) {
        console.error(`  ATTENTION - reference PHP restante dans ${page}.html`);
        restes++;
    }
}
if (restes === 0) console.log('\nAucune trace de PHP dans le resultat.');

console.log('Termine : dist/');
