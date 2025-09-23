"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { UserWithRole } from "@/types/user-roles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface UserFormProps {
  user?: UserWithRole;
  onSubmit: (userData: Partial<UserWithRole>) => void;
  onCancel: () => void;
}

export function UserForm({ user, onSubmit, onCancel }: UserFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<Partial<UserWithRole>>({
    name: "",
    email: "",
    role: user?.role || "candidat",
    ...user,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mettre à jour le formulaire si l'utilisateur change
  useEffect(() => {
    if (user) {
      setFormData({
        ...user,
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.email?.trim()) {
      newErrors.email = "L'email est requis";
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }

    if (!formData.role) {
      newErrors.role = "Le rôle est requis";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ""}
            onChange={handleChange}
            placeholder="Nom complet"
            className={errors.name ? "border-red-500" : ""}
          />
          {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email || ""}
            onChange={handleChange}
            placeholder="email@example.com"
            className={errors.email ? "border-red-500" : ""}
          />
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
        </div>

        <div className="space-y-2">
          <Label>Poste / Fonction</Label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: "candidat", label: "Candidat", description: "Cherche un emploi" },
              { value: "recruteur", label: "Recruteur", description: "Gère les candidatures" },
              { value: "admin", label: "Administrateur", description: "Gère le système" }
            ].map((roleOption) => (
              <div
                key={roleOption.value}
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  formData.role === roleOption.value
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                } ${errors.role ? "border-red-500" : ""}`}
                onClick={() => {
                  setFormData((prev) => ({
                    ...prev,
                    role: roleOption.value,
                  }));
                  if (errors.role) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.role;
                      return newErrors;
                    });
                  }
                }}
              >
                <div className="font-medium">{roleOption.label}</div>
                <div className="text-sm text-muted-foreground">
                  {roleOption.description}
                </div>
              </div>
            ))}
          </div>
          {errors.role && <p className="text-sm text-red-500">{errors.role}</p>}
        </div>

        {!user && (
          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="••••••••"
              className={errors.password ? "border-red-500" : ""}
            />
            {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Annuler
        </Button>
        <Button type="submit">
          {user ? "Mettre à jour" : "Créer l'utilisateur"}
        </Button>
      </div>
    </form>
  );
}