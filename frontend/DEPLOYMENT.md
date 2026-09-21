# Temporary deployment at https://caesar.se/new/

From the workspace root, run:

```sh
npm run build --workspace=frontend
```

Upload the **contents** of `frontend/dist/` into `httpdocs/new/`. Enable hidden-file
display in the upload client so `.htaccess` is included. The result should be:

```text
httpdocs/
  ...existing WordPress files, unchanged...
  new/
    .htaccess
    index.html
    assets/
    data/
      projects.json
```

Do not upload the `dist` directory itself, replace `httpdocs/index.php`, or change
`httpdocs/.htaccess`. No backend deployment, WordPress edit, or Node process is
needed for this static frontend. These instructions do not deploy anything.

## Base path, navigation, and assets

Vite uses `/new/` for builds and preview, and `/` for the development server.
`src/paths.ts` uses `import.meta.env.BASE_URL` for local links and public images,
including SVG images and responsive `srcSet` images. It also strips the deployment
prefix before the existing pathname checks. React Router is not installed.

Vite rewrites the stylesheet's font URL and generated CSS/JavaScript URLs at build
time. The HTML font preload uses `%BASE_URL%`. Same-page `#section` links continue
to work. Links to existing WordPress pages and external forms remain unchanged.

The existing routes are:

- `/new/`: homepage.
- `/new/ga-med-i-caesar/`: membership page (also works without the final slash).
- `/new/projects/deimos`: redirects to the original WordPress Deimos page.

There is currently **no separate React Phobos page**. `/new/projekt/phobos` will
load the app through the server fallback and display the homepage, preserving the
app's existing behavior for unrecognized paths. Phobos links still point to
`https://caesar.se/projekt/phobos/`.

## Static project data

The homepage previously fetched `/api/projects`. Uploading only `dist` cannot
provide the Node API, and requesting that URL on the live domain would go to the
WordPress site. Production now fetches `/new/data/projects.json`, containing the
same project record as the current backend. Local development still fetches
`/api/projects` through Vite's existing proxy; the backend is unchanged.

The project's text, links, loading state, error state, and presentation are
preserved. For this temporary deployment, update `public/data/projects.json` and
rebuild if the project list changes; it does not synchronize with the backend.

## Apache/Plesk: refreshing routes

**Yes, direct requests and refreshes need an SPA fallback.** The included
`public/.htaccess` is copied to `dist/.htaccess` by Vite. Installed only in
`httpdocs/new/`, it serves existing files normally and sends other paths to
`/new/index.html`. Missing assets/data retain a 404 instead of returning HTML.

```apache
Options -MultiViews
DirectoryIndex index.html

RewriteEngine On
RewriteBase /new/

RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [END]
RewriteRule ^(?:assets|data)(?:/|$) - [END]

RewriteRule ^ index.html [END]
```

This requires Apache 2.4 with `mod_rewrite` and permission to use these `.htaccess`
directives (`AllowOverride` for FileInfo, Indexes, and the MultiViews option).
The file applies only to `new/` and requires no edits to the normal WordPress
rewrite rules. Custom server-level redirects or forced parent-rule inheritance
may require a hosting administrator to configure a `/new/` exception instead;
do not alter WordPress rules to troubleshoot this blindly.

Plesk can use nginx in front of Apache. If requests reach Apache, the included
file supplies the fallback. If nginx handles the site without Apache, `.htaccess`
is ignored. In that case, the hosting administrator can add a location scoped
only to `/new/` under the domain's **Apache & nginx Settings > Additional nginx
directives**, after checking the existing location configuration:

```nginx
location = /new {
    return 302 /new/;
}

location ^~ /new/ {
    # Retain hidden-file protection when bypassing other regex locations.
    location ~ /\. {
        deny all;
    }
    location /new/assets/ {
        try_files $uri =404;
    }
    location /new/data/ {
        try_files $uri =404;
    }
    try_files $uri $uri/ /new/index.html;
}
```

Use this alternative only when needed for the actual server configuration. Leave
the existing root location, WordPress/PHP handlers, and domain proxy mode intact.
The live Plesk/Apache/nginx configuration has not been inspected or changed.

References: [Vite public base path](https://vite.dev/guide/build#public-base-path),
[Apache rewrite rules](https://httpd.apache.org/docs/2.4/mod/mod_rewrite.html),
[Plesk rewrite configuration](https://support.plesk.com/hc/en-us/articles/12377525282967-How-to-enable-Apache-nginx-rewrite-rules-in-Plesk),
[Plesk nginx-only behavior](https://support.plesk.com/hc/en-us/articles/12377349024407-Redirection-rules-and-other-settings-configured-in-the-htaccess-file-do-not-work-on-a-website-in-Plesk-for-Linux).

## Verification

After building, run `node scripts/check-subdirectory.mjs` from the workspace root.
Set `BROWSER_PATH` to an installed Chrome/Chromium/Edge executable if Playwright's
browser is not installed. This check serves the production files under `/new/`
with an isolated static server, verifies asset requests, membership navigation,
deep-link refreshes, project data, and the legacy redirect. The server emulates
the fallback; it does not execute Apache directives.

For a manual preview, run `npm run preview --workspace=frontend` and open
`http://localhost:4173/new/`.

After upload, check `/new/`, `/new/ga-med-i-caesar/` (including a refresh), and
`/new/projekt/phobos`. Confirm `/new/assets/` requests succeed, and confirm that
`https://caesar.se/` still serves the existing WordPress site. Live rewrite behavior
must be verified on the host.
