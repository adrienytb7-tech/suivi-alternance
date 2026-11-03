# AlternanceTracker — Suivi de Candidatures (Adrien Bechu)

Application web personnelle de gestion et de suivi des candidatures en alternance (**Systèmes, Réseaux, Cloud & Cybersécurité** — Nantes / Angers / Pays de la Loire).

Pré-chargée avec l'intégralité de tes **81 candidatures réelles** mises à jour au **03/11/2026** (MICROEJ, P.A. Cotte, Adista, Brioche Pasquier, Tibco, Sigma, Dynamips, Cheops Technology, CHU d'Angers, CNP Assurances, Lengow, LACROIX, etc.).

---

## Stack Technique

- **Framework** : Next.js 14 (App Router) + TypeScript strict
- **Style & UI** : Tailwind CSS, variables de thème inspirées de `shadcn/ui`, icônes `lucide-react`, mode clair / sombre (`next-themes`)
- **Formulaires & Validation** : `react-hook-form` + `zod`
- **Visualisation** : `recharts` (évolution hebdomadaire des candidatures)
- **Stockage** : `localStorage` par défaut via l'interface `ApplicationStorageRepository` (`src/lib/storage/adapter.ts`), prête à basculer vers **Supabase**

---

## Fonctionnalités Incluses

1. **Tableau de bord (`/`)**
   - Statistiques clés en temps réel : Total pistes (81), En attente, Entretiens, Offres, Refus, Taux de réponse (%)
   - Graphique d'évolution des démarches par semaine
   - **Focus Actions Prioritaires** : inscription plateforme MStaff CHU d'Angers + les candidatures dont l'email a rebondi (erreur 550 / blocage serveur) à repasser via portail carrière
   - **Liste des relances à effectuer** : candidatures au statut *Envoyée* sans réponse depuis plus de 10 jours avec bouton d'action rapide *« Relancer »*
2. **Liste des candidatures & Kanban (`/candidatures`)**
   - **Vue Tableau** filtrable et triable par entreprise, poste, ville (Nantes & Agglo, Angers & Agglo, Autres), statut, canal/source et date
   - Filtre rapide **« Mails 550 / Actions portail requises »**
   - **Vue Kanban** avec glisser-déposer (Drag & Drop) entre les 7 colonnes de statut (`À postuler`, `Envoyée`, `Relancée`, `Entretien`, `Offre reçue`, `Acceptée`, `Refusée`)
3. **Fiche détaillée (Tiroir latéral)**
   - Coordonnées du contact (Jérôme Leroux, Jordan Trochu, Margot Cathelineau, etc.), lien direct vers l'offre ou `mailto:`
   - Documents envoyés (version du CV, lettre de motivation)
   - Changement rapide de statut en 1 clic
   - **Timeline / Historique des échanges** horodaté avec ajout de notes libres
4. **Import / Export**
   - Export **CSV** (compatible Excel avec encodage UTF-8 BOM)
   - Export **JSON** complet et Import **JSON**
   - Bouton de restauration de ta base de référence du `03/11/2026`

---

## Installation & Lancement en local

### Prérequis
Assure-toi d'avoir **Node.js (v18.17+ ou v20 LTS)** installé sur ta machine ([télécharger Node.js](https://nodejs.org/)).

### Étapes
```bash
# 1. Installer les dépendances
npm install

# 2. Lancer le serveur de développement
npm run dev
```

Ouvre ensuite [http://localhost:3000](http://localhost:3000) dans ton navigateur.

---

## Déploiement sur Vercel

1. Pousse ce dossier sur un dépôt GitHub / GitLab privé.
2. Connecte-toi sur [vercel.com](https://vercel.com/) et clique sur **Add New Project**.
3. Importe ton dépôt : Vercel détecte automatiquement **Next.js**.
4. Clique sur **Deploy** (aucune variable d'environnement n'est requise tant que tu utilises le stockage `localStorage`).

---

## Migration future vers Supabase

1. Crée un projet sur [supabase.com](https://supabase.com/).
2. Exécute le script SQL fourni dans `supabase/schema.sql` depuis l'éditeur SQL Supabase.
3. Implémente une classe `SupabaseApplicationRepository` respectant l'interface `ApplicationStorageRepository` dans `src/lib/storage/adapter.ts`.
