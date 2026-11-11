# Epsylon — cadrage du MVP

> Décisions prises le 10 novembre 2026. Complète `cheminement-et-choix.md` et clôt sa section 7
> (questions ouvertes).

## 1. Décisions

| Sujet | Décision | Conséquence |
| --- | --- | --- |
| Nom | `epsylon` pour le dépôt, le paquet npm et la commande | `sovship` / `sov` abandonnés. Disponibilité du nom sur npm **à vérifier** |
| Langage | TypeScript | Distribution `npx epsylon`, même écosystème que les utilisateurs visés |
| Cible de déploiement | Coolify seul | Isolé derrière une interface `Target` pour ajouter Dokploy plus tard |
| Source de migration | Vercel + Next.js + Postgres | Postgres quel que soit le fournisseur ; Supabase Auth / Storage / Realtime hors périmètre |
| Périmètre de la migration | Configuration générée + runbook écrit | Aucune action automatisée sur les données ou le DNS |
| Conformité | Contrôles techniques vérifiables | Présenté comme une aide à la conformité, jamais comme une certification RGPD |
| Objectif | Open-source communautaire | Licence permissive, pas de frontière open-core à concevoir |
| Infra de test | Aucune pour l'instant | `init`, `plan`, `check` développés en local ; `deploy` en dernier |

## 2. Choix par défaut (à contester si besoin)

- **Licence :** Apache 2.0 (comme Coolify).
- **Langue :** code, commits et README en anglais ; documentation utilisateur en français et en anglais ;
  documents de conception internes (`docs/`) en français.
- **Outillage :** Node LTS, pnpm, Vitest, `clack` pour les invites, un seul paquet (pas de monorepo).
- **Sortie du CLI :** lisible par défaut, `--json` sur chaque commande pour la CI.

## 3. Les quatre commandes

| Commande | Entrée | Sortie | Critère de réussite |
| --- | --- | --- | --- |
| `epsylon init` | Le dépôt courant | `epsylon.yaml` (manifeste) | Détecte Next.js, sa version, le gestionnaire de paquets, les variables d'environnement attendues, l'usage de Postgres et les spécificités Vercel |
| `epsylon plan` | `epsylon.yaml` | `Dockerfile`, `docker-compose.yml`, `MIGRATION.md` (runbook) | `docker compose up` démarre l'application et sa base en local |
| `epsylon check` | `epsylon.yaml` + fichiers générés | Rapport (terminal, Markdown, JSON) | Chaque règle renvoie réussite / échec / non vérifiable, avec la correction à apporter |
| `epsylon deploy` | Fichiers générés + URL et jeton Coolify | Application déployée | Application en ligne en HTTPS sur une instance Coolify |

`epsylon.yaml` est le pivot : `init` l'écrit, l'utilisateur peut le corriger à la main, les trois autres
commandes ne lisent que lui. Il est versionné dans le dépôt de l'utilisateur.

## 4. Architecture

```
dépôt utilisateur
      │
  détecteurs ──► manifeste (epsylon.yaml) ──► générateurs ──► Dockerfile, compose, runbook
                        │                                          │
                        └──────────► règles de conformité ◄────────┘
                                             │
                                          rapport
                                                        cible (Coolify) ◄── fichiers générés
```

- **Détecteurs :** un module par sujet (framework, base de données, variables d'environnement,
  spécificités Vercel). Chacun lit des fichiers et renvoie un fragment du manifeste.
- **Générateurs :** fonctions pures manifeste → fichiers. Testables par instantanés.
- **Règles :** déclarées en YAML (identifiant, gravité, description, correction), évaluées par du code.
- **Cible :** interface `Target` (`validate`, `deploy`, `status`) ; `CoolifyTarget` en est la seule
  implémentation au MVP.

## 5. Spécificités Vercel à détecter

Ce sont elles qui font échouer une migration. `init` les repère, `MIGRATION.md` dit quoi en faire.

| Spécificité | Indice dans le dépôt | Traitement au MVP |
| --- | --- | --- |
| Variables d'environnement | `.env.example`, `process.env.*` dans le code | Listées dans le manifeste, à renseigner dans Coolify |
| Tâches planifiées | `crons` dans `vercel.json` | Signalées, équivalent proposé dans le runbook |
| Runtime edge / middleware | `export const runtime = 'edge'`, `middleware.ts` | Signalé ; fonctionne en mode Node, différences listées |
| Optimisation d'images | `next/image` | Signalé (dépendance `sharp`, cache disque) |
| ISR et cache | `revalidate`, `unstable_cache` | Signalé (cache local, volume persistant) |
| Services Vercel | `@vercel/blob`, `@vercel/kv`, `@vercel/postgres`, `@vercel/analytics` | Signalés comme bloquants ou à remplacer |
| Redirections et en-têtes | `vercel.json` | Signalés, à reporter dans `next.config` |

