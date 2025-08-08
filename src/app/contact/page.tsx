import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Send } from "lucide-react";

export default function ContactPage() {
  return (
    <MainLayout>
      <div className="container py-12 md:py-16 lg:py-20">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold tracking-tight mb-4">Contactez-nous</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Vous avez des questions sur notre plateforme de recrutement IA ? Notre équipe est là pour vous aider.
              N'hésitez pas à nous contacter par le formulaire ci-dessous ou via nos coordonnées directes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="bg-card border border-border/50 rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Email</h3>
              <p className="text-muted-foreground mb-3">Notre équipe vous répondra sous 24h</p>
              <a href="mailto:contact@ai-recruitment.com" className="text-primary hover:underline">
                contact@ai-recruitment.com
              </a>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <Phone className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Téléphone</h3>
              <p className="text-muted-foreground mb-3">Du lundi au vendredi, 9h-18h</p>
              <a href="tel:+33123456789" className="text-primary hover:underline">
                +2126 123 456 78
              </a>
            </div>

            <div className="bg-card border border-border/50 rounded-lg p-6 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-primary/10 p-3 rounded-full mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-lg font-medium mb-2">Adresse</h3>
              <p className="text-muted-foreground mb-3">Venez nous rencontrer</p>
              <address className="not-italic text-primary">
                123 Avenue de l'Innovation<br />
                75008 Paris, France
              </address>
            </div>
          </div>

          <div className="bg-card border border-border/50 rounded-xl p-6 md:p-8 shadow-md">
            <h2 className="text-2xl font-bold mb-6">Envoyez-nous un message</h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nom complet
                  </label>
                  <Input id="name" placeholder="Votre nom" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="votre@email.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium">
                  Sujet
                </label>
                <Input id="subject" placeholder="Sujet de votre message" />
              </div>

              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium">
                  Message
                </label>
                <Textarea
                  id="message"
                  placeholder="Détaillez votre demande ici..."
                  rows={6}
                />
              </div>

              <Button type="submit" className="w-full md:w-auto">
                <Send className="mr-2 h-4 w-4" /> Envoyer le message
              </Button>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}