"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/main-layout";

export default function PrivacyPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              Politique de Confidentialité
            </h1>
            <p className="text-lg text-muted-foreground mb-8">
              Dernière mise à jour : {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-12">
        <div className="container">
          <div className="mx-auto max-w-4xl prose prose-lg dark:prose-invert">
            <h2>Introduction</h2>
            <p>
              Chez AI Recruitment Platform, nous accordons une grande importance à la protection de vos données personnelles. 
              Cette politique de confidentialité explique comment nous collectons, utilisons, partageons et protégeons vos informations 
              lorsque vous utilisez notre plateforme de recrutement basée sur l&apos;intelligence artificielle.
            </p>
            <p>
              Notre plateforme utilise des technologies d&apos;intelligence artificielle avancées pour révolutionner le processus de recrutement,
              en aidant les entreprises à trouver les meilleurs talents plus rapidement et avec plus d&apos;objectivité. Nous nous engageons
              à maintenir les plus hauts standards de confidentialité et de sécurité dans toutes nos opérations.
            </p>

            <h2>Informations que nous collectons</h2>
            <p>
              Nous collectons différents types d&apos;informations pour fournir et améliorer nos services :
            </p>
            <ul>
              <li><strong>Informations personnelles</strong> : nom, adresse e-mail, numéro de téléphone, photo de profil, etc.</li>
              <li><strong>Informations professionnelles</strong> : CV, expériences professionnelles, compétences, formations, etc.</li>
              <li><strong>Données d&apos;utilisation</strong> : interactions avec la plateforme, préférences, etc.</li>
              <li><strong>Données techniques</strong> : adresse IP, type de navigateur, appareil utilisé, etc.</li>
            </ul>

            <h2>Utilisation des informations</h2>
            <p>
              Nous utilisons vos informations pour les finalités suivantes :
            </p>
            <ul>
              <li>Fournir, maintenir et améliorer notre plateforme</li>
              <li>Faciliter le processus de recrutement entre candidats et recruteurs</li>
              <li>Analyser les compétences et l&apos;adéquation des candidats aux offres d&apos;emploi</li>
              <li>Personnaliser votre expérience utilisateur</li>
              <li>Communiquer avec vous concernant votre compte ou nos services</li>
              <li>Assurer la sécurité de notre plateforme</li>
            </ul>

            <h2>Intelligence artificielle et traitement des données</h2>
            <p>
              Notre plateforme utilise des technologies d&apos;intelligence artificielle pour analyser les profils des candidats 
              et les offres d&apos;emploi afin de proposer les meilleures correspondances possibles. Ce traitement est effectué 
              de manière automatisée, mais toujours sous supervision humaine pour les décisions importantes.
            </p>
            <p>
              Nous veillons à ce que nos algorithmes soient conçus pour éviter les biais discriminatoires et respecter 
              l&apos;équité dans le processus de recrutement.
            </p>
            <h3>Nos technologies d&apos;IA</h3>
            <p>
              Notre plateforme intègre plusieurs technologies d&apos;IA avancées :
            </p>
            <ul>
              <li><strong>Traitement du langage naturel (NLP)</strong> : Pour analyser les CV, les descriptions de poste et les réponses aux entretiens</li>
              <li><strong>Apprentissage automatique</strong> : Pour améliorer continuellement la précision des correspondances entre candidats et postes</li>
              <li><strong>Analyse prédictive</strong> : Pour évaluer la compatibilité des candidats avec la culture d&apos;entreprise et les exigences du poste</li>
              <li><strong>Systèmes de recommandation</strong> : Pour suggérer des candidats pertinents aux recruteurs et des offres d&apos;emploi aux candidats</li>
            </ul>
            <h3>Transparence algorithmique</h3>
            <p>
              Nous nous engageons à maintenir une transparence maximale concernant nos algorithmes. Nos systèmes d&apos;IA sont :
            </p>
            <ul>
              <li>Régulièrement audités par des experts indépendants pour détecter et corriger les biais potentiels</li>
              <li>Conçus pour fournir des explications sur les décisions prises (IA explicable)</li>
              <li>Constamment améliorés grâce aux retours des utilisateurs et aux avancées technologiques</li>
              <li>Conformes aux principes éthiques de l&apos;IA responsable</li>
            </ul>

            <h2>Partage des informations</h2>
            <p>
              Nous ne partageons vos informations qu&apos;avec votre consentement ou dans les cas suivants :
            </p>
            <ul>
              <li>Avec les recruteurs ou entreprises auxquels vous postulez</li>
              <li>Avec nos prestataires de services qui nous aident à fournir nos services</li>
              <li>Pour se conformer à la loi ou protéger nos droits</li>
              <li>Dans le cadre d&apos;une fusion, acquisition ou vente d&apos;actifs</li>
            </ul>

            <h2>Sécurité des données</h2>
            <p>
              Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles appropriées pour protéger 
              vos données contre tout accès non autorisé, altération, divulgation ou destruction.
            </p>
            <p>
              Notre infrastructure de sécurité comprend :
            </p>
            <ul>
              <li><strong>Chiffrement de bout en bout</strong> : Toutes les données sont chiffrées en transit et au repos</li>
              <li><strong>Authentification multi-facteurs</strong> : Pour protéger l&apos;accès aux comptes utilisateurs</li>
              <li><strong>Audits de sécurité réguliers</strong> : Réalisés par des experts indépendants en cybersécurité</li>
              <li><strong>Surveillance continue</strong> : Détection des menaces et réponse aux incidents 24/7</li>
              <li><strong>Conformité aux normes</strong> : ISO 27001, GDPR, et autres réglementations internationales</li>
            </ul>
            <p>
              Notre équipe de sécurité travaille constamment à l&apos;amélioration de nos protocoles pour garantir que vos données 
              restent protégées contre les menaces émergentes.
            </p>

            <h2>Vos droits</h2>
            <p>
              Conformément aux lois sur la protection des données, vous disposez des droits suivants :
            </p>
            <ul>
              <li>Droit d&apos;accès à vos données personnelles</li>
              <li>Droit de rectification des données inexactes</li>
              <li>Droit à l&apos;effacement (&laquo;droit à l&apos;oubli&raquo;)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
              <li>Droit d&apos;opposition au traitement</li>
              <li>Droit de ne pas faire l&apos;objet d&apos;une décision fondée exclusivement sur un traitement automatisé</li>
            </ul>

            <h2>Conservation des données</h2>
            <p>
              Nous conservons vos données personnelles aussi longtemps que nécessaire pour fournir nos services 
              ou pour respecter nos obligations légales. La durée de conservation peut varier en fonction du type 
              de données et de leur finalité.
            </p>

            <h2>Modifications de cette politique</h2>
            <p>
              Nous pouvons mettre à jour cette politique de confidentialité de temps à autre. Nous vous informerons 
              de tout changement important par e-mail ou par une notification sur notre plateforme.
            </p>

            <h2>Nous contacter</h2>
            <p>
              Si vous avez des questions concernant cette politique de confidentialité ou nos pratiques en matière 
              de protection des données, veuillez nous contacter à l&apos;adresse suivante : privacy@ai-recruitment.com
            </p>
            
            <h3>Délégué à la protection des données</h3>
            <p>
              Notre délégué à la protection des données (DPO) est disponible pour répondre à toutes vos questions 
              concernant le traitement de vos données personnelles ou l&apos;exercice de vos droits :
            </p>
            <ul>
              <li><strong>Email</strong> : dpo@ai-recruitment.com</li>
              <li><strong>Téléphone</strong> : +33 (0)1 23 45 67 89</li>
              <li><strong>Adresse postale</strong> : AI Recruitment Platform, Service DPO, 123 Avenue de l&apos;Innovation, 75008 Paris, France</li>
            </ul>
            
            <h3>Autorité de contrôle</h3>
            <p>
              Vous avez également le droit d&apos;introduire une réclamation auprès de l&apos;autorité de contrôle compétente, 
              notamment dans l&apos;État membre de votre résidence habituelle, de votre lieu de travail ou du lieu où la 
              violation aurait été commise.
            </p>
            <p>
              Pour la France, l&apos;autorité de contrôle est la Commission Nationale de l&apos;Informatique et des Libertés (CNIL) :
              <br />www.cnil.fr
            </p>
          </div>

          <div className="mx-auto max-w-4xl mt-12 text-center">
            <Button asChild size="lg">
              <Link href="/contact">
                Contactez-nous <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}