## 6. Règles de conformité du MVP

1. Aucune variable secrète en clair dans les fichiers générés ou versionnés.
2. TLS activé sur tout point d'entrée public.
3. Base de données non exposée sur Internet.
4. Volumes de données identifiés, chiffrement au repos déclaré.
5. Sauvegardes de la base configurées, destination située dans l'UE.
6. Région d'hébergement déclarée dans le manifeste et située dans l'UE.
7. Rétention des logs bornée.
8. Dépendances qui envoient des données à des services hors UE (analytics, suivi d'erreurs, e-mail,
   authentification) listées dans le rapport.

Les règles 4 à 6 reposent en partie sur ce que l'utilisateur déclare : le rapport distingue
« vérifié » et « déclaré ».

## 7. Hors périmètre du MVP

Dokploy, frameworks autres que Next.js, bases autres que Postgres, Supabase complet, copie automatique
des données, bascule DNS automatique, provisionnement du serveur, génération du registre des
traitements, édition payante.

## 8. Ordre de construction

1. Squelette du projet (TypeScript, tests, CI, licence, README).
2. Schéma de `epsylon.yaml` et trois dépôts d'exemple servant de jeux de test.
3. `init`.
4. `plan`.
5. `check`.
6. Installation d'une instance Coolify chez un hébergeur français, lecture de son API, puis `deploy`.

## 9. État du marché (vérifié le 10 novembre 2026)

Recherche web, une dizaine de requêtes en français et en anglais. Une absence de résultat n'est pas une
preuve d'absence : un projet récent et peu référencé peut avoir échappé à la recherche.

**Aucun CLI de migration Vercel → Coolify trouvé.** Les résultats sont des guides manuels (une dizaine
publiés en 2026), signe que la demande existe et que la réponse reste artisanale. Aucun importeur Vercel
intégré à Coolify n'a été trouvé non plus.

**Concurrent le plus proche : `land-on-clever-cloud`** (github.com/Vitiosum/land-on-clever-cloud).

- Skill d'agent IA (Claude Code, Codex), pas un CLI ; maintenu par des personnes de l'avant-vente de
  Clever Cloud, présenté comme communautaire et en bêta.
- Migre vers Clever Cloud uniquement, depuis Vercel, Supabase, Heroku, docker-compose ou une VM.
- Très jeune : premier commit le 25 octobre 2026, 3 commits, 0 étoile au 10 novembre.
- Pas de rapport RGPD ; seulement un contrôle de préparation HDS.

**Ce que cela change pour Epsylon :**

- La forme « skill d'agent » est une alternative crédible au CLI. Un agent IA sait déjà suivre un guide
  de migration ; la valeur d'Epsylon doit donc être dans ce qu'un agent ne garantit pas : détection
  déterministe, règles de conformité versionnées, sortie reproductible et utilisable en CI.
- Prévoir dès le MVP une sortie `--json` stable, pour qu'un agent puisse piloter Epsylon plutôt que le
  remplacer.
- Le positionnement « cible auto-hébergée (Coolify) + contrôles de conformité » reste libre.

**Faits de juin revérifiés :**

| Fait | État |
| --- | --- |
| Consortium DEEP + OVHcloud + Clever Cloud retenu par la Commission, plafond 180 M€ sur 6 ans | Confirmé (annonce du 17 avril 2026). Le marché est attribué à quatre fournisseurs, pas au seul consortium |
| Coolify sous Apache 2.0 | Confirmé. v4.0.0 stable sortie le 27 avril 2026 |
| Dokploy open-source | À nuancer : open-core depuis janvier 2026 (Apache 2.0 + dossier `/proprietary` sous licence source-available) |
| S'appuyer sur Nixpacks pour la détection | **Périmé** : Nixpacks est en maintenance, son successeur est Railpack, que Coolify propose en bêta |

## 10. À vérifier avant ou pendant le développement

- Disponibilité du nom `epsylon` sur npm et GitHub.
- Ce que l'API de Coolify v4 permet réellement (création d'application à partir d'un Compose, variables
  d'environnement, domaines) : conditionne la conception de `deploy`.
- Railpack : sa détection est-elle réutilisable comme bibliothèque ou en sous-processus, ou faut-il une
  détection maison limitée à Next.js ?
- Format des skills d'agent (agentskills.io) : publier plus tard un skill qui enveloppe le CLI ?
