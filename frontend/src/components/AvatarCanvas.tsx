"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Center, OrbitControls, useGLTF, useAnimations } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import * as THREE from "three";

function AvatarModel({ 
  url, 
  isSpeaking, 
  lookTarget 
}: { 
  url: string, 
  isSpeaking: boolean,
  lookTarget: React.MutableRefObject<{ x: number, y: number }>
}) {
  const gltf = useGLTF(url, true);
  const group = useRef<THREE.Group>(null);
  const { actions, names } = useAnimations(gltf.animations, group);

  // Désactive le frustum culling
  useEffect(() => {
    if (gltf.scene) {
      gltf.scene.traverse((child) => {
        if (child.isMesh) {
          child.frustumCulled = false;
          if (child.material) {
            child.material.side = THREE.DoubleSide;
          }
        }
      });
    }
  }, [gltf.scene]);

  // Animation de suivi de la souris
  useFrame(() => {
    // Cherche la tête avec les mêmes noms que dans l'exemple
    const headBone = gltf.scene.getObjectByName("CC_Base_Head") as THREE.Object3D | null;
    
    if (headBone) {
      // Utilise exactement la même logique que l'exemple
      headBone.rotation.y = THREE.MathUtils.clamp(lookTarget.current.x * 0.15, -0.15, 0.15);
      headBone.rotation.x = THREE.MathUtils.clamp(-lookTarget.current.y * 0.3, -1, -0.2);
      headBone.rotation.z = THREE.MathUtils.clamp(-lookTarget.current.x * 0.05, -0.05, 0.05);
    }
  });

  useEffect(() => {
    if (!group.current) return;
    const animationName = names[0];
    const talkAction = actions[animationName];
    
    if (talkAction) {
      if (isSpeaking) {
        talkAction.reset();
        talkAction.play();
        talkAction.paused = false;
        talkAction.timeScale = 1.1;
        talkAction.setLoop(THREE.LoopRepeat, Infinity);
      } else {
        talkAction.paused = true;
        talkAction.time = 0;
      }
    }
  }, [actions, names, group.current, isSpeaking]);

  return (
    <group ref={group} position={[0, 0, 0]}>
      <primitive 
        object={gltf.scene} 
        frustumCulled={false}
        scale={1}
      />
    </group>
  );
}

function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    async function onSay(e: CustomEvent<{ text: string }>) {
      const text = e.detail?.text ?? "";
      if ("speechSynthesis" in window) {
        let voices = window.speechSynthesis.getVoices();
        if (!voices.length) {
          await new Promise(resolve => {
            window.speechSynthesis.onvoiceschanged = resolve;
          });
          voices = window.speechSynthesis.getVoices();
        }
        
        // Chercher spécifiquement la voix de Paul
        const paul = voices.find(v => v.name === "Microsoft Paul - French (France)");
        
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "fr-FR";
        utter.rate = 0.95; // Vitesse naturelle
        utter.pitch = 1.0; // Pitch normal pour Paul (déjà une voix masculine)
        
        if (paul) {
          utter.voice = paul;
          console.log('Voix Paul sélectionnée');
        } else {
          console.warn('Voix Paul non trouvée, utilisation de la voix par défaut');
        }
        
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utter);
      }
    }
    window.addEventListener("avatar:say", onSay as EventListener);
    return () => window.removeEventListener("avatar:say", onSay as EventListener);
  }, []);

  return isSpeaking;
}

interface AvatarCanvasProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function AvatarCanvas({ className = "", width = 350, height = 450 }: AvatarCanvasProps) {
  const [hasModel, setHasModel] = useState<boolean | null>(null);
  const lookTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const isSpeaking = useSpeech();

  useEffect(() => {
    let aborted = false;
    (async () => {
      try {
        const res = await fetch("/api/avatar", { method: "HEAD" });
        console.log('Avatar GLB check:', res.status, res.ok);
        if (res.ok && !aborted) {
          setHasModel(true);
        } else {
          console.warn('Avatar GLB not found, using fallback');
          if (!aborted) setHasModel(false);
        }
      } catch (error) {
        console.error('Error loading avatar:', error);
        if (!aborted) setHasModel(false);
      }
    })();
    return () => { aborted = true; };
  }, []);

  // Suivi de la souris dans toute la page
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Utilise toute la fenêtre comme référence
      const cx = e.clientX / window.innerWidth;
      const cy = e.clientY / window.innerHeight;
      // Conversion exacte comme dans l'exemple
      lookTargetRef.current.x = THREE.MathUtils.clamp(cx * 2 - 1, -1, 1);
      lookTargetRef.current.y = THREE.MathUtils.clamp(-(cy * 2 - 1), -1, 1);
    };

    // Écoute les mouvements de souris sur toute la page
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className="relative rounded-xl overflow-hidden border border-border bg-card shadow-lg"
        style={{ 
          width: width,
          height: height
        }}
      >
        <Canvas 
          camera={{ 
            position: [0, 1.6, 0.7],
            fov: 40,
            near: 0.1, 
            far: 100 
          }}
        >
          <hemisphereLight intensity={0.7} groundColor={new THREE.Color(0x222222)} />
          <directionalLight position={[3, 5, 2]} intensity={0.9} />
          <Suspense fallback={
            <mesh position={[0, 1.6, 0]}>
              <sphereGeometry args={[0.3, 32, 32]} />
              <meshStandardMaterial color="#2563eb" wireframe />
            </mesh>
          }>
            {hasModel ? (
              <AvatarModel 
                url="/api/avatar" 
                isSpeaking={isSpeaking}
                lookTarget={lookTargetRef}
              />
            ) : (
              // Fallback si pas de modèle
              <mesh position={[0, 1.6, 0]}>
                <sphereGeometry args={[0.3, 32, 32]} />
                <meshStandardMaterial color="#3b82f6" />
              </mesh>
            )}
          </Suspense>
          <OrbitControls
            enablePan={false}
            minDistance={0.4}
            maxDistance={0.8}
            target={[0, 1.6, 0.1]}
          />
        </Canvas>
        
        {/* Indicateur de statut */}
        <div className="absolute top-2 left-2 flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isSpeaking ? 'bg-red-500 animate-pulse' : 'bg-green-500'}`} />
          <span className="text-xs text-muted-foreground">
            {isSpeaking ? 'Parle...' : 'En écoute'}
          </span>
        </div>
      </div>
    </div>
  );
}

// Préchargement du modèle
useGLTF.preload("/api/avatar");