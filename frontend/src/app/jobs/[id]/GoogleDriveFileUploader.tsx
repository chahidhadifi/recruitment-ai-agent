"use client";

import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface GoogleDriveFileUploaderProps {
  fileType: "cv" | "cover_letter";
  candidateId: string;
  onFileUploaded: (url: string) => void;
  buttonText: string;
}

export default function GoogleDriveFileUploader({
  fileType,
  candidateId,
  onFileUploaded,
  buttonText
}: GoogleDriveFileUploaderProps) {
  const [file, setFile] = useState<{ preview: string; data: File } | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFile({
        preview: URL.createObjectURL(selectedFile),
        data: selectedFile,
      });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Aucun fichier sélectionné",
        description: "Veuillez sélectionner un fichier à télécharger",
        variant: "destructive",
      });
      return;
    }

    try {
      setUploading(true);
      
      // Créer un FormData pour l'envoi du fichier
      const formData = new FormData();
      formData.append("file", file.data);
      formData.append("type", fileType);
      formData.append("candidateId", candidateId);
      
      // Envoyer le fichier à l'API
      const response = await axios.post("/api/google-drive-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      
      if (response.data.url) {
        // Appeler le callback avec l'URL du fichier téléchargé
        onFileUploaded(response.data.url);
        
        toast({
          title: "Fichier téléchargé",
          description: `Le fichier a été téléchargé avec succès`,
        });
      }
    } catch (error) {
      console.error("Erreur lors du téléchargement du fichier:", error);
      
      // Extraire le message d'erreur spécifique de la réponse
      let errorMessage = "Une erreur est survenue lors du téléchargement du fichier";
      
      if (axios.isAxiosError(error) && error.response) {
        // Cas spécifique pour l'erreur 507 (quota de stockage dépassé)
        if (error.response.status === 507) {
          errorMessage = error.response.data.error || "Le quota de stockage Google Drive est dépassé. Veuillez contacter l'administrateur.";
        } else {
          // Autres erreurs avec message
          errorMessage = error.response.data.error || error.response.data.detail || errorMessage;
        }
      }
      
      toast({
        title: "Erreur de téléchargement",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById(`file-${fileType}`)?.click()}
          className="w-full"
          disabled={uploading}
        >
          <Upload className="mr-2 h-4 w-4" />
          {file ? file.data.name : buttonText}
        </Button>
        <input
          id={`file-${fileType}`}
          type="file"
          accept=".pdf,.doc,.docx"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
      </div>
      {file && (
        <Button 
          onClick={handleUpload} 
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
              Téléchargement...
            </>
          ) : (
            "Télécharger le fichier"
          )}
        </Button>
      )}
    </div>
  );
}