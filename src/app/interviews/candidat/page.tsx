'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Mic, Send, StopCircle, Play, Pause } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MainLayout } from '@/components/main-layout';
import { DEFAULT_CANDIDAT_USER } from '@/types/user-roles';

// Types pour les messages
type MessageType = 'text' | 'voice';
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  type: MessageType;
  timestamp: Date;
  audioUrl?: string;
}

export default function CandidatInterviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const interviewId = searchParams.get('id');
  
  const { data: realSession } = useSession();
  const session = realSession || { user: { ...DEFAULT_CANDIDAT_USER, role: 'candidat' } };
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Bonjour et bienvenue à cet entretien. Je suis votre assistant virtuel et je vais vous poser quelques questions concernant votre candidature. Êtes-vous prêt à commencer ?',
      type: 'text',
      timestamp: new Date()
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Questions d'exemple pour l'entretien - simuler des questions provenant d'une offre d'emploi
  const sampleQuestions = [
    "Pouvez-vous me parler de votre expérience professionnelle précédente ?",
    "Quelles sont vos compétences techniques principales dans le domaine du développement web ?",
    "Comment abordez-vous l'apprentissage de nouvelles technologies ?",
    "Décrivez un projet complexe sur lequel vous avez travaillé et les défis que vous avez surmontés.",
    "Comment gérez-vous les situations stressantes ou les délais serrés ?",
    "Quelle est votre expérience avec les méthodologies agiles ?",
    "Comment collaborez-vous avec les autres membres d'une équipe de développement ?",
    "Pourquoi êtes-vous intéressé par ce poste et notre entreprise ?",
    "Où vous voyez-vous professionnellement dans 5 ans ?",
    "Avez-vous des questions concernant l'entreprise ou le poste ?"
  ];

  // Fonction pour faire défiler automatiquement vers le bas
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Effet pour faire défiler vers le bas lorsque de nouveaux messages sont ajoutés
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  // Effet pour simuler le début de l'entretien
  useEffect(() => {
    // Simuler un délai avant de poser la première question
    const timer = setTimeout(() => {
      askNextQuestion();
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  // Fonction pour poser la question suivante
  const askNextQuestion = () => {
    if (currentQuestionIndex < sampleQuestions.length) {
      const question = sampleQuestions[currentQuestionIndex];
      
      setIsAvatarSpeaking(true);
      
      // Simuler un délai pour la "réflexion" de l'assistant
      setTimeout(() => {
        const newMessage: Message = {
          id: `question-${currentQuestionIndex}`,
          role: 'assistant',
          content: question,
          type: 'text',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Simuler la durée de la parole
        const speechTime = question.length * 50; // Temps approximatif basé sur la longueur du texte
        setTimeout(() => {
          setIsAvatarSpeaking(false);
        }, speechTime);
        
        setCurrentQuestionIndex(prev => prev + 1);
      }, 1000);
    } else {
      // Fin de l'entretien
      setIsAvatarSpeaking(true);
      
      setTimeout(() => {
        const endMessage: Message = {
          id: 'end',
          role: 'assistant',
          content: 'Merci pour vos réponses. L\'entretien est maintenant terminé. Nous vous contacterons prochainement avec les résultats.',
          type: 'text',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, endMessage]);
        
        // Simuler la durée de la parole finale
        setTimeout(() => {
          setIsAvatarSpeaking(false);
          
          // Rediriger vers la page des entretiens après un délai
          setTimeout(() => {
            router.push('/interviews');
          }, 3000);
        }, 5000);
      }, 1000);
    }
  };

  // Simuler la réponse de l'assistant après une réponse de l'utilisateur
  const handleAssistantResponse = () => {
    // Attendre un peu avant de poser la question suivante
    setTimeout(() => {
      askNextQuestion();
    }, 1500);
  };

  // Envoyer un message texte
  const handleSendMessage = () => {
    if (input.trim() === '') return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input,
      type: 'text',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    handleAssistantResponse();
  };

  // Gérer l'enregistrement vocal
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        
        // Créer un URL pour l'audio enregistré
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Ajouter le message vocal
        const newMessage: Message = {
          id: `voice-${Date.now()}`,
          role: 'user',
          content: "Message vocal",
          type: 'voice',
          timestamp: new Date(),
          audioUrl,
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Libérer les pistes audio
        stream.getTracks().forEach(track => track.stop());
        
        handleAssistantResponse();
      };
      
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="flex flex-col md:flex-row gap-6 h-[calc(100vh-200px)]">
          {/* Partie gauche - Avatar */}
          <div className="w-full md:w-1/3 bg-card rounded-lg shadow-sm overflow-hidden flex flex-col items-center justify-center p-6">
            <div className="relative w-64 h-64 mb-4">
              <div className={`absolute inset-0 flex items-center justify-center ${isAvatarSpeaking ? 'animate-pulse' : ''}`}>
                <Avatar className="w-full h-full">
                  <AvatarImage src="/avatar-interviewer.svg" alt="Interviewer" />
                  <AvatarFallback className="text-4xl bg-primary text-primary-foreground">
                    AI
                  </AvatarFallback>
                </Avatar>
              </div>
              {isAvatarSpeaking && (
                <div className="absolute bottom-0 left-0 right-0 flex justify-center">
                  <div className="flex gap-1 items-center bg-primary/20 rounded-full px-3 py-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </div>
            <h2 className="text-xl font-semibold mb-2">Assistant d'entretien IA</h2>
            <p className="text-center text-muted-foreground">
              Je suis là pour vous guider à travers cet entretien. Répondez aux questions de la manière qui vous semble la plus appropriée.
            </p>
          </div>
          
          {/* Partie droite - Chat */}
          <div className="w-full md:w-2/3 bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b">
              <h2 className="text-xl font-semibold">Entretien en cours</h2>
              <p className="text-sm text-muted-foreground">
                Vous pouvez répondre par texte ou par message vocal
              </p>
            </div>
            
            {/* Zone des messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                  >
                    {message.type === 'text' ? (
                      <p>{message.content}</p>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => {
                            if (message.audioUrl) {
                              const audio = new Audio(message.audioUrl);
                              audio.play();
                            }
                          }}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <span>Message vocal</span>
                      </div>
                    )}
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Zone de saisie */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tapez votre message..."
                  disabled={isRecording}
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                
                {!isRecording ? (
                  <div className="flex flex-col gap-2">
                    <Button onClick={handleSendMessage} disabled={!input.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={startRecording}>
                      <Mic className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button variant="destructive" onClick={stopRecording}>
                    <StopCircle className="h-4 w-4 mr-2" />
                    Arrêter
                  </Button>
                )}
              </div>
              {isRecording && (
                <div className="mt-2 text-center text-sm text-primary animate-pulse">
                  Enregistrement en cours...
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}