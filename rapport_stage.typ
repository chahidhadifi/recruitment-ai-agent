= REMERCIEMENTS

Je tiens à exprimer ma profonde gratitude à l’ensemble des personnes qui ont contribué à la réussite de ce stage. Mes remerciements vont tout particulièrement à M. Mohammed Hajji Zaher, Chef de la division, pour son encadrement, ses conseils avisés et sa disponibilité tout au long de cette expérience. Je remercie également toute l’équipe du Laboratoire National des Ressources Numériques pour leur accueil chaleureux, leur soutien et leur collaboration. Enfin, je remercie ma famille et mes amis pour leur encouragement et leur confiance.

= DÉDICACES

Ce travail est dédié à ma famille, pour son soutien inconditionnel, à mes amis pour leur motivation et à tous ceux qui croient en l’innovation et la transformation digitale.

= RÉSUMÉ

Ce rapport présente le projet d’automatisation du processus de recrutement au sein du Laboratoire National des Ressources Numériques. Réalisé dans le cadre d’un stage encadré par M. Mohammed Hajji Zaher, Chef de la division, ce projet vise à concevoir et développer une plateforme intelligente intégrant un agent IA interactif. L’objectif est de faciliter la gestion des candidatures, d’optimiser les entretiens et d’améliorer l’expérience utilisateur pour les candidats et les recruteurs. Le rapport détaille le contexte, la problématique, les objectifs, la méthodologie adoptée, ainsi que les résultats obtenus et les perspectives d’évolution.

= ABSTRACT

This report presents the project of automating the recruitment process at the Laboratoire National des Ressources Numériques. Conducted as part of an internship supervised by Mr. Mohammed Hajji Zaher, Head of Division, the project aims to design and develop an intelligent platform integrating an interactive AI agent. The main goal is to facilitate the management of applications, optimize interviews, and enhance the user experience for both candidates and recruiters. The report details the context, the problem statement, the objectives, the adopted methodology, as well as the results and future perspectives.

= INTRODUCTION GÉNÉRALE

Ce rapport détaille le contexte du stage, la problématique rencontrée, les objectifs fixés, la méthodologie de travail adoptée et le plan du rapport.

== 1.1 Contexte du stage
Le Laboratoire National des Ressources Numériques (LNRN) est un organisme public dédié à la transformation digitale et à la gestion des ressources numériques. Dans un contexte marqué par une digitalisation croissante et une augmentation du nombre de candidatures, le laboratoire a exprimé le besoin d’optimiser et d’automatiser son processus de recrutement. Ce projet de stage s’inscrit dans une démarche d’innovation visant à intégrer l’intelligence artificielle pour améliorer l’efficacité et la qualité du recrutement.

== 1.2 Problématique
Le processus de recrutement traditionnel présente plusieurs limites : gestion manuelle des candidatures, délais importants, risques d’erreurs et manque d’interactivité. La problématique centrale est donc : comment automatiser efficacement le processus de recrutement tout en garantissant l’équité, la rapidité et la qualité de sélection des candidats ? L’intégration d’un agent IA interactif doit permettre de répondre à ces enjeux tout en assurant la confidentialité et la sécurité des données.

== 1.3 Objectifs du stage
- Automatiser la gestion des candidatures pour réduire les tâches répétitives et les délais de traitement
- Intégrer un agent IA interactif capable de mener des entretiens préliminaires et d’évaluer les candidats
- Centraliser les données et faciliter le suivi des candidatures et des entretiens
- Améliorer l’expérience utilisateur pour les candidats (simplicité, rapidité, transparence) et pour les recruteurs (outils d’aide à la décision, tableaux de bord)

== 1.4 Méthodologie de travail
La méthodologie adoptée repose sur plusieurs étapes clés :
- Analyse des besoins auprès des utilisateurs et des parties prenantes
- Conception technique et fonctionnelle de la plateforme (architecture, choix des technologies)
- Développement des différents modules : frontend, backend, agent IA
- Mise en place de tests unitaires et d’intégration pour garantir la fiabilité
- Validation avec les utilisateurs et documentation complète du projet

