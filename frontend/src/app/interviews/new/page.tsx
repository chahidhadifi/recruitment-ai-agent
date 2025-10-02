"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Mic, MicOff, Send, User } from "lucide-react";
import dynamic from "next/dynamic";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

const AvatarCanvas = dynamic(() => import("@/components/AvatarCanvas"), {
  ssr: false,
  loading: () => (
    <div className="w-[300px] h-[400px] rounded-xl border border-border bg-card shadow-lg flex items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
        <User className="h-10 w-10 text-primary animate-pulse" />
      </div>
    </div>
  )
});

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
};

type Question = {
  question: string;
  type: string;
  ai_response: string;
};

export default function NewInterviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewInterviewContent />
    </Suspense>
  );
}

function NewInterviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const candidateId = searchParams.get("candidate");
  const applicationId = searchParams.get("application");
  const { toast } = useToast();
  const { data: session } = useSession();
  
  const [candidate, setCandidate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewFinished, setInterviewFinished] = useState(false);
  const [interviewId, setInterviewId] = useState<number | null>(null);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  const isCandidat = session?.user?.role === "candidat";
  
  const API_URL = 'http://localhost:8000';

  // Charger le candidat et ses informations
  useEffect(() => {
    const loadCandidateInfo = async () => {
      console.log('🔍 Chargement infos candidat:', { candidateId });

      if (candidateId) {
        try {
          const url = `${API_URL}/api/applications/candidate-info/${candidateId}`;
          console.log('📡 Appel API:', url);
          
          const response = await fetch(url, {
            headers: {
              'Authorization': `Bearer ${session?.user?.token}`,
            }
          });
          
          console.log('📨 Réponse API:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('✅ Données candidat reçues:', data);
            setCandidate(data);
          } else {
            const errorText = await response.text();
            console.error('❌ Erreur API:', errorText);
            setCandidate({
              id: candidateId,
              name: "Candidat",
              position: "Développeur Full Stack",
              job_description: "Poste de développement full stack"
            });
          }
        } catch (error) {
          console.error('💥 Erreur lors du chargement du candidat:', error);
          setCandidate({
            id: candidateId,
            name: "Candidat",
            position: "Développeur Full Stack", 
            job_description: "Poste de développement full stack"
          });
        }
      } else if (isCandidat && session?.user) {
        setCandidate({
          id: session.user.id,
          name: session.user.name,
          position: "Développeur Full Stack",
          job_description: "Poste de développement full stack"
        });
      }
      setLoading(false);
    };

    if (session) {
      loadCandidateInfo();
    } else {
      setLoading(false);
    }
  }, [candidateId, session, isCandidat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fonction pour générer les questions en appelant DIRECTEMENT n8n
 const generateQuestions = async () => {
  const position = candidate?.position || "Développeur Full Stack";
  const jobDescription = candidate?.job_description || candidate?.jobDescription || "Poste de développement full stack";
  
  console.log('🎯 Génération questions via FastAPI:', { position, jobDescription });
  
  setGeneratingQuestions(true);
  
  try {
    // Appel à votre API FastAPI qui va appeler n8n
    const response = await fetch(`${API_URL}/api/interviews/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.user?.token}`,
      },
      body: JSON.stringify({
        candidate_id: candidateId || session?.user?.id?.toString(),
        application_id: applicationId,
        position: position,
        job_description: jobDescription,
        date: new Date().toISOString(),
        duration: "45 minutes"
      })
    });
    
    console.log('📨 Réponse FastAPI:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur FastAPI:', errorText);
      throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
    }
    
    const data = await response.json();
    console.log('✅ Données reçues via FastAPI:', data);
    
    // Adapter selon la structure de réponse
    const questionsData = data.questions || [];
    
    if (questionsData.length === 0) {
      throw new Error('Aucune question générée');
    }
    
    setQuestions(questionsData);
    setInterviewId(data.interview_id || data.id);
    
    toast({
      title: "Questions générées avec succès",
      description: `${questionsData.length} questions prêtes pour l'entretien.`,
    });
    
    return questionsData;
    
  } catch (error) {
    console.error('Erreur lors de la génération:', error);
    toast({
      title: "Erreur",
      description: error instanceof Error 
        ? error.message 
        : "Impossible de générer les questions d'entretien.",
      variant: "destructive",
    });
    return null;
  } finally {
    setGeneratingQuestions(false);
  }
};

  const startInterviewWithQuestions = (questionsToUse: Question[]) => {
    setInterviewStarted(true);
    
    if (questionsToUse.length > 0) {
      const firstQuestion = questionsToUse[0];
      addMessage({
        id: Date.now().toString(),
        role: "assistant",
        content: firstQuestion.question,
        timestamp: new Date(),
      });
      
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent("avatar:say", { 
          detail: { text: firstQuestion.question } 
        }));
      }, 500);
      
      toast({
        title: "Entretien démarré",
        description: "Veuillez répondre aux questions de l'assistant.",
      });
    }
  };

  const startInterview = async () => {
    if (!candidate) {
      toast({
        title: "Erreur",
        description: "Aucune information candidat disponible.",
        variant: "destructive",
      });
      return;
    }

    if (interviewStarted) return;

    console.log('🚀 Démarrage entretien avec candidat:', candidate);

    // Générer les questions via n8n directement
    const questionsGenerated = await generateQuestions();
    
    if (!questionsGenerated) {
      return;
    }

    // Démarrer l'entretien avec les questions générées
    startInterviewWithQuestions(questionsGenerated);
  };

  const addMessage = (message: Message) => {
    setMessages((prev) => [...prev, message]);
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputValue,
      timestamp: new Date(),
    };
    addMessage(userMessage);
    setInputValue("");

    setTimeout(() => {
      const nextQuestionIndex = currentQuestionIndex + 1;
      
      if (nextQuestionIndex < questions.length) {
        setCurrentQuestionIndex(nextQuestionIndex);
        const nextQuestion = questions[nextQuestionIndex];
        
        addMessage({
          id: Date.now().toString(),
          role: "assistant",
          content: nextQuestion.question,
          timestamp: new Date(),
        });

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent("avatar:say", { 
            detail: { text: nextQuestion.question } 
          }));
        }, 500);
      } else {
        finishInterview();
      }
    }, 1000);
  };

  const saveInterviewResponses = async () => {
    if (!interviewId) return;

    try {
      const questionsData = messages
        .filter(m => m.role === "assistant")
        .map(m => m.content);
      
      const responsesData = messages
        .filter(m => m.role === "user")
        .map(m => m.content);

      const saveResponse = await fetch(`${API_URL}/api/interviews/${interviewId}/responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.token}`,
        },
        body: JSON.stringify({
          questions: questionsData,
          responses: responsesData,
          scores: {}
        })
      });

      if (!saveResponse.ok) {
        console.error('Erreur sauvegarde réponses:', await saveResponse.text());
      } else {
        console.log('✅ Réponses sauvegardées avec succès');
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des réponses:', error);
    }
  };

  const finishInterview = async () => {
    const finalMessage = isCandidat
      ? "Merci pour cet entretien. Nous avons terminé toutes les questions. Votre participation est très appréciée. Nous allons analyser vos réponses et mettre à jour le statut de votre candidature prochainement. Vous serez redirigé vers la page de vos candidatures."
      : "Merci pour cet entretien. Nous avons terminé toutes les questions. Nous allons analyser les réponses et vous contacterons prochainement avec les résultats.";
    
    addMessage({
      id: Date.now().toString(),
      role: "assistant",
      content: finalMessage,
      timestamp: new Date(),
    });

    setTimeout(() => {
      window.dispatchEvent(new CustomEvent("avatar:say", { 
        detail: { text: finalMessage } 
      }));
    }, 500);
    
    setInterviewFinished(true);
    
    // Sauvegarder les réponses
    await saveInterviewResponses();
    
    setTimeout(() => {
      toast({
        title: "Entretien terminé",
        description: isCandidat
          ? "Votre entretien a été enregistré avec succès."
          : "Le rapport d'évaluation sera généré prochainement.",
      });
      
      setTimeout(() => {
        if (isCandidat) {
          router.push("/jobs/my-applications");
        } else if (candidateId) {
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
      
      setTimeout(() => {
        const simulatedTranscription = "Voici ma réponse transcrite à partir de l'audio.";
        setInputValue(simulatedTranscription);
        inputRef.current?.focus();
      }, 2000);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container py-10 flex justify-center items-center min-h-[60vh]">
          <div className="animate-pulse flex flex-col space-y-4 w-full max-w-6xl">
            <div className="h-8 bg-muted rounded w-1/4"></div>
            <div className="h-[600px] bg-muted rounded"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-10 max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Retour
          </Button>
          
          <div className="flex gap-2">
            {isCandidat && (
              <Button variant="outline" onClick={() => router.push("/jobs/my-applications")}>
                Voir mes candidatures
              </Button>
            )}
            
            {!isCandidat && candidate && (
              <Button variant="outline" onClick={() => router.push(`/candidates/${candidate.id}`)}>
                Profil du candidat
              </Button>
            )}
          </div>
        </div>

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
            
            <p className="mb-6">
              L'entretien sera conduit par notre assistant IA qui posera une série de questions au candidat. 
              Les réponses seront analysées pour générer un rapport dévaluation complet.
            </p>
            
            <div className="space-y-4">
              {candidate && (
                <div className="bg-muted p-4 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">Informations du candidat :</h3>
                  <p className="text-sm"><strong>Nom:</strong> {candidate.name}</p>
                  <p className="text-sm"><strong>Poste:</strong> {candidate.position}</p>
                  <p className="text-sm"><strong>Description:</strong> {candidate.job_description ? `${candidate.job_description.substring(0, 100)}...` : "Non disponible"}</p>
                </div>
              )}
              
              <div>
                <h3 className="text-sm font-medium mb-2">Durée estimée :</h3>
                <p className="text-sm">15-20 minutes</p>
              </div>
            </div>
            
            <div className="mt-8 flex justify-center">
              <Button 
                onClick={startInterview} 
                className="w-full max-w-xs"
                size="lg"
                disabled={generatingQuestions || interviewStarted}
              >
                {generatingQuestions ? "Génération des questions..." : "Démarrer l'entretien"}
              </Button>
            </div>

            {generatingQuestions && (
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  Génération des questions en cours... Cela peut prendre quelques secondes.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b">
                <h2 className="font-semibold">Assistant d'entretien IA</h2>
              </div>
              <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-primary/10">
                <AvatarCanvas className="mb-4" width={300} height={400} />
              </div>
            </div>

            <div className="bg-card rounded-lg shadow-sm overflow-hidden flex flex-col h-[600px]">
              <div className="p-4 border-b">
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold">Conversation</h2>
                  <div className="text-xs text-muted-foreground">
                    Question {currentQuestionIndex + 1} / {questions.length}
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === "assistant" ? "justify-start" : "justify-end"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.role === "assistant" 
                            ? "bg-muted border border-border" 
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        <p className="text-sm leading-relaxed">{message.content}</p>
                        <div className="text-xs opacity-70 mt-2 text-right">
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
                    disabled={interviewFinished}
                  >
                    {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                  <textarea
                    ref={inputRef}
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm resize-none min-h-[80px]"
                    placeholder={interviewFinished ? "Entretien terminé" : "Tapez votre réponse ici..."}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={interviewFinished}
                    rows={3}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || interviewFinished}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {interviewFinished && (
                  <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 rounded-md">
                    <p className="text-sm text-green-800 dark:text-green-300 text-center font-medium">
                      Lentretien est terminé. Merci pour votre participation.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}