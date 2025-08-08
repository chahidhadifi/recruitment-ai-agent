import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, CheckCircle } from "lucide-react";

export default function Home() {
  return (
    <MainLayout>
      <div className="relative isolate z-0">
        {/* Gradient background */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-blue-500 opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>

        {/* Hero section */}
        <div className="py-24 sm:py-32 lg:pb-40 relative z-0">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Automatisez votre processus de recrutement avec l'IA
              </h1>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Notre plateforme utilise l'intelligence artificielle pour analyser les CV,
                mener des entretiens automatisés et générer des rapports d'évaluation complets,
                vous permettant de sélectionner les meilleurs candidats plus rapidement et avec plus d'objectivité.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Button asChild size="lg">
                  <Link href="/candidates/new">Commencer maintenant <ArrowRight className="ml-2 h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/jobs">Voir les offres d'emploi</Link>
                </Button>
              </div>
            </div>

            {/* Feature section */}
            <div className="mt-20 sm:mt-24">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold tracking-tight">Fonctionnalités principales</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Notre plateforme offre des outils puissants pour optimiser chaque étape de votre processus de recrutement.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-8">
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Analyse de CV</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Notre IA extrait et analyse automatiquement les compétences, expériences et qualifications clés des CV.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Entretiens automatisés</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Un agent conversationnel intelligent mène des entretiens personnalisés avec les candidats, adaptés à leur profil.
                  </p>
                </div>
                <div className="bg-card p-6 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary/10 p-2 rounded-full mr-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold">Rapports d'évaluation</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Obtenez des rapports détaillés avec scores, points forts/faibles et recommandations pour chaque candidat.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Testimonial section */}
          <div className="mt-24 sm:mt-32 mx-auto max-w-7xl px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Ce que nos clients disent</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Découvrez comment notre plateforme a transformé le processus de recrutement de nos clients.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <p className="italic text-muted-foreground">"Grâce à cette plateforme, nous avons réduit notre temps de recrutement de 60% tout en améliorant la qualité de nos embauches. Un outil indispensable pour notre équipe RH."</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="font-semibold">Sophie Martin</p>
                    <p className="text-sm text-muted-foreground">Directrice RH, TechInnovate</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <p className="italic text-muted-foreground">"L'analyse automatisée des CV nous a permis d'identifier des talents que nous aurions pu manquer avec notre processus manuel. Les entretiens IA sont remarquablement précis."</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="font-semibold">Thomas Dubois</p>
                    <p className="text-sm text-muted-foreground">Responsable Recrutement, GlobalFinance</p>
                  </div>
                </div>
              </div>
              <div className="bg-card p-6 rounded-lg shadow-sm border border-border">
                <div className="flex flex-col h-full">
                  <div className="flex-1">
                    <p className="italic text-muted-foreground">"En tant que startup, nous n'avions pas les ressources pour un grand département RH. Cette plateforme nous a permis de recruter efficacement malgré nos contraintes."</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="font-semibold">Léa Moreau</p>
                    <p className="text-sm text-muted-foreground">CEO, StartupVision</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gradient background (bottom) */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-blue-500 to-primary opacity-20 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)",
            }}
          />
        </div>
      </div>
    </MainLayout>
  );
}
