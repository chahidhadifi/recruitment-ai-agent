"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/ui/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: data.email }),
      });
      
      if (response.ok) {
        setEmailSent(true);
        toast({
          title: "Email envoyé",
          description: "Un email de réinitialisation a été envoyé à votre adresse email.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Une erreur s\'est produite');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur s'est produite. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md px-4 sm:px-0">
        <div className="text-center">
          <h1 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
            AI Recruitment Platform
          </h1>
          <h2 className="mt-2 text-center text-lg leading-9 tracking-tight">
            Mot de passe oublié
          </h2>
        </div>

        <div className="mt-8 w-full">
          <div className="bg-card px-6 py-8 shadow-lg sm:rounded-xl sm:px-8 border border-border/50">
            {emailSent ? (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Email envoyé</h3>
                <p className="text-muted-foreground">
                  Un email de réinitialisation a été envoyé à votre adresse email. Veuillez vérifier votre boîte de réception et suivre les instructions.
                </p>
                <p className="text-sm text-yellow-500 mt-2">
                  <strong>Note:</strong> En mode développement, l'email n'est pas réellement envoyé. Veuillez vérifier la console du serveur pour voir les détails de l'email.
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => router.push("/auth/login")}
                >
                  Retour à la connexion
                </Button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                </p>
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium leading-6"
                    >
                      Adresse email
                    </label>
                    <div className="mt-2">
                      <input
                        id="email"
                        type="email"
                        autoComplete="email"
                        className="block w-full rounded-md border-0 bg-background py-2 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3 transition-colors"
                        placeholder="votre@email.com"
                        {...register("email")}
                        disabled={isLoading}
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.email.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <Button
                      type="submit"
                      className="w-full py-2 text-base font-medium transition-all hover:shadow-md"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        "Envoyer le lien de réinitialisation"
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}

            <p className="mt-8 text-center text-sm text-muted-foreground">
              <Link
                href="/auth/login"
                className="font-semibold leading-6 text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
              >
                Retour à la connexion
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}