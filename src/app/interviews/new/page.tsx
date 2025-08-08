"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Mic, MicOff, Send, User } from "lucide-react";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

// Données fictives pour la démonstration
const mockCandidates = {
  "1": {
    id: "1",
    name: "Jean Dupont",
    position: "Développeur Frontend",
  },
  "2": {
    id: "2",
    name: "Marie Martin",
    position: "UX Designer",
  },
  "3": {
    id: "3",
    name: "Pierre Durand",
    position: "Développeur Backend",
  },
};

// Questions prédéfinies pour l'entretien
const predefinedQuestions = [
  {
    id: 1,
    text: "Bonjour et bienvenue à cet entretien. Pouvez-vous vous présenter brièvement et me parler de votre parcours professionnel ?",
    type: "introduction",
  },
  {
    id: 2,
    text: "Pourquoi êtes-vous intéressé par ce poste et notre entreprise ?",
    type: "motivation",
  },
  {
    id: 3,
    text: "Pouvez-vous me décrire un projet sur lequel vous avez travaillé et dont vous êtes particulièrement fier ?",
    type: "experience",
  },
  {
    id: 4,
    text: "Comment gérez-vous les situations stressantes ou les délais serrés ?",
    type: "comportement",
  },
  {
    id: 5,
    text: "Quelles sont vos principales forces et faiblesses professionnelles ?",
    type: "auto-évaluation",
  },
  {
    id: 6,
    text: "Où vous voyez-vous professionnellement dans 5 ans ?",
    type: "projection",
  },
  {
    id: 7,
    text: "Avez-vous des questions à me poser sur le poste ou l'entreprise ?",
    type: "conclusion",
  },
];

// Questions spécifiques par poste
const positionSpecificQuestions = {
  "Développeur Frontend": [
    {
      id: 101,
      text: "Pouvez-vous expliquer la différence entre Flexbox et Grid en CSS ?",
      type: "technique",
    },
    {
      id: 102,
      text: "Comment optimiseriez-vous les performances d'une application React ?",
      type: "technique",
    },
    {
      id: 103,
      text: "Quelle est votre approche pour rendre une interface utilisateur accessible ?",
      type: "technique",
    },
  ],
  "UX Designer": [
    {
      id: 201,
      text: "Pouvez-vous décrire votre processus de conception UX ?",
      type: "technique",
    },
    {
      id: 202,
      text: "Comment abordez-vous l'accessibilité dans vos designs ?",
      type: "technique",
    },
    {
      id: 203,
      text: "Comment mesurez-vous le succès d'un design UX ?",
      type: "technique",
    },
  ],
  "Développeur Backend": [
    {
      id: 301,
      text: "Comment gérez-vous la sécurité dans vos applications ?",
      type: "technique",
    },
    {
      id: 302,
      text: "Pouvez-vous expliquer votre approche pour optimiser les performances d'une base de données ?",
      type: "technique",
    },
    {
      id: 303,
      text: "Comment concevez-vous une API RESTful ?",
      type: "technique",
    },
  ],
};

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

