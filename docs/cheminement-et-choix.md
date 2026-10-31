# Epsylon — cheminement de recherche et choix final

> Synthèse d'une discussion exploratoire (juin → octobre 2026) sur les outils à développer
> pour la souveraineté numérique française / européenne.
> Objectif de ce document : pouvoir reprendre le travail sur une autre machine sans perdre le fil.

---

## 1. Point de départ

**Question initiale :** en tant que développeur français, dans le contexte géopolitique actuel,
quels outils informatiques développer pour réduire la dépendance européenne aux acteurs américains ?

---

## 2. Cartographie de la dépendance

La dépendance aux USA se répartit sur 5 couches, de la plus profonde à la plus visible :

1. **Infrastructure / cloud** : AWS, Azure, GCP.
2. **Identité & authentification** : connexion via Google, Apple ou Microsoft.
3. **Données & IA** : lieu de stockage des données, lieu d'exécution des modèles.
4. **Productivité / collaboration** : Google Workspace, Microsoft 365, Slack, Zoom.
5. **Applicatif grand public** : recherche, navigateurs, réseaux sociaux, magasins d'applications.

**Premier constat :** un développeur seul ne va pas « refaire AWS ». Le levier réaliste, c'est de
construire des **briques applicatives et des intégrations** au-dessus de fondations déjà souveraines
(Scaleway, OVHcloud, Clever Cloud, Outscale).

---

## 3. Pistes envisagées

| Niveau | Pistes |
| --- | --- |
| Solo / side-project | SDK et outillage développeur pour les clouds souverains ; packaging d'alternatives self-hostées (Matrix, Jitsi, Nextcloud, Vaultwarden, Matomo) ; middleware « RGPD-by-design » |
| Petite équipe | Suite collaborative européenne (ou contribution à *Docs*, porté par la France et l'Allemagne) ; gateway IA souveraine (Mistral, modèles ouverts) ; RAG on-premise (Mistral + Qdrant) |
| Ambitieux | Écosystème du portefeuille d'identité européen (eIDAS 2.0 / EU Digital Identity Wallet) ; plateformes open-source pour le secteur public |

**Classement impact/effort retenu à ce stade :**

1. **Outillage développeur (DX) pour les clouds souverains** ← piste choisie pour approfondissement
2. Gateway IA + RAG souverain (Mistral / Qdrant)
3. Contribution à l'écosystème EU Wallet

Principe directeur : **ne pas réinventer**. Contribuer à l'existant, le packager, et combler les
manques d'outillage et d'intégration.

---

## 4. Approfondissement de la piste 1 : état du marché (juin 2026)

Le constat de départ était trompeur : une partie de la piste 1 est **déjà couverte**.

### a) PaaS souverain managé : couvert

- **Clever Cloud** (Nantes) propose déjà le « `git push` → production » sur des infrastructures
  OVH, Scaleway, Outscale et Cloud Temple.
- En avril 2026, le consortium **OVHcloud + Clever Cloud + DEEP** a remporté l'appel d'offres de la
  Commission européenne pour le cloud souverain des institutions (environ 180 M€).
- → Le « Vercel souverain managé » existe et il est financé. Inutile de s'y attaquer.

### b) PaaS self-hosted open-source : en pleine croissance

- **Coolify** (Apache 2.0, environ 280 services installables en un clic, serveur MCP) et **Dokploy**
  (plus léger, Docker Swarm + Traefik) sont devenus les alternatives standard à Vercel ou Heroku sur
  son propre serveur.
- Les MCP Coolify et Dokploy sont déjà configurés dans l'environnement Cursor du projet.

**Conclusion :** ne pas refaire de PaaS. La valeur se trouve dans **la glu, les intégrations et la
conformité**.

> ⚠️ Ces faits de marché datent de juin 2026. À revérifier avant toute décision engageante.

---

## 5. Les manques identifiés

| # | Manque | Ce qu'il faudrait construire |
| --- | --- | --- |
| 1 | Coolify et Dokploy ne sont pas « sovereign-native » : les tutoriels visent Hetzner, rarement Scaleway, OVH ou Outscale et leurs spécificités (SecNumCloud, HDS, réseau privé, stockage S3 maison) | Un connecteur qui provisionne serveur, stockage, DNS et sauvegardes chez un hébergeur français, puis branche Coolify ou Dokploy dessus |
| 2 | Aucun stack « conforme par défaut » prêt à l'emploi | Des **blueprints** (Compose / Nixpacks) avec chiffrement au repos, localisation des données garantie, registre RGPD pré-rempli, rétention des logs |
| 3 | Migrer de Vercel / Netlify / Supabase / PlanetScale vers une infra française est pénible (variables d'environnement, edge functions, base de données, DNS) | Un **CLI de migration** qui analyse le projet et génère la configuration Coolify/Dokploy ainsi qu'un plan de bascule DNS et base de données |
| 4 | Chaque hébergeur a son propre CLI, sans interface commune | Un CLI unifié multi-cloud (`sov deploy`). Surface trop large, donc risqué |

---

## 6. Choix final

**Combiner le manque 3 (migration) et le manque 2 (blueprints conformes).**

### Pourquoi cette combinaison

- C'est le meilleur rapport **douleur réelle / effort**.
- La boucle d'adoption est naturelle : chaque migration réussie produit un exemple ou un article.
- Pas de concurrence frontale avec Clever Cloud ou Coolify : l'outil **facilite leur adoption**, ils
  ont donc intérêt à le relayer.
- Bon timing : départs du cloud US, RGPD, DORA et NIS2 (réglementations européennes).

### Le produit

> Un CLI open-source qui prend un projet web existant, détecte sa stack et génère tout ce qu'il faut
> pour le déployer sur une infrastructure souveraine via Coolify ou Dokploy, avec un blueprint conforme
> au RGPD par défaut.

Nom de travail du CLI : `sovship` (provisoire), dans le projet **Epsylon**.

### MVP (4 à 6 semaines en side-project)

| Étape | Commande | Rôle | Critère de réussite |
| --- | --- | --- | --- |
| 1 | `sov init` | Analyse le dépôt (framework, variables d'environnement, base de données) | Détecte correctement un projet Next.js + Postgres |
| 2 | `sov plan` | Génère `docker-compose` et la configuration Coolify/Dokploy | `docker compose up` fonctionne en local |
| 3 | `sov check` | Audit de conformité (localisation, secrets, TLS) | Produit un rapport RGPD lisible |
| 4 | `sov deploy` | Pousse vers une instance Coolify ou Dokploy | Application en ligne avec HTTPS |

### Stack technique envisagée

- **Langage :** Go (binaire unique, facile à distribuer), ou TypeScript avec `clack` / `oclif`.
- **Détection de stack :** lecture de `package.json`, `next.config.*`, `Dockerfile`, lockfiles ;
  s'appuyer sur la logique de **Nixpacks** plutôt que la réécrire.
- **Déploiement :** API REST de Coolify et/ou Dokploy (prototypable via les MCP avant d'écrire le client).
- **Conformité :** règles déclaratives en YAML → rapport.
- **Distribution :** Homebrew, `npx` / `go install`, documentation en français et en anglais.

### Monétisation possible (plus tard)

Version « teams » (audit avancé, multi-projets, support) ou édition managée.

---

## 7. Questions ouvertes

- **Go ou TypeScript** pour le CLI ?
- **Coolify, Dokploy, ou les deux** dès le MVP ? (Commencer par un seul réduit le périmètre.)
- **Première source de migration** à supporter : Vercel seul ? Vercel + Supabase ?
- Nom définitif du CLI (`sovship` est provisoire).

---

## 8. Prochaines étapes

1. Rédiger le mini-cahier des charges de `sov init` et `sov check` : commandes, format du blueprint,
   règles de conformité.
2. Tester en direct les MCP Coolify et Dokploy pour voir ce que leurs API exposent réellement.
3. Revérifier l'état du marché (section 4) et chercher des projets concurrents apparus depuis juin 2026.
