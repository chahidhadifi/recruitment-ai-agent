"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { useToast } from "@/components/ui/use-toast";

const registerSchema = z
  .object({
    // Section 1: Informations de base
    first_name: z.string().min(1, "Le prénom est requis"),
    last_name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    role: z.string().default("candidat"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    
    // Section 2: Informations complémentaires
    cnie: z.string().optional(),
    nationality: z.string().default("Marocaine"),
    skills: z.array(z.string()).optional(),
    biography: z.string().optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    address: z.string().optional(),
    cv_url: z.string().optional(),
    cover_letter_url: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  // Commenté pour permettre l'inscription
  // useEffect(() => {
  //   toast({
  //     title: "Inscription désactivée",
  //     description: "L&apos;inscription de nouveaux comptes est actuellement désactivée. Veuillez contacter l&apos;administrateur.",
  //     variant: "destructive",
  //   });
    
  //   router.push("/auth/login");
  // }, [router, toast]);
  
  // Ces états ne sont plus nécessaires mais conservés pour éviter les erreurs
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {    register,
    handleSubmit,
    formState: { errors },
    watch,
    trigger,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      cnie: "",
      nationality: "Marocaine",
      skills: [],
      biography: "",
      phone: "",
      city: "",
      address: "",
      cv_url: "",
      cover_letter_url: "",
    },
    mode: "onChange",
  });

  // État pour gérer les étapes du formulaire
  const [formStep, setFormStep] = useState(0);

  // Fonction pour passer à l'étape suivante
  const nextStep = async () => {
    const fieldsToValidate = ['first_name', 'last_name', 'email', 'password', 'confirmPassword'];
    const output = await trigger(fieldsToValidate as any);
    if (output) {
      setFormStep(1);
    }
  };

  // Fonction pour revenir à l'étape précédente
  const prevStep = () => {
    setFormStep(0);
  };

  const onSubmit = async (data: RegisterFormValues) => {
    // Empêcher les soumissions multiples
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Début de la soumission du formulaire');

    // Garantir que isLoading sera remis à false après un certain temps, même en cas de problème
    const safetyTimeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Safety timeout déclenché - Déblocage forcé du bouton');
        setIsLoading(false);
        toast({
          title: "Problème de connexion",
          description: "La requête a pris trop de temps. Veuillez réessayer.",
          variant: "destructive",
        });
      }
    }, 8000); // Réduire à 8 secondes pour éviter un blocage trop long

    try {
      // Appel à l'API backend pour créer un nouvel utilisateur
      console.log('Envoi de la requête à:', `http://localhost:8000/api/users/`);
      
      // Utilisation d'un timeout pour éviter que la requête reste bloquée indéfiniment
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Timeout déclenché - Annulation de la requête');
        controller.abort();
      }, 5000); // 5 secondes de timeout pour éviter le blocage
      
      try {
        console.log('Préparation des données pour la requête:', {
          name: `${data.first_name} ${data.last_name}`,
          email: data.email,
          // Ne pas logger le mot de passe pour des raisons de sécurité
        });

        const response = await fetch(`http://localhost:8000/api/users/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: `${data.first_name} ${data.last_name}`,
            first_name: data.first_name,
            last_name: data.last_name,
            email: data.email,
            password: data.password,
            role: 'candidat', // Par défaut, les nouveaux utilisateurs sont des candidats
            image: `https://ui-avatars.com/api/?name=${encodeURIComponent(`${data.first_name} ${data.last_name}`)}&background=random`,
            cnie: data.cnie,
            nationality: data.nationality,
            skills: data.skills || [], // S'assurer que skills est un tableau
            biography: data.biography,
            phone: data.phone,
            city: data.city,
            address: data.address,
            cv_url: data.cv_url,
            cover_letter_url: data.cover_letter_url
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        console.log('Statut de la réponse:', response.status);

        if (!response.ok) {
          console.log('Réponse non OK, statut:', response.status);
          const errorData = await response.json();
          console.log('Données d\'erreur:', errorData);
          throw new Error(errorData.detail || 'Erreur lors de la création du compte');
        }

        console.log('Compte créé avec succès');
        // Réinitialiser l'état de chargement avant la redirection
        setIsLoading(false);
        clearTimeout(safetyTimeoutId); // Annuler le safety timeout
        
        toast({
          title: "Compte créé",
          description: "Votre compte a été créé avec succès. Vous pouvez maintenant vous connecter.",
        });

        // Ajouter un délai court avant la redirection pour permettre au toast de s'afficher
        setTimeout(() => {
          window.location.href = "/auth/login";
        }, 1500);
      } catch (fetchError: any) {
        console.log('Erreur lors de la requête fetch:', fetchError);
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error: any) {
      console.log('Erreur capturée dans le bloc catch externe:', error);
      // Gérer les erreurs réseau et autres erreurs
      const errorMessage = error.name === 'AbortError' 
        ? "La connexion au serveur a échoué. Veuillez vérifier votre connexion internet ou réessayer plus tard."
        : error.message || "Une erreur s'est produite. Veuillez réessayer.";
      
      console.log('Message d\'erreur à afficher:', errorMessage);
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
      
      // S'assurer que isLoading est toujours remis à false
      setIsLoading(false);
      clearTimeout(safetyTimeoutId); // Annuler le safety timeout
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h1 className="mt-6 text-center text-2xl font-bold leading-9 tracking-tight">
            AI Recruitment Platform
          </h1>
          <h2 className="mt-2 text-center text-lg leading-9 tracking-tight">
            Créez votre compte
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-[480px]">
          <div className="bg-card px-6 py-12 shadow sm:rounded-lg sm:px-12">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {formStep === 0 ? (
                <>
                  <h3 className="text-lg font-medium leading-6">Informations de base</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium leading-6"
                      >
                        Prénom
                      </label>
                      <div className="mt-2">
                        <input
                          id="first_name"
                          type="text"
                          autoComplete="given-name"
                          className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                          {...register("first_name")}
                          disabled={isLoading}
                        />
                        {errors.first_name && (
                          <p className="mt-1 text-sm text-destructive">
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium leading-6"
                      >
                        Nom
                      </label>
                      <div className="mt-2">
                        <input
                          id="last_name"
                          type="text"
                          autoComplete="family-name"
                          className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                          {...register("last_name")}
                          disabled={isLoading}
                        />
                        {errors.last_name && (
                          <p className="mt-1 text-sm text-destructive">
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

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
                        className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
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
                        autoComplete="new-password"
                        className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3 pr-10"
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
                        autoComplete="new-password"
                        className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3 pr-10"
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
                      type="button"
                      className="w-full"
                      onClick={nextStep}
                      disabled={isLoading}
                    >
                      Continuer
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h3 className="text-lg font-medium leading-6">Informations complémentaires</h3>
                  
                  <div>
                    <label
                      htmlFor="cnie"
                      className="block text-sm font-medium leading-6"
                    >
                      CNIE
                    </label>
                    <div className="mt-2">
                      <input
                        id="cnie"
                        type="text"
                        className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                        {...register("cnie")}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="nationality"
                      className="block text-sm font-medium leading-6"
                    >
                      Nationalité
                    </label>
                    <div className="mt-2">
                      <select
                        id="nationality"
                        className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                        {...register("nationality")}
                        disabled={isLoading}
                      >
                        <option value="Marocaine">Marocaine</option>
                        <option value="Française">Française</option>
                        <option value="Algérienne">Algérienne</option>
                        <option value="Tunisienne">Tunisienne</option>
                        <option value="Sénégalaise">Sénégalaise</option>
                        <option value="Ivoirienne">Ivoirienne</option>
                        <option value="Autre">Autre</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="biography"
                      className="block text-sm font-medium leading-6"
                    >
                      Biographie
                    </label>
                    <div className="mt-2">
                      <textarea
                        id="biography"
                        rows={3}
                        className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                        {...register("biography")}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium leading-6"
                      >
                        Numéro de téléphone
                      </label>
                      <div className="mt-2">
                        <input
                          id="phone"
                          type="tel"
                          className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                          {...register("phone")}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="city"
                        className="block text-sm font-medium leading-6"
                      >
                        Ville
                      </label>
                      <div className="mt-2">
                        <input
                          id="city"
                          type="text"
                          className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                          {...register("city")}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="address"
                      className="block text-sm font-medium leading-6"
                    >
                      Adresse
                    </label>
                    <div className="mt-2">
                      <input
                        id="address"
                        type="text"
                        className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                        {...register("address")}
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <Button
                      type="button"
                      className="flex-1"
                      variant="outline"
                      onClick={prevStep}
                      disabled={isLoading}
                    >
                      Retour
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Inscription en cours...
                        </>
                      ) : (
                        "S'inscrire"
                      )}
                    </Button>
                  </div>
                </>
              )}
            </form>

            <p className="mt-10 text-center text-sm text-muted-foreground">
              Vous avez déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="font-semibold leading-6 text-primary hover:text-primary/80"
              >
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}