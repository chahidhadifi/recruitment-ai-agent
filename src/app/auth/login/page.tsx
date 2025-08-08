"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/ui/use-toast";

const loginSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          variant: "destructive",
        });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite. Veuillez réessayer.",
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
            Connectez-vous à votre compte
          </h2>
        </div>

        <div className="mt-8 w-full">
          <div className="bg-card px-6 py-8 shadow-lg sm:rounded-xl sm:px-8 border border-border/50">
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
                <label
                  htmlFor="password"
                  className="block text-sm font-medium leading-6"
                >
                  Mot de passe
                </label>
                <div className="mt-2 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
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
                <Button
                  type="submit"
                  className="w-full py-2 text-base font-medium transition-all hover:shadow-md"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-card px-3 py-1 text-muted-foreground font-medium rounded-full">
                    Connexion rapide
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <Button
                  variant="outline"
                  className="w-full py-2 text-sm font-medium hover:bg-primary/5 transition-colors"
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const result = await signIn("credentials", {
                        email: "admin@example.com",
                        password: "password",
                        redirect: false,
                      });
                      
                      if (result?.error) {
                        toast({
                          title: "Erreur de connexion",
                          description: "Email ou mot de passe incorrect",
                          variant: "destructive",
                        });
                      } else {
                        router.push("/");
                        router.refresh();
                      }
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Une erreur s'est produite. Veuillez réessayer.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Connexion en tant qu'Administrateur
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full py-2 text-sm font-medium hover:bg-primary/5 transition-colors"
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const result = await signIn("credentials", {
                        email: "recruteur@example.com",
                        password: "password",
                        redirect: false,
                      });
                      
                      if (result?.error) {
                        toast({
                          title: "Erreur de connexion",
                          description: "Email ou mot de passe incorrect",
                          variant: "destructive",
                        });
                      } else {
                        router.push("/");
                        router.refresh();
                      }
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Une erreur s'est produite. Veuillez réessayer.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Connexion en tant que Recruteur
                </Button>
                
                <Button
                  variant="outline"
                  className="w-full py-2 text-sm font-medium hover:bg-primary/5 transition-colors"
                  disabled={isLoading}
                  onClick={async () => {
                    setIsLoading(true);
                    try {
                      const result = await signIn("credentials", {
                        email: "candidat@example.com",
                        password: "password",
                        redirect: false,
                      });
                      
                      if (result?.error) {
                        toast({
                          title: "Erreur de connexion",
                          description: "Email ou mot de passe incorrect",
                          variant: "destructive",
                        });
                      } else {
                        router.push("/");
                        router.refresh();
                      }
                    } catch (error) {
                      toast({
                        title: "Erreur",
                        description: "Une erreur s'est produite. Veuillez réessayer.",
                        variant: "destructive",
                      });
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                >
                  Connexion en tant que Candidat
                </Button>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Vous n'avez pas de compte ?{" "}
              <Link
                href="/auth/register"
                className="font-semibold leading-6 text-primary hover:text-primary/80 transition-colors underline-offset-2 hover:underline"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}