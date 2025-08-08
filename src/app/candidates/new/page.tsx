"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Upload } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const candidateSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(1, "Le numéro de téléphone est requis"),
  position: z.string().min(1, "Le poste est requis"),
});

type CandidateFormValues = z.infer<typeof candidateSchema>;

export default function NewCandidatePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [cvFile, setCvFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CandidateFormValues>({
    resolver: zodResolver(candidateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      position: "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setCvFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data: CandidateFormValues) => {
    if (!cvFile) {
      toast({
        title: "Erreur",
        description: "Veuillez télécharger un CV",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Dans un environnement de production, vous devriez envoyer les données à votre API
      // pour créer un nouveau candidat et traiter le fichier CV
      // Simulation d'un délai d'API
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Candidat ajouté",
        description: "Le candidat a été ajouté avec succès. L'analyse du CV est en cours.",
      });

      router.push("/candidates");
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
    <MainLayout>
      <div className="container py-10">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-bold mb-6">Ajouter un nouveau candidat</h1>

          <div className="bg-card p-6 rounded-lg shadow-sm">
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium mb-1"
                  >
                    Prénom
                  </label>
                  <input
                    id="firstName"
                    type="text"
                    className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                    {...register("firstName")}
                    disabled={isLoading}
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.firstName.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium mb-1"
                  >
                    Nom
                  </label>
                  <input
                    id="lastName"
                    type="text"
                    className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                    {...register("lastName")}
                    disabled={isLoading}
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-destructive">
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
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

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium mb-1"
                >
                  Téléphone
                </label>
                <input
                  id="phone"
                  type="tel"
                  className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                  {...register("phone")}
                  disabled={isLoading}
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="position"
                  className="block text-sm font-medium mb-1"
                >
                  Poste recherché
                </label>
                <input
                  id="position"
                  type="text"
                  className="block w-full rounded-md border-0 bg-background py-1.5 shadow-sm ring-1 ring-inset ring-input placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-primary sm:text-sm sm:leading-6 px-3"
                  {...register("position")}
                  disabled={isLoading}
                />
                {errors.position && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.position.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="cv"
                  className="block text-sm font-medium mb-1"
                >
                  CV (PDF, DOCX)
                </label>
                <div className="mt-1 flex justify-center rounded-md border-2 border-dashed border-input px-6 py-10">
                  <div className="text-center">
                    <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                    <div className="mt-4 flex text-sm leading-6 text-muted-foreground">
                      <label
                        htmlFor="cv-upload"
                        className="relative cursor-pointer rounded-md bg-background font-semibold text-primary focus-within:outline-none focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 hover:text-primary/80"
                      >
                        <span>Télécharger un fichier</span>
                        <input
                          id="cv-upload"
                          name="cv-upload"
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx"
                          onChange={handleFileChange}
                          disabled={isLoading}
                        />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs leading-5 text-muted-foreground">
                      PDF, DOC ou DOCX jusqu&apos;à 10MB
                    </p>
                    {cvFile && (
                      <p className="mt-2 text-sm text-primary">
                        Fichier sélectionné: {cvFile.name}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                  disabled={isLoading}
                >
                  Annuler
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Traitement en cours...
                    </>
                  ) : (
                    "Ajouter le candidat"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}