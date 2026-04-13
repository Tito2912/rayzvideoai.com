# Audit complet — rayzvideoai.com

Date : 2026-04-12  
Scope analysé : repo `rayzvideoai.com` (Next.js App Router, export statique, déploiement Netlify)

## 1) Résumé exécutif

Le site a une base SEO solide (sitemap + robots, `hreflang`, canoniques, OpenGraph/Twitter, JSON‑LD, maillage interne, pages légales, consentement GA4 opt‑in).  
Les principaux points bloquants/à fort impact sont :

- `lang` HTML incorrect côté rendu statique : toutes les pages sortent en `<html lang="fr">`, y compris `/en`, `/es`, `/de` (SEO + accessibilité).
- Titres dupliqués (`… | RayzVideoAI | RayzVideoAI`) dus au template global + titres frontmatter déjà suffixés.
- Vidéo hero : attributs `muted`/`loop` écrits en `muted=""`/`loop=""` → supprimés au rendu, autoplay souvent bloqué + asset lourd (~9.9 MB) préchargé.
- Pipeline Netlify : `netlify.toml` appelle `scripts/ping-indexnow.cjs` alors que `scripts/` est non suivi par git (risque de build cassé).

## 2) Inventaire technique (constaté)

- Framework : Next.js (`output: 'export'`) → génération statique vers `out/`.
  - `next.config.mjs` : `output: 'export'`, `images.unoptimized: true`.
- Déploiement : Netlify (`netlify.toml` + `public/_redirects`).
- Multi‑langue : FR (par défaut, sans préfixe), EN/ES/DE (préfixés).
- Analytics : GA4 chargé uniquement après consentement via `components/CookieBanner.tsx` (opt‑in).

Limitations de cet audit automatisé : l’environnement courant ne fournit pas `node`/`npm` exécutables (impossible d’exécuter `next build`, `next lint`, `npm audit` ici). Les recommandations ci‑dessous incluent les commandes à lancer sur votre machine/CI.

## 3) SEO — points forts

- Meta : `title`, `description`, OpenGraph + Twitter présents (`app/layout.tsx`, `app/page.tsx`, `app/[...slug]/page.tsx`).
- International : `rel="alternate" hreflang="…"` généré via `lib/seo.ts` et frontmatter `translationKey`.
- Sitemap : `/sitemap.xml` généré (route metadata `app/sitemap.ts`).
- Robots : `/robots.txt` généré (route metadata `app/robots.ts`).
- Données structurées : JSON‑LD Article + Breadcrumb + FAQ (si frontmatter `faq`).
- Maillage interne : `internalLinks` frontmatter + liens contextuels dans le contenu.

## 4) SEO — problèmes et améliorations (priorités)

### P0 — Critique

1) `lang` HTML statique incorrect (i18n)
- Constat : même les pages `/en/*`, `/es/*`, `/de/*` sortent en `<html lang="fr">` (ex : `out/en.html`).
- Impact : accessibilité (lecteurs d’écran), SEO (compréhension de la langue), qualité perçue.
- Cause : `app/layout.tsx` fixe `lang="fr"` et `LangHtmlUpdater` ne corrige qu’après hydratation.
- Fix recommandé :
  - Idéal : refactor de routing i18n (segment `[lang]`) pour rendre `lang` côté build (SSR statique).
  - À défaut (quick fix) : script très tôt (avant interactive) qui set `document.documentElement.lang` selon `location.pathname`. Ça n’aide pas les bots sans JS, mais améliore UX.

2) Titres dupliqués (`| RayzVideoAI | RayzVideoAI`)
- Constat : le template global `%s | RayzVideoAI` s’applique à des titres déjà suffixés dans les `.mdx`.
  - Exemple : `content/blog-pictory.mdx` → `out/blog-pictory.html` : `Pictory … | RayzVideoAI | RayzVideoAI`.
- Impact : CTR + lisibilité + “spamminess” perçue.
- Fix recommandé : choisir **une seule** stratégie :
  - Option A (simple) : retirer `RayzVideoAI` des titres frontmatter.
  - Option B (robuste) : dans `generateMetadata`, utiliser `title: { absolute: meta.title }` **uniquement** quand `meta.title` contient déjà la marque.

3) Vidéo hero : attributs boolean perdus + poids
- Constat : dans `content/*/index.mdx`, la balise `<video>` utilise `muted=""` et `loop=""`. Ces attributs ne sortent pas dans `out/index.html` → la vidéo n’est pas mutée/bouclée et l’autoplay est souvent bloqué.
- Performance : `public/videos/hero-background.mp4` ≈ 9.9 MB, `preload="auto"` → gros coût réseau au-dessus de la ligne de flottaison.
- Fix recommandé :
  - Écrire les booléens en JSX/MDX : `muted` / `loop` / `playsInline` / `autoPlay` (sans `=""`).
  - Passer à `preload="metadata"` (ou `none`) + chargement conditionnel (desktop / bonne connexion).
  - Ajouter un fallback “reduced motion” (`prefers-reduced-motion`).

4) Risque de build Netlify (script non suivi)
- Constat : `netlify.toml` exécute `node scripts/ping-indexnow.cjs`, mais `scripts/` est actuellement non suivi par git (`git status` local).
- Impact : build Netlify peut échouer si le repo distant n’a pas ce fichier.
- Fix : versionner `scripts/ping-indexnow.cjs` (ou retirer l’appel si non utilisé).

### P1 — Important

5) Sitemap inclut des pages `noindex`
- Constat : `/blog` (et variantes langue) ont `robots: "noindex, follow"` mais apparaissent dans `/sitemap.xml`.
- Statut : corrigé (filtrage `noindex` dans `app/sitemap.ts`).
- Reco : filtrer les pages `noindex` hors sitemap **ou** reconsidérer le `noindex` si la page blog apporte une valeur SEO (souvent oui).

6) `lastmod` peu fiable (churn)
- Constat : pour les pages sans `date`/`updatedAt`, `app/sitemap.ts` met `lastModified = now` → toutes ces URLs changent à chaque build.
- Impact : crawl inutile, signaux “freshness” bruités.
- Statut : corrigé (fallback `mtime` fichier MDX via `lib/content.ts`).
- Reco : imposer `date/updatedAt` sur toutes les pages importantes **ou** calculer `lastmod` depuis le mtime du fichier MDX.

7) Affiliation : incohérence `rel="sponsored"` dans les “sources”
- Constat : certains liens Pictory avec param `?ref=` n’ont pas `rel="sponsored"` (ex : `content/blog-pictory.mdx` “Sources officielles”).
- Statut : corrigé (sources Pictory → URLs “clean” + `rel="nofollow"`).
- Reco : soit URL “clean” sans ref dans les sources, soit ajouter `rel="sponsored nofollow"`.

8) Paramètre d’affiliation Akool probablement erroné
- Constat : le lien Akool utilisait `via=rayzideoai` (typo probable).
- Impact : tracking/commission potentiellement perdus.
- Statut : corrigé (passage à `via=rayzvideoai`).
- Reco : vérifier le param exact, corriger partout (header + contenus).

9) Données structurées / OG types trop “Article”
- Constat : JSON‑LD `@type: Article` injecté sur toutes les pages, y compris pages légales/contact/pilier.
- Reco : adapter selon `post.type` (`WebPage`, `BlogPosting`, `CollectionPage`, etc.) + enrichir (image/logo) si pertinent.

10) Localisation UI incomplète
- Constat : libellés UI (“Quick answer”, “Next steps”, “On this page”, 404) restent en anglais sur FR/ES/DE.
- Impact : qualité perçue + cohérence i18n.
- Reco : ajouter traductions dans `UI_TRANSLATIONS` et les utiliser dans `ArticleLayout`, `TableOfContents`, `not-found`.

11) Qualité ES (à reprendre)
- Constat : `content/es/index.mdx` a un title tronqué `…` + texte mix FR/EN/ES sur certaines pages (ex : “AI Video”).
- Impact : CTR/qualité SEO en ES.
- Reco : réécrire titres/descriptions ES et harmoniser la terminologie (“vídeo IA”).

## 5) Performance (Core Web Vitals) — observations

- Vidéo hero ~9.9 MB + preload auto : gros risque LCP/INP sur mobile et connexions lentes.
- Embeds YouTube : `youtube-nocookie.com` + `loading="lazy"` (bon), mais prévoir fallback statique/consent si nécessaire.
- Caching Netlify : long cache sur `/_next/*`, `/images/*`, `/videos/*` (bon).

Recommandation : viser une version mobile “poster-only” (pas de vidéo) et charger la vidéo seulement sur desktop / connexion rapide.

## 6) Sécurité / conformité (statique)

- Cookies/GA4 : opt‑in (bon). À améliorer : un lien “Gérer les cookies” persistant (footer) pour changer d’avis sans supprimer les cookies.
- Headers HTTP : pas de politique de sécurité globale visible (CSP, HSTS, nosniff…). Possible via `netlify.toml`, à faire prudemment (Next injecte des scripts inline).

## 7) Contenu & conversion — recommandations

- Le “pillar” FR est dense, structuré, avec CTAs et maillage interne (bon pour SEO/affiliation).
- À renforcer :
  - “Pourquoi nous faire confiance” plus visible (méthodo + tests + date de vérif).
  - Blocs “choix rapide” (persona → outil) et comparatif “décision” plus haut.
  - Cohérence multi-langue : qualité ES/DE/EN à homogénéiser, surtout les titles.

## 8) Check-list d’actions (quick wins → long terme)

### Quick wins (0.5–1 journée)

- Corriger duplication des titres (stratégie A ou B).
- Corriger le `<video>` hero (`muted/loop/playsInline/autoPlay`) + `preload`.
- Corriger le param Akool `via=…` si typo.
- Ajouter `rel="sponsored"` (ou URL clean) aux liens Pictory de “sources”.
- Exclure les pages `noindex` du sitemap (ou enlever le `noindex` si souhait SEO).
- Versionner `scripts/ping-indexnow.cjs` si utilisé par Netlify.

### Améliorations (1–3 jours)

- Corriger `lang` HTML côté rendu statique (refactor i18n).
- Revoir schema.org : type selon page + champs utiles (publisher logo, image, dates).
- Stabiliser `lastmod` via mtime MDX ou `updatedAt` obligatoire.
- Localiser les libellés UI (ArticleLayout/404/TOC).

### Validation (à lancer localement/CI)

- `npm ci`
- `npm run lint`
- `npm run build`
- `npm audit --omit=dev`
- Contrôle manuel Netlify : `/`, `/en/`, `/es/`, `/de/`, `/heygen-pricing`, `/mentions-legales`, `/robots.txt`, `/sitemap.xml`.
