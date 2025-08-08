import { MainLayout } from "@/components/main-layout";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle, Users, Briefcase, Brain, Clock, Shield, Award, BarChart, Zap, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-12 md:py-16 lg:py-20">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl mb-6">
              À propos de AI Recruitment Platform
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-3xl mx-auto">
              Nous révolutionnons le processus de recrutement grâce à l'intelligence artificielle,
              en aidant les entreprises à trouver les meilleurs talents plus rapidement et avec plus d'objectivité.
              Notre plateforme complète transforme chaque étape du recrutement, de la publication des offres à l'intégration des nouveaux employés.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/contact">
                  Contactez-nous <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/jobs">Voir nos offres d'emploi</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Notre Mission</h2>
              <p className="text-lg text-muted-foreground">
                Nous croyons que le recrutement devrait être efficace, équitable et basé sur les compétences réelles.
                Notre mission est de démocratiser l'accès aux technologies d'IA pour tous les acteurs du recrutement,
                tout en garantissant un processus éthique et transparent.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Pour les recruteurs</h3>
                <p className="text-muted-foreground">
                  Réduisez le temps de recrutement de 60% et trouvez les candidats qui correspondent vraiment à vos besoins.
                  Notre plateforme automatise les tâches répétitives et vous aide à prendre des décisions éclairées.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Pour les candidats</h3>
                <p className="text-muted-foreground">
                  Bénéficiez d'un processus de recrutement transparent, rapide et basé sur vos compétences réelles.
                  Notre système d'entretien IA vous permet de mettre en valeur vos talents à tout moment, sans stress.
                </p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm">
                <div className="bg-primary/10 p-3 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">IA avancée</h3>
                <p className="text-muted-foreground">
                  Notre technologie d'IA analyse les CV, mène des entretiens et génère des rapports d'évaluation complets.
                  Nous utilisons des modèles de langage de pointe pour comprendre les nuances des compétences et de la personnalité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-12 bg-muted/50">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Notre Technologie</h2>
              <p className="text-lg text-muted-foreground">
                Notre plateforme utilise des technologies d'intelligence artificielle avancées pour révolutionner chaque étape du processus de recrutement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Analyse intelligente des CV</h3>
                  <p className="text-muted-foreground">
                    Notre système analyse automatiquement les CV pour extraire les compétences, l'expérience et les qualifications pertinentes, en les comparant aux exigences du poste.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Entretiens IA interactifs</h3>
                  <p className="text-muted-foreground">
                    Notre plateforme conduit des entretiens préliminaires par chat ou vidéo, en adaptant les questions en fonction des réponses du candidat pour une évaluation approfondie.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <BarChart className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Analyse prédictive</h3>
                  <p className="text-muted-foreground">
                    Nos algorithmes prédisent la compatibilité des candidats avec votre culture d'entreprise et les exigences du poste, en se basant sur des données historiques de réussite.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Globe className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Multilingue et multiculturel</h3>
                  <p className="text-muted-foreground">
                    Notre système prend en charge plus de 20 langues et comprend les nuances culturelles, permettant un recrutement véritablement global et inclusif.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Pourquoi nous choisir</h2>
              <p className="text-lg text-muted-foreground">
                Notre plateforme offre des avantages uniques pour moderniser votre processus de recrutement.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Clock className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Gain de temps considérable</h3>
                  <p className="text-muted-foreground">
                    Automatisez le tri des CV et les premiers entretiens pour vous concentrer sur les meilleurs candidats.
                    Réduisez jusqu'à 70% le temps consacré aux tâches administratives du recrutement.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Shield className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Réduction des biais</h3>
                  <p className="text-muted-foreground">
                    Notre IA est conçue pour évaluer objectivement les compétences, réduisant les biais inconscients.
                    Nos algorithmes sont régulièrement audités pour garantir l'équité du processus.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Qualité des recrutements</h3>
                  <p className="text-muted-foreground">
                    Améliorez la pertinence des embauches grâce à une évaluation approfondie des compétences techniques et soft skills.
                    Nos clients rapportent une réduction de 35% du turnover après l'adoption de notre plateforme.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-primary/10 p-2 rounded-full">
                    <Brain className="h-5 w-5 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Technologie de pointe</h3>
                  <p className="text-muted-foreground">
                    Bénéficiez des dernières avancées en matière d'IA et de traitement du langage naturel pour l'analyse des candidatures.
                    Notre équipe de chercheurs améliore constamment nos algorithmes pour des résultats toujours plus précis.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-muted/30">
        <div className="container">
          <div className="mx-auto max-w-4xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Résultats Prouvés</h2>
              <p className="text-lg text-muted-foreground">
                Notre plateforme a déjà aidé des centaines d'entreprises à transformer leur processus de recrutement.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm text-center">
                <p className="text-4xl font-bold text-primary mb-2">60%</p>
                <p className="text-muted-foreground">Réduction du temps de recrutement</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm text-center">
                <p className="text-4xl font-bold text-primary mb-2">35%</p>
                <p className="text-muted-foreground">Réduction du turnover</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm text-center">
                <p className="text-4xl font-bold text-primary mb-2">500+</p>
                <p className="text-muted-foreground">Entreprises utilisatrices</p>
              </div>

              <div className="bg-card p-6 rounded-lg border border-border/50 shadow-sm text-center">
                <p className="text-4xl font-bold text-primary mb-2">98%</p>
                <p className="text-muted-foreground">Taux de satisfaction client</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-primary/5">
        <div className="container">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Prêt à transformer votre processus de recrutement ?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Rejoignez les entreprises qui ont déjà optimisé leur recrutement grâce à notre plateforme IA.
              Commencez dès aujourd'hui et constatez les résultats en moins de 30 jours.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link href="/contact">
                  Demander une démo <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/dashboard">
                  Essai gratuit de 14 jours
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
}