export default function NewInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidate");
  const { toast } = useToast();
  
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Charger les données du candidat
  useEffect(() => {
    if (candidateId) {
      // Simuler un chargement de données
      setTimeout(() => {
        const candidateData = mockCandidates[candidateId as keyof typeof mockCandidates];
        if (candidateData) {
          setCandidate(candidateData);
        }
        setLoading(false);
      }, 500);
    } else {
      setLoading(false);
    }
  }, [candidateId]);

  // Défilement automatique vers le bas lors de nouveaux messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const startInterview = () => {
    if (!candidate) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un candidat pour démarrer l'entretien.",
        variant: "destructive",
      });
      return;
    }

    setInterviewStarted(true);
    
    // Ajouter le premier message de l'assistant
    const firstQuestion = predefinedQuestions[0];
    addMessage({
      id: Date.now().toString(),
      role: "assistant",
      content: firstQuestion.text,
      timestamp: new Date(),
    });
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    // Ajouter le message de l'utilisateur
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInputValue("");

    // Simuler le traitement de la réponse
    setTimeout(() => {
      // Passer à la question suivante
      const nextQuestionIndex = currentQuestionIndex + 1;
      
      // Vérifier si nous avons des questions générales restantes
      if (nextQuestionIndex < predefinedQuestions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
        const nextQuestion = predefinedQuestions[nextQuestionIndex];
        
        addMessage({
          id: Date.now().toString(),
          role: "assistant",
          content: nextQuestion.text,
          timestamp: new Date(),
        });
      } 
      // Sinon, vérifier si nous avons des questions spécifiques au poste
      else if (candidate && candidate.position) {
        const specificQuestions = positionSpecificQuestions[candidate.position as keyof typeof positionSpecificQuestions];
        const specificQuestionIndex = nextQuestionIndex - predefinedQuestions.length;
        
        if (specificQuestions && specificQuestionIndex < specificQuestions.length) {
          const nextSpecificQuestion = specificQuestions[specificQuestionIndex];
          
          addMessage({
            id: Date.now().toString(),
            role: "assistant",
            content: nextSpecificQuestion.text,
            timestamp: new Date(),
          });
          
          setCurrentQuestionIndex(nextQuestionIndex);
        } else {
          // Fin de l'entretien
          finishInterview();
        }
      } else {
        // Fin de l'entretien
        finishInterview();
      }
    }, 1000);
  };

  const finishInterview = () => {
    addMessage({
      id: Date.now().toString(),
      role: "assistant",
      content: "Merci pour cet entretien. Nous avons terminé toutes les questions. Votre participation est très appréciée. Nous allons analyser vos réponses et vous contacterons prochainement avec les résultats.",
      timestamp: new Date(),
    });
    
    setInterviewFinished(true);
    
    // Simuler la génération d'un rapport
    setTimeout(() => {
      toast({
        title: "Entretien terminé",
        description: "Le rapport d'évaluation est en cours de génération.",
      });
      
      // Rediriger vers la page du candidat après quelques secondes
      setTimeout(() => {
        if (candidateId) {
          router.push(`/candidates/${candidateId}`);
        } else {
          router.push("/candidates");
        }
      }, 3000);
    }, 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleRecording = () => {
    // Simuler l'enregistrement vocal
    setIsRecording(!isRecording);
    
    if (!isRecording) {
      toast({
        title: "Enregistrement démarré",
        description: "Parlez clairement dans votre microphone.",
      });
    } else {
      toast({
        title: "Enregistrement arrêté",
        description: "Traitement de votre réponse...",
      });
      
      // Simuler la transcription après 2 secondes
      setTimeout(() => {
        const simulatedTranscription = "Voici ma réponse transcrite à partir de l'audio. Je pense que mes compétences correspondent parfaitement au poste et je suis très motivé pour rejoindre votre équipe.";
        setInputValue(simulatedTranscription);
        inputRef.current?.focus();
      }, 2000);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col space-y-4 w-full max-w-3xl">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-[600px] bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Retour
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">
            {interviewStarted
              ? `Entretien avec ${candidate?.name || "le candidat"}`
              : "Nouvel entretien"}
          </h1>
          {candidate && (
            <p className="text-muted-foreground">
              Candidat: {candidate.name} - Poste: {candidate.position}
            </p>
          )}
        </div>

        {!interviewStarted ? (
          <div className="bg-card rounded-lg shadow-sm p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-4">Démarrer un nouvel entretien</h2>
            
            {!candidate && (
              <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 rounded-md">
                <p>Aucun candidat sélectionné. Vous pouvez continuer sans candidat ou retourner à la liste des candidats.</p>
              </div>
            )}
            
            <p className="mb-6">
              L'entretien sera conduit par notre assistant IA qui posera une série de questions au candidat. 
              Les réponses seront analysées pour générer un rapport d'évaluation complet.
            </p>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">L'entretien comprendra :</h3>
                <ul className="list-disc pl-5 space-y-1 text-sm">
                  <li>Questions d'introduction et de motivation</li>
                  <li>Questions sur l'expérience professionnelle</li>
                  <li>Questions techniques spécifiques au poste</li>
                  <li>Questions comportementales</li>
                  <li>Questions de conclusion</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Durée estimée :</h3>
                <p className="text-sm">15-20 minutes</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button onClick={startInterview} className="w-full max-w-xs">
                Démarrer l'entretien
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colonne de gauche - Avatar et animation */}
            <div className="bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Assistant d'entretien IA</h2>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-primary/10">
                <div className="w-40 h-40 rounded-full bg-primary/20 flex items-center justify-center mb-6">
                  <User className="h-20 w-20 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">
                    {isRecording ? "Écoute en cours..." : "En attente de votre réponse..."}
                  </p>
                  <div className="flex justify-center space-x-2">
                    {isRecording && (
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-75"></div>
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse delay-150"></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne de droite - Chat */}
            <div className="bg-card rounded-lg shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Conversation</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${message.role === "assistant" ? "bg-muted" : "bg-primary text-primary-foreground"}`}
                      >
                        <p>{message.content}</p>
                        <div className="text-xs opacity-70 mt-1 text-right">
                          {message.timestamp.toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleRecording}
                    className={isRecording ? "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400" : ""}
                    disabled={interviewFinished}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={inputRef}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none min-h-[80px]"
                      placeholder="Tapez votre réponse ici..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={handleKeyDown}
                      disabled={interviewFinished}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || interviewFinished}
                    className="self-end"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {interviewFinished && (
                  <p className="text-sm text-muted-foreground mt-2 text-center">
                    L'entretien est terminé. Merci pour votre participation.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}