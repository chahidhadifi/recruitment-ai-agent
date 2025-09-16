# Architecture de la liaison entre le Backend et le Frontend

## Vue d'ensemble

Cette architecture établit une liaison robuste entre le backend FastAPI et le frontend Next.js, permettant une communication fluide et typée entre les deux parties de l'application.

## Structure des fichiers

```
src/lib/
├── api/
│   ├── index.ts             # Point d'entrée exportant tous les services API
│   ├── jobs.ts              # Service API pour les offres d'emploi
│   ├── applications.ts      # Service API pour les candidatures
│   ├── interviews.ts        # Service API pour les entretiens
│   ├── messages.ts          # Service API pour les messages d'entretien
│   ├── questions.ts         # Service API pour les questions d'entretien
│   └── users.ts             # Service API pour les utilisateurs
├── api.ts                   # Service API principal avec les méthodes HTTP de base
└── hooks/
    ├── index.ts             # Point d'entrée exportant tous les hooks
    └── useApi.ts            # Hooks personnalisés pour faciliter l'utilisation des API
```

## Fonctionnalités principales

### 1. Service API central (`api.ts`)

- Fournit des méthodes HTTP de base (GET, POST, PUT, PATCH, DELETE)
- Gère automatiquement les erreurs et les réponses
- Utilise l'URL de base configurée dans les variables d'environnement

### 2. Services API spécifiques

- Chaque entité (jobs, applications, interviews, etc.) a son propre service API
- Les méthodes sont fortement typées pour une meilleure sécurité et autocomplétion
- Les services encapsulent la logique métier spécifique à chaque entité

### 3. Hooks personnalisés

- `useApi`: Hook pour exécuter des requêtes API à la demande
- `useApiData`: Hook pour charger des données au montage du composant

## Utilisation

### Exemple d'utilisation directe des services API

```typescript
import { jobsApi } from '@/lib/api';

async function loadJobs() {
  try {
    const jobs = await jobsApi.getAll();
    console.log(jobs);
  } catch (error) {
    console.error('Erreur lors du chargement des offres:', error);
  }
}
```

### Exemple d'utilisation des hooks

```typescript
import { useApiData } from '@/lib/hooks';
import { jobsApi } from '@/lib/api';

function JobsList() {
  const { data: jobs, loading, error } = useApiData(jobsApi.getAll, [], []);
  
  if (loading) return <p>Chargement...</p>;
  if (error) return <p>Erreur: {error.message}</p>;
  
  return (
    <ul>
      {jobs?.map(job => (
        <li key={job.id}>{job.title}</li>
      ))}
    </ul>
  );
}
```

## Configuration

La configuration de l'URL de base de l'API se fait via la variable d'environnement `NEXT_PUBLIC_API_URL` dans le fichier `.env.local` du frontend :

```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

En production, cette URL doit pointer vers l'URL publique de votre API backend.

## Gestion des erreurs

Les erreurs sont gérées de manière cohérente à travers l'application grâce à la classe `ApiError` personnalisée, qui capture le statut HTTP et les détails de l'erreur renvoyés par le backend.

## Bonnes pratiques

1. Toujours utiliser les services API plutôt que d'appeler fetch directement
2. Utiliser les hooks personnalisés pour simplifier la gestion des états (chargement, erreur)
3. Typer correctement les données d'entrée et de sortie des fonctions API
4. Gérer les erreurs de manière appropriée dans les composants