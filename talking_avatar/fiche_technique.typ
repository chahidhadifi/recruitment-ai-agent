#set document(title: "Fiche Technique - Plateforme de Recrutement IA", author: "Gemini AI")
#set page(numbering: "1 / 1")
#set text(font: "Linux Libertine", lang: "fr")

#show outline: set text(weight: "bold")

#let TitlePage = {
  align(center)[
    #text(size: 24pt, weight: "bold")[Fiche Technique]
    #v(1cm)
    #text(size: 32pt, weight: "bold")[Plateforme de Recrutement IA]
    #v(1.5cm)
    #image("public/images/h_color.webp", width: 15%)
    #v(1.5cm)
    #text(size: 16pt)[Une analyse technique complète de l'application full-stack.]
    #v(1cm)
    #line(length: 100%)
    #v(1cm)
    #grid(
      columns: (1fr, 1fr),
      gutter: 1cm,
      [
        *Auteur:* Gemini AI
      ],
      [
        *Date:* #datetime.today().display("[day] [month repr:long] [year]")
      ],
    )
  ]
}

// Display the title page
#TitlePage

#pagebreak()

// Outline of the document
#outline(title: "Table des matières", depth: 2)

#pagebreak()

= Introduction et Architecture

== Objectif du Projet
Ce document détaille l'architecture technique de la "Plateforme de Recrutement IA". L'objectif de cette application est de moderniser et d'automatiser le processus de recrutement en utilisant une interface web moderne et un backend robuste. La plateforme permet aux recruteurs de gérer les offres d'emploi, d'analyser les candidatures et de mener des entretiens assistés par une intelligence artificielle.

== Architecture Générale
L'application est conçue sur une architecture client-serveur découplée :

- #strong[Frontend:] Une application web monopage (SPA) développée avec #text(blue)[Next.js] et #text(blue)[React]. Elle est responsable de l'interface utilisateur et de l'expérience globale.
- #strong[Backend:] Une API RESTful développée avec #text(green)[FastAPI] (Python), qui gère toute la logique métier, les interactions avec la base de données et l'authentification.
- #strong[Base de données:] Une base de données relationnelle #text(purple)[PostgreSQL] est utilisée pour la persistance des données, gérée via l'ORM #text(purple)[SQLAlchemy].
- #strong[Déploiement:] Le projet est entièrement conteneurisé avec #text(aqua)[Docker], facilitant le déploiement et la mise à l'échelle.

#align(center)[
  #block(
    stroke: 1pt,
    inset: 10pt,
    radius: 4pt,
    width: 80%,
    [
      #align(center)[*Diagramme d'Architecture Simplifié*]
      #v(1em)
      #stack(
        dir: ttb,
        align: center,
        spacing: 0.6em,
        text(size: 14pt)[Navigateur Client],
        text(size: 20pt)[↓],
        text(size: 14pt)[Frontend (Next.js)],
        text(size: 12pt)[API REST (JSON)],
        text(size: 20pt)[↕],
        text(size: 14pt)[Backend (FastAPI)],
        text(size: 20pt)[↓],
        text(size: 14pt)[Base de Données (PostgreSQL)],
      )
    ]
  )
]

== Technologies Clés

#table(
  columns: (1fr, 2fr, 2fr),
  stroke: 0.5pt,
  [*Composant*], [*Technologie*], [*Description*],
  [Frontend], [Next.js, React, TypeScript, Three.js], [Framework pour le rendu côté serveur et la génération de sites statiques. moteur 3D pour l'avatar.],
  [Backend], [FastAPI, Python], [Framework web haute performance pour la création d'API.],
  [Base de Données], [PostgreSQL, SQLAlchemy], [Système de gestion de base de données relationnelle-objet et ORM Python.],
  [Style & UI], [Tailwind CSS, Shadcn/UI], [Framework CSS "utility-first" et collection de composants React.],
  [Automatisation], [N8N], [Outil d'automatisation des flux de travail.],
  [Conteneurisation], [Docker], [Plateforme pour développer, déployer et exécuter des applications dans des conteneurs.]
)

#pagebreak()

= Spécifications du Backend

== Vue d'overview
Le backend est une API RESTful construite en Python avec le framework FastAPI. Il est conçu pour être performant, facile à utiliser et à documenter (grâce à la génération automatique de la documentation OpenAPI).

== Structure des Fichiers
La structure du backend est modulaire pour une meilleure organisation :
- `app/main.py`: Point d'entrée de l'application FastAPI, définition des routes principales.
- `app/database.py`: Configuration de la connexion à la base de données SQLAlchemy.
- `app/models.py`: Définition des modèles de données (tables de la base de données).
- `app/schemas.py`: Définition des schémas Pydantic pour la validation des données d'API.
- `requirements.txt`: Liste des dépendances Python.

== Modèles de Données (SQLAlchemy)
La base de données est structurée autour des entités suivantes :
- `User`: Utilisateurs de la plateforme (candidats, recruteurs, administrateurs).
- `Job`: Offres d'emploi publiées par les recruteurs.
- `JobApplication`: Candidatures soumises par les candidats.
- `Interview`: Entretiens (potentiellement automatisés).
- `Question`: Questions posées durant un entretien.
- `Message`: Échanges de messages durant l'entretien (texte, audio).
- `RecruiterProfile` & `CandidateProfile`: Profils détaillés pour les recruteurs et candidats.

#figure(
  table(
    columns: 2,
    [*Relation*], [*Description*],
    [User -> Profile], [Un utilisateur a un profil (Candidat ou Recruteur).],
    [Recruiter -> Job], [Un recruteur peut publier plusieurs offres d'emploi.],
    [Job <-> Candidate], [Relation plusieurs-à-plusieurs via `JobApplication`.]
  ),
  caption: [Relations principales entre les modèles de données.]
)

== Endpoints de l'API
L'API expose des ressources RESTful pour gérer les différentes entités.

- `/api/users/`: CRUD pour la gestion des utilisateurs.
- `/api/jobs/`: CRUD pour les offres d'emploi.
- `/api/applications/`: Gestion des candidatures.
- `/api/interviews/`: Planification et suivi des entretiens.
- `/auth/...`: Endpoints pour l'authentification (gérés en partie par `NextAuth.js` côté client).

== Dépendances Majeures
- `fastapi`: Le framework web.
- `uvicorn`: Serveur ASGI pour FastAPI.
- `sqlalchemy`: ORM pour l'interaction avec la base de données.
- `psycopg2-binary`: Driver PostgreSQL pour Python.
- `pydantic`: Validation des données.

#pagebreak()

= Spécifications du Frontend

== Vue d'overview
Le frontend est une application web interactive et réactive construite avec Next.js et TypeScript. Elle utilise le "App Router" de Next.js pour une architecture basée sur les fichiers et une navigation optimisée.

== Structure des Fichiers
- `src/app/`: Contient les pages et les layouts de l'application.
  - `(pages)/dashboard/`: Routes protégées du tableau de bord.
  - `(pages)/jobs/`: Pages relatives aux offres d'emploi.
  - `layout.tsx`: Layout principal de l'application.
  - `page.tsx`: Page d'accueil.
- `src/components/`: Composants React réutilisables (UI, formulaires, etc.).
- `src/lib/`: Fonctions utilitaires, logique d'appel à l'API.
- `src/types/`: Définitions des types TypeScript.
- `package.json`: Dépendances et scripts du projet.

== Interface Utilisateur (UI)
L'interface est construite avec une approche moderne :
- #strong[Tailwind CSS:] Pour un style rapide et personnalisable directement dans le balisage.
- #strong[Shadcn/UI:] Une collection de composants React magnifiquement conçus et accessibles, basés sur Radix UI.
- #strong[ThemeProvider:] Permet de basculer entre un thème clair et un thème sombre.
- #strong[Lucide Icons:] Pour des icônes claires et cohérentes.

== Fonctionnalités Clés
- #strong[Authentification:] Inscription et connexion des utilisateurs via `NextAuth.js`, qui s'intègre avec le backend pour la validation des informations d'identification.
- #strong[Tableau de bord:] Différents tableaux de bord pour les candidats et les recruteurs, affichant des informations pertinentes.
- #strong[Gestion des Emplois:] Création, affichage, et recherche d'offres d'emploi.
- #strong[Processus de Candidature:] Formulaires permettant aux candidats de postuler aux offres.
- #strong[Interface d'Entretien:] Interface pour les entretiens automatisés, capable de gérer des messages texte et audio.
- #strong[Avatar Parlant:] Un avatar 3D interactif qui guide les utilisateurs et fournit des informations.

== Dépendances Majeures
- `next`: Le framework React.
- `react` & `react-dom`: La bibliothèque de base pour l'UI.
- `typescript`: Pour un typage statique du code.
- `tailwindcss`: Le framework CSS.
- `@radix-ui/*` & `shadcn/ui`: Pour les composants d'interface.
- `next-auth`: Pour la gestion de l'authentification.
- `zod` & `react-hook-form`: Pour la validation robuste des formulaires.
- `three`: Moteur 3D pour le rendu de l'avatar.
- `@react-three/fiber`: Un pont entre React et Three.js.
- `@react-three/drei`: Une collection d'assistants et de composants utiles pour `react-three/fiber`.