== 1.5 Plan du rapport
Le rapport est structuré en huit parties principales :
1. Présentation du lieu de stage
2. Analyse des besoins et cahier des charges
3. Conception du système
4. Développement et implémentation
5. Tests, validation et documentation
6. Résultats et discussion
7. Conclusion et perspectives
8. Annexes détaillées

= PRÉSENTATION DU LIEU DE STAGE

== 2.1 Historique de l’entreprise
[Place réservée pour l'historique, à compléter avec les documents PDF]

== 2.2 Activité principale
Le Laboratoire National des Ressources Numériques (LNRN) est un organisme public marocain, placé sous la tutelle du Ministère de la Transition Numérique et de la Réforme de l'Administration. Sa mission principale est d'accompagner les administrations publiques dans leur transformation digitale. Le laboratoire se consacre à la gestion, l'archivage et la valorisation des ressources numériques nationales. Il joue un rôle de premier plan dans la modernisation de l'État en favorisant l'adoption de solutions technologiques innovantes et en mutualisant les infrastructures et les compétences.

Le LNRN intervient sur des projets stratégiques visant à améliorer l'efficacité des services publics, à simplifier les procédures administratives et à garantir la souveraineté numérique du Royaume. Ses activités couvrent un large spectre, allant du conseil en architecture des systèmes d'information à la mise en œuvre de plateformes mutualisées, en passant par la sécurité des systèmes d'information et la formation des agents publics.

== 2.3 Organigramme
[Place réservée pour l'organigramme, à compléter avec les fichiers PDF]

== 2.4 Services et départements
L'organisation du LNRN reflète la diversité de ses missions. On y trouve notamment :
- *La Division de la Transformation Digitale :* chargée de piloter les projets de modernisation et d'accompagner les administrations dans la refonte de leurs processus.
- *La Division des Infrastructures et des Services Cloud :* responsable de la gestion des datacenters, des réseaux et des services d'hébergement.
- *La Division de la Sécurité des Systèmes d'Information :* qui veille à la protection du patrimoine informationnel de l'État.
- *La Division des Ressources Humaines et des Affaires Administratives :* qui inclut le service de recrutement, au cœur de ce projet de stage.
- *Le service informatique interne :* qui assure le bon fonctionnement des outils et des systèmes d'information du laboratoire.

= ANALYSE DES BESOINS ET CAHIER DES CHARGES

L'objectif de cette phase est de définir précisément le périmètre du projet, d'identifier les attentes des utilisateurs et de traduire ces besoins en spécifications techniques et fonctionnelles claires. Une analyse rigoureuse est indispensable pour garantir que la solution développée réponde parfaitement à la problématique initiale.

== 3.1 Contexte et Problématique
Le processus de recrutement du LNRN, bien que fonctionnel, présentait plusieurs axes d'amélioration qui ont motivé ce projet. Le traitement manuel d'un volume croissant de candidatures entraînait des délais de réponse importants et mobilisait un temps considérable pour les équipes RH. L'absence d'une plateforme centralisée rendait le suivi des dossiers complexe et augmentait le risque de perte d'informations.

De plus, le processus manquait d'outils modernes pour l'évaluation objective des compétences et pour offrir une expérience candidat engageante et interactive. La problématique peut donc se résumer ainsi : *Comment transformer le processus de recrutement en un système intégré, intelligent et efficace, capable de gérer l'ensemble du cycle de vie d'une candidature, de sa soumission à la décision finale, tout en valorisant l'image d'employeur innovant du LNRN ?*

== 3.2 Étude des besoins fonctionnels
L'analyse des besoins a été menée à travers des entretiens avec les recruteurs du LNRN et l'étude des processus existants. Les besoins fonctionnels clés identifiés sont les suivants :

- *Gestion centralisée des candidatures :* Avoir une base de données unique pour toutes les candidatures, permettant de rechercher, filtrer et trier les profils selon divers critères (compétences, expérience, etc.).
- *Automatisation des entretiens de présélection :* Mettre en place un système d'entretiens menés par une IA pour effectuer une première évaluation objective des candidats, sur la base de questions prédéfinies.
- *Sécurité et confidentialité des données :* Garantir la conformité avec les réglementations en vigueur (loi 09-08 sur la protection des données personnelles au Maroc) et assurer que seules les personnes autorisées puissent accéder aux informations sensibles.
- *Interface intuitive pour tous les acteurs :* Développer des interfaces claires et faciles à utiliser, adaptées aux différents profils d'utilisateurs (candidats, recruteurs, administrateurs).
- *Suivi en temps réel :* Permettre aux candidats de suivre l'état de leur candidature et aux recruteurs de visualiser l'avancement de chaque processus de recrutement.

== 3.3 Étude des besoins non-fonctionnels
Au-delà des fonctionnalités, la performance et la qualité du système sont primordiales.
- *Performance :* Le système doit garantir des temps de réponse rapides, même avec un grand nombre d'utilisateurs simultanés. Le chargement des pages et le traitement des requêtes doivent être optimisés.
- *Sécurité :* L'application doit être protégée contre les vulnérabilités courantes (injections SQL, XSS, CSRF). L'authentification doit être robuste et les mots de passe chiffrés.
- *Scalabilité :* L'architecture doit permettre une montée en charge facile, que ce soit pour supporter un plus grand nombre de candidatures ou pour ajouter de nouvelles fonctionnalités à l'avenir.
- *Maintenabilité :* Le code doit être propre, modulaire, bien documenté et suivre les meilleures pratiques de développement pour faciliter les évolutions et la correction de bugs.
- *Compatibilité :* L'interface utilisateur doit être accessible et fonctionnelle sur les principaux navigateurs web (Chrome, Firefox, Safari, Edge) et sur différents types d'appareils (ordinateurs, tablettes, smartphones).

== 3.4 Acteurs du système
Le système est conçu pour interagir avec trois types d'acteurs principaux, chacun ayant des droits et des fonctionnalités spécifiques.

=== 3.4.1 Candidats
Le candidat est au cœur du processus. Il doit pouvoir interagir avec la plateforme de manière simple et transparente.
- *Accès :* Création de compte, connexion, réinitialisation de mot de passe.
- *Gestion de profil :* Dépôt et mise à jour de CV, remplissage d'un formulaire de profil détaillé.
- *Consultation et candidature :* Recherche d'offres d'emploi, consultation des détails et soumission de candidature.
- *Suivi :* Consultation de l'état d'avancement de ses candidatures (reçue, en cours d'évaluation, entretien planifié, etc.).
- *Entretiens automatisés :* Interaction avec l'agent IA pour les entretiens de présélection.

=== 3.4.2 Recruteurs
Les recruteurs utilisent la plateforme comme leur principal outil de travail pour gérer l'ensemble du processus.
- *Gestion des offres :* Création, publication, modification et archivage des offres d'emploi.
- *Gestion des candidatures :* Consultation des profils des candidats, tri et filtrage, ajout de commentaires et d'évaluations.
- *Organisation des entretiens :* Planification des entretiens (automatisés ou physiques), envoi des invitations aux candidats.
- *Validation des profils :* Prise de décision sur les candidatures (rejet, validation pour l'étape suivante).
- *Tableau de bord :* Vue d'ensemble des processus en cours, statistiques sur les recrutements.

=== 3.4.3 Administrateurs
Les administrateurs ont un accès complet au système pour en assurer la gestion globale et la maintenance.
- *Gestion des utilisateurs :* Création et gestion des comptes recruteurs et administrateurs.
- *Paramétrage global :* Configuration des paramètres de l'application (par exemple, les questions pour les entretiens IA).
- *Supervision et logs :* Surveillance de l'activité du système, consultation des journaux d'événements pour le débogage et la sécurité.
- *Maintenance :* Gestion des sauvegardes de la base de données, mise à jour de l'application.

== 3.5 Cahier des charges fonctionnel
Ce document formalise les fonctionnalités attendues pour chaque module de la plateforme.

#table(
  columns: (1fr, 3fr),
  stroke: 0.5pt,
  [*Module*], [*Fonctionnalités attendues*],
  [Authentification et Gestion des Rôles], [
    - Inscription et connexion sécurisées pour tous les rôles.
    - Gestion des sessions utilisateur via des tokens JWT.
    - Protection des routes et des accès en fonction du rôle (Candidat, Recruteur, Administrateur).
  ],
  [Gestion des Offres d'Emploi], [
    - Création d'offres avec un éditeur de texte riche.
    - Publication, dépublication et archivage des offres.
    - Recherche et filtrage des offres par les candidats.
  ],
  [Gestion des Candidatures], [
    - Formulaire de candidature simple avec téléversement de CV.
    - Suivi de l'état de la candidature en temps réel.
    - Tableau de bord pour les recruteurs avec la liste des candidats par offre.
  ],
  [Entretiens Automatisés avec IA], [
    - Interface d'entretien interactive avec un avatar 3D.
    - Banque de questions configurable par les administrateurs.
    - Enregistrement des réponses des candidats (texte ou audio).
    - Première analyse et scoring des réponses par l'IA (perspective).
  ],
  [Tableau de Bord], [
    - Vue personnalisée pour chaque rôle.
    - Statistiques clés pour les recruteurs (nombre de candidatures, temps moyen de recrutement).
    - Historique des activités pour les candidats.
  ],
)

== 3.6 Cahier des charges technique
Ce document spécifie les choix technologiques et les contraintes techniques du projet.

- *Architecture Frontend :* Application monopage (SPA) développée avec *Next.js* (React) en *TypeScript*. Le "App Router" sera utilisé pour une architecture basée sur les fichiers. Le style sera géré par *Tailwind CSS* et les composants proviendront de la bibliothèque *Shadcn/UI*.
- *Architecture Backend :* API RESTful développée avec *FastAPI* (Python 3.11+). La communication avec la base de données se fera via l'ORM *SQLAlchemy 2.0* (en mode asynchrone). La validation des données sera assurée par *Pydantic*.
- *Base de Données :* *PostgreSQL* sera le système de gestion de base de données, choisi pour sa robustesse et ses fonctionnalités avancées.
- *Agent IA et Avatar :* L'avatar 3D sera rendu côté client avec *Three.js* et *@react-three/fiber*. Le dialogue sera géré par un backend dédié en *Node.js* avec *Express.js*, qui interagira avec des services de traitement du langage naturel (NLP) et de synthèse vocale (TTS).
- *Authentification :* La gestion de l'authentification côté client sera facilitée par *NextAuth.js*, tandis que le backend utilisera un système de tokens *JWT* pour sécuriser les endpoints de l'API.
- *Conteneurisation et Déploiement :* L'ensemble de l'application (frontend, backend, base de données) sera conteneurisé avec *Docker* et orchestré via *docker-compose.yml* pour faciliter le développement et le déploiement. Une pipeline de CI/CD (intégration et déploiement continus) sera mise en place (par exemple avec GitHub Actions) pour automatiser les tests et les mises en production.
- *Stockage de fichiers :* Les fichiers volumineux (CVs, etc.) seront stockés sur un service de stockage objet externe comme *Google Drive* ou Amazon S3, afin de ne pas surcharger la base de données et de faciliter la gestion.


= CONCEPTION DU SYSTÈME

Cette section présente en détail l'architecture technique et fonctionnelle de la plateforme de recrutement IA. La conception a été réalisée en suivant les principes de l'architecture orientée services, avec une séparation claire des responsabilités entre les différents composants du système.

== 4.1 Architecture générale

La plateforme est composée de quatre modules principaux, chacun ayant un rôle spécifique dans le fonctionnement global du système :

=== 4.1.1 Architecture en couches

L'architecture globale du système suit un modèle en couches qui permet une séparation claire des responsabilités :

- *Couche Présentation (Frontend)* : Interface utilisateur développée avec Next.js et React, responsable de l'affichage des données et de l'interaction avec l'utilisateur.
- *Couche API (Backend)* : Services REST développés avec FastAPI, exposant les fonctionnalités du système aux clients.
- *Couche Métier* : Logique métier implémentée dans le backend, gérant les règles de gestion et les workflows.
- *Couche Données* : Gestion de la persistance des données via PostgreSQL et SQLAlchemy.
- *Couche Services Externes* : Intégration avec des services tiers comme Google Drive pour le stockage de fichiers.

=== 4.1.2 Communication entre les modules

- *Frontend ↔ Backend* : Communication via des requêtes HTTP/REST, avec échange de données au format JSON.
- *Backend ↔ Base de données* : Utilisation de l'ORM SQLAlchemy pour abstraire les interactions avec la base de données.
- *Backend ↔ Services de stockage* : API dédiée pour l'upload et la récupération des fichiers (CVs, documents).
- *Frontend ↔ Agent IA* : Communication via WebSockets pour les interactions en temps réel pendant les entretiens.

=== 4.1.3 Microservices et conteneurisation

L'architecture de la plateforme adopte une approche basée sur les microservices, où chaque composant principal est développé, déployé et mis à l'échelle indépendamment :

- *Service Frontend* : Application Next.js conteneurisée, exposée sur le port 3000.
- *Service Backend* : API FastAPI conteneurisée, exposée sur le port 8000.
- *Service Avatar IA* : Application Express.js conteneurisée, exposée sur le port 5000.
- *Service Base de données* : Instance PostgreSQL conteneurisée, exposée sur le port 5432.

Cette approche offre plusieurs avantages :
- Isolation des services pour une meilleure résilience
- Déploiement indépendant de chaque service
- Scalabilité horizontale facilitée
- Maintenance simplifiée

=== 4.1.4 Flux de données et interactions principales

Les principaux flux de données au sein du système sont les suivants :

1. *Gestion des utilisateurs* :
   - Inscription et authentification des utilisateurs
   - Gestion des profils et des rôles
   - Contrôle d'accès basé sur les rôles

2. *Gestion des offres d'emploi* :
   - Création et publication d'offres par les recruteurs
   - Consultation des offres par les candidats
   - Recherche et filtrage des offres

3. *Gestion des candidatures* :
   - Soumission de candidatures par les candidats
   - Téléchargement et stockage des CV
   - Évaluation des candidatures par les recruteurs

4. *Entretiens automatisés* :
   - Planification des entretiens
   - Interaction avec l'avatar IA
   - Enregistrement et analyse des réponses
   - Génération de rapports d'évaluation

[Place réservée pour le schéma d'architecture]

== 4.2 Diagrammes Use Case
[Place réservée pour les diagrammes UML]

== 4.3 Diagrammes de séquence
[Place réservée pour les diagrammes UML]

== 4.4 Diagramme de classes
[Place réservée pour les diagrammes UML]

== 4.5 Conception de la base de données
- Utilisation de SQLAlchemy pour la modélisation
- Tables : utilisateurs, offres, candidatures, entretiens
- Relations et contraintes d'intégrité

== 4.6 Technologies et outils utilisés
=== 4.6.1 Frontend
- Next.js, React, TypeScript, Tailwind CSS
- Authentification NextAuth.js
- UI moderne, responsive

=== 4.6.2 Backend
- FastAPI, SQLAlchemy, PostgreSQL
- Authentification JWT
- Gestion des fichiers (Google Drive)

=== 4.6.3 Autres outils
- Docker, CI/CD
- n8n (workflows automatisés)
- Three.js (avatar 3D)

= DÉVELOPPEMENT ET IMPLÉMENTATION

== 5.1 Environnement de développement
- VS Code, Git, Docker
- Organisation modulaire du code

== 5.2 Structure du projet
- frontend : pages, composants, types
- backend : API, modèles, schémas
- talking_avatar : avatar IA, backend Express

== 5.3 Implémentation de l’authentification
- NextAuth.js côté frontend
- JWT côté backend
- Gestion des rôles et permissions

== 5.4 Développement des interfaces
=== 5.4.1 Interface candidat
- Tableau de bord personnalisé
- Dépôt de CV, suivi des candidatures
- Entretien automatisé avec l’avatar IA

=== 5.4.2 Interface recruteur
- Gestion des offres
- Suivi des candidatures
- Organisation des entretiens

=== 5.4.3 Interface administrateur
- Supervision globale
- Paramétrage et sécurité

== 5.5 Intégration de l’IA
- Avatar 3D interactif (Three.js)
- Backend Express pour le dialogue
- Animation et synthèse vocale

== 5.6 Problèmes rencontrés et solutions
- Gestion des dépendances
- Sécurité des données
- Optimisation des performances
- Solutions apportées (Docker, tests, CI/CD)

= TESTS, VALIDATION ET DOCUMENTATION

== 6.1 Stratégie de tests
- Tests unitaires, d’intégration, de performance
- Validation avec les utilisateurs

== 6.2 Tests unitaires
[Place réservée pour les résultats de tests]

== 6.3 Tests d’intégration
[Place réservée pour les résultats de tests]

== 6.4 Tests de performance
[Place réservée pour les résultats de tests]

== 6.5 Validation avec les utilisateurs
[Place réservée pour les retours utilisateurs]

== 6.6 Documentation
- Documentation technique et utilisateur
- Guides d’installation et d’utilisation

= RÉSULTATS ET DISCUSSION

== 7.1 Interface utilisateur finale
[Place réservée pour les captures d’écran]

== 7.2 Fonctionnalités implémentées
- Authentification multi-rôles
- Gestion des offres et candidatures
- Entretien automatisé IA
- Tableau de bord personnalisé

== 7.3 Performance et optimisation
- Temps de réponse
- Scalabilité
- Optimisations apportées

== 7.4 Retours des utilisateurs
[Place réservée pour les retours]

== 7.5 Limitations et améliorations possibles
- Amélioration de l’IA
- Extension des fonctionnalités
- Optimisation de la sécurité

= CONCLUSION ET PERSPECTIVES

== 8.1 Bilan du projet
Le projet a permis d’automatiser le processus de recrutement, d’améliorer l’expérience utilisateur et de centraliser la gestion des candidatures.

== 8.2 Apports personnels
- Acquisition de compétences en développement fullstack
- Maîtrise des outils modernes (FastAPI, Next.js, Docker)
- Travail en équipe et gestion de projet

== 8.3 Perspectives d’évolution
- Intégration de nouvelles fonctionnalités IA
- Extension à d’autres processus RH
- Amélioration continue de la plateforme

= ANNEXES

== A.1 Maquettes Figma
[Place réservée pour les maquettes]

== A.2 Diagrammes UML complémentaires
[Place réservée pour les diagrammes]

== A.3 Code source
[Place réservée pour les extraits de code]

== A.4 Guide d’installation
- Prérequis : Docker, Node.js, Python
- Installation frontend : npm install, npm run build
- Installation backend : pip install -r requirements.txt, uvicorn
- Installation avatar IA : npm install, npm run start

== A.5 Captures d’écran supplémentaires
[Place réservée pour les captures]