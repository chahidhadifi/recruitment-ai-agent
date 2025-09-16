"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/ui/use-toast";

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetComplete, setResetComplete] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast({
        title: "Erreur",
        description: "Token de réinitialisation manquant ou invalide.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Vérifier d'abord si le token est valide
      const verifyResponse = await fetch('/api/auth/verify-reset-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          email: searchParams.get('email') || '' 
        }),
      });

      if (!verifyResponse.ok) {
        const errorData = await verifyResponse.json();
        throw new Error(errorData.detail || 'Token invalide ou expiré');
      }

      // Réinitialiser le mot de passe
      const resetResponse = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          email: searchParams.get('email') || '',
          new_password: data.password
        }),
      });

      if (resetResponse.ok) {
        setResetComplete(true);
        toast({
          title: "Mot de passe réinitialisé",
          description: "Votre mot de passe a été réinitialisé avec succès.",
        });
      } else {
        const errorData = await resetResponse.json();
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

  // Si aucun token n'est fourni, afficher un message d'erreur
  if (!token && !resetComplete) {
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
              Réinitialisation du mot de passe
            </h2>
          </div>

          <div className="mt-8 w-full">
            <div className="bg-card px-6 py-8 shadow-lg sm:rounded-xl sm:px-8 border border-border/50">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium text-destructive">Lien invalide</h3>
                <p className="text-muted-foreground">
                  Le lien de réinitialisation est invalide ou a expiré. Veuillez demander un nouveau lien de réinitialisation.
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => router.push("/auth/forgot-password")}
                >
                  Demander un nouveau lien
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            Réinitialisation du mot de passe
          </h2>
        </div>

        <div className="mt-8 w-full">
          <div className="bg-card px-6 py-8 shadow-lg sm:rounded-xl sm:px-8 border border-border/50">
            {resetComplete ? (
              <div className="text-center space-y-4">
                <h3 className="text-lg font-medium">Mot de passe réinitialisé</h3>
                <p className="text-muted-foreground">
                  Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                </p>
                <Button
                  className="mt-4 w-full"
                  onClick={() => router.push("/auth/login")}
                >
                  Se connecter
                </Button>
              </div>
            ) : (
              <>
                <p className="mb-4 text-sm text-muted-foreground">
                  Veuillez entrer votre nouveau mot de passe.
                </p>
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                  <div>
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium leading-6"
                    >
                      Nouveau mot de passe
                    </label>
                    <div className="mt-2 relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        className="block w-full rounded-md border-0 bg-background py-2 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3 pr-10 transition-colors"
                        placeholder="••••••••"
                        {...register("password")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {errors.password && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.password.message}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="confirmPassword"
                      className="block text-sm font-medium leading-6"
                    >
                      Confirmer le mot de passe
                    </label>
                    <div className="mt-2 relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        className="block w-full rounded-md border-0 bg-background py-2 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3 pr-10 transition-colors"
                        placeholder="••••••••"
                        {...register("confirmPassword")}
                        disabled={isLoading}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                      {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-destructive">
                          {errors.confirmPassword.message}
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
                          Réinitialisation en cours...
                        </>
                      ) : (
                        "Réinitialiser le mot de passe"
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