"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Loader2, Mic, MicOff, Send, ArrowLeft } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
};

type InterviewState = "waiting" | "in_progress" | "completed";

export default function AIInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [interviewState, setInterviewState] = useState<InterviewState>("waiting");
  const [progress, setProgress] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Vérifier si l'utilisateur est un candidat
  const isCandidat = session?.user?.role === "candidat";
  
  // Récupérer les paramètres de l'URL
  useEffect(() => {
    const appId = searchParams.get("application");
    if (appId) {
      setApplicationId(appId);
    }
    
    const autostart = searchParams.get("autostart");
    if (autostart === "true") {
      startInterview();
    }
  }, [searchParams]);
  
  // Rediriger si l'utilisateur n'est pas un candidat
  useEffect(() => {
    if (session && !isCandidat) {
      router.push("/");
    }
  }, [session, isCandidat, router]);
  
  // Faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);
  
  // Démarrer l'entretien
  const startInterview = () => {
    setInterviewState("in_progress");
    setProgress(0);
    
    // Message de bienvenue de l'IA
    const welcomeMessage: Message = {
      id: Date.now().toString(),
      content: "Bonjour ! Je suis votre assistant d'entretien IA. Je vais vous poser quelques questions pour mieux connaître votre profil et vos compétences. Commençons par une présentation : pouvez-vous me parler de votre parcours professionnel ?",
      role: "assistant",
      timestamp: new Date(),
    };
    
    setMessages([welcomeMessage]);
  };
  
  // Envoyer un message
  const sendMessage = async () => {
    if (!inputValue.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      role: "user",
      timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    
    try {
      // Simuler une réponse de l'IA (à remplacer par un appel API réel)
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Progression de l'entretien
      const newProgress = Math.min(progress + 20, 100);
      setProgress(newProgress);
      
      // Vérifier si l'entretien est terminé
      if (newProgress >= 100) {
        setInterviewState("completed");
        
        const completionMessage: Message = {
          id: Date.now().toString(),
          content: "Merci pour cet entretien ! J'ai toutes les informations dont j'avais besoin. Votre candidature va maintenant être évaluée par notre équipe de recrutement qui reviendra vers vous très prochainement.",
          role: "assistant",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, completionMessage]);
        
        // Mettre à jour le statut de la candidature (à implémenter)
        if (applicationId) {
          // updateApplicationStatus(applicationId, "reviewing");
          toast({
            title: "Entretien terminé",
            description: "Votre entretien a été enregistré avec succès.",
          });
        }
      } else {
        // Questions suivantes basées sur la progression
        let nextQuestion = "";
        
        if (newProgress <= 20) {
          nextQuestion = "Quelles sont vos principales compétences techniques ?";  
        } else if (newProgress <= 40) {
          nextQuestion = "Pouvez-vous me parler d'un projet dont vous êtes particulièrement fier ? Quels étaient les défis et comment les avez-vous surmontés ?";  
        } else if (newProgress <= 60) {
          nextQuestion = "Comment gérez-vous les situations stressantes ou les délais serrés ?";  
        } else if (newProgress <= 80) {
          nextQuestion = "Quelles sont vos attentes concernant ce poste et pourquoi pensez-vous être un bon candidat ?";  
        } else {
          nextQuestion = "Avez-vous des questions concernant l'entreprise ou le poste ?";  
        }
        
        const assistantMessage: Message = {
          id: Date.now().toString(),
          content: nextQuestion,
          role: "assistant",
          timestamp: new Date(),
        };
        
        setMessages((prev) => [...prev, assistantMessage]);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'envoi de votre message.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };
  
  // Gérer l'enregistrement vocal (à implémenter)
  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implémenter la logique d'enregistrement vocal
  };
  
  // Retourner à la liste des candidatures
  const goBack = () => {
    router.push("/jobs/my-applications");
  };
  
  if (!session) {
    return null;
  }

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex items-center mb-6">
          <Button variant="ghost" onClick={goBack} className="mr-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux candidatures
          </Button>
          <h1 className="text-2xl font-bold">Entretien IA</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-4">
                    <Image 
                      src="/avatar-ai-interviewer.svg" 
                      alt="AI Interviewer" 
                      fill 
                      className="object-contain"
                    />
                  </div>
                  
                  <h2 className="text-xl font-semibold mb-2">Assistant d'entretien IA</h2>
                  
                  {interviewState === "waiting" ? (
                    <div className="text-center">
                      <p className="text-muted-foreground mb-4">
                        Cet assistant va vous guider à travers un entretien virtuel pour évaluer votre candidature.
                      </p>
                      <Button onClick={startInterview}>Commencer l&apos;entretien</Button>
                    </div>
                  ) : (
                    <div className="w-full">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progression</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="mb-4" />
                      
                      {interviewState === "completed" && (
                        <div className="text-center mt-4">
                          <p className="text-green-600 font-medium mb-2">Entretien terminé !</p>
                          <Button variant="outline" onClick={goBack}>Retour aux candidatures</Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card className="h-full flex flex-col">
              <CardContent className="flex-1 p-6 flex flex-col">
                <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-muted-foreground text-center">
                        {interviewState === "waiting" 
                          ? "Cliquez sur 'Commencer l'entretien' pour démarrer" 
                          : "Aucun message pour le moment"}
                      </p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div 
                          className={`max-w-[80%] rounded-lg p-3 ${message.role === "user" 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted"}`}
                        >
                          <p>{message.content}</p>
                          <div className="text-xs opacity-70 mt-1">
                            {message.timestamp.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
                
                {interviewState === "in_progress" && (
                  <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Tapez votre réponse..."
                        disabled={isLoading || interviewState === "completed"}
                        className="pr-10"
                      />
                    </div>
                    
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="icon" 
                      onClick={toggleRecording}
                      disabled={isLoading || interviewState === "completed"}
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={!inputValue.trim() || isLoading || interviewState === "completed"}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}