import React, { Suspense, useEffect, useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, Loader, Environment, useFBX, useAnimations, OrthographicCamera } from '@react-three/drei';
import { MeshStandardMaterial } from 'three/src/materials/MeshStandardMaterial';

import { LineBasicMaterial, MeshPhysicalMaterial, Vector2 } from 'three';
import ReactAudioPlayer from 'react-audio-player';

import createAnimation from './converter';
import blinkData from './blendDataBlink.json';

import * as THREE from 'three';
import axios from 'axios';
import { SRGBColorSpace, LinearSRGBColorSpace } from 'three';

const _ = require('lodash');

const host = 'http://localhost:5000'

function Avatar({ avatar_url, speak, setSpeak, text, setAudioSource, playing, currentAudioTime, setCurrentAudioTime, setGltf }) {

  let gltf = useGLTF(avatar_url);
  let morphTargetDictionaryBody = null;
  let morphTargetDictionaryLowerTeeth = null;
  
  // Pass gltf reference to parent component
  useEffect(() => {
    if (gltf && setGltf) {
      setGltf(gltf);
    }
  }, [gltf, setGltf]);

  const [ 
    bodyTexture, 
    eyesTexture, 
    teethTexture, 
    bodySpecularTexture, 
    bodyRoughnessTexture, 
    bodyNormalTexture,
    teethNormalTexture,
    // teethSpecularTexture,
    hairTexture,
    tshirtDiffuseTexture,
    tshirtNormalTexture,
    tshirtRoughnessTexture,
    hairAlphaTexture,
    hairNormalTexture,
    hairRoughnessTexture,
    ] = useTexture([
    "/images/body.webp",
    "/images/eyes.webp",
    "/images/teeth_diffuse.webp",
    "/images/body_specular.webp",
    "/images/body_roughness.webp",
    "/images/body_normal.webp",
    "/images/teeth_normal.webp",
    // "/images/teeth_specular.webp",
    "/images/h_color.webp",
    "/images/tshirt_diffuse.webp",
    "/images/tshirt_normal.webp",
    "/images/tshirt_roughness.webp",
    "/images/h_alpha.webp",
    "/images/h_normal.webp",
    "/images/h_roughness.webp",
  ]);

  _.each([
    bodyTexture, 
    eyesTexture, 
    teethTexture, 
    teethNormalTexture, 
    bodySpecularTexture, 
    bodyRoughnessTexture, 
    bodyNormalTexture, 
    tshirtDiffuseTexture, 
    tshirtNormalTexture, 
    tshirtRoughnessTexture,
    hairAlphaTexture,
    hairNormalTexture,
    hairRoughnessTexture
  ], t => {
    t.colorSpace = SRGBColorSpace;
    t.flipY = false;
  });

  bodyNormalTexture.colorSpace = LinearSRGBColorSpace;
  tshirtNormalTexture.colorSpace = LinearSRGBColorSpace;
  teethNormalTexture.colorSpace = LinearSRGBColorSpace;
  hairNormalTexture.colorSpace = LinearSRGBColorSpace;

  
  gltf.scene.traverse(node => {


    if(node.type === 'Mesh' || node.type === 'LineSegments' || node.type === 'SkinnedMesh') {

      node.castShadow = true;
      node.receiveShadow = true;
      node.frustumCulled = false;

    
      if (node.name.includes("Body")) {

        node.castShadow = true;
        node.receiveShadow = true;

        node.material = new MeshPhysicalMaterial();
        node.material.map = bodyTexture;
        // node.material.shininess = 60;
        node.material.roughness = 1.7;

        // node.material.specularMap = bodySpecularTexture;
        node.material.roughnessMap = bodyRoughnessTexture;
        node.material.normalMap = bodyNormalTexture;
        node.material.normalScale = new Vector2(0.6, 0.6);

        morphTargetDictionaryBody = node.morphTargetDictionary;

        node.material.envMapIntensity = 0.8;
        // node.material.visible = false;

        // Debug: Log available morph targets
        console.log('Body Morph Targets:', Object.keys(morphTargetDictionaryBody || {}));

      }

      if (node.name.includes("Eyes")) {
        node.material = new MeshStandardMaterial();
        node.material.map = eyesTexture;
        // node.material.shininess = 100;
        node.material.roughness = 0.1;
        node.material.envMapIntensity = 0.5;


      }

      if (node.name.includes("Brows")) {
        node.material = new LineBasicMaterial({color: 0x000000});
        node.material.linewidth = 1;
        node.material.opacity = 0.5;
        node.material.transparent = true;
        node.visible = false;
      }

      if (node.name.includes("Teeth")) {

        node.receiveShadow = true;
        node.castShadow = true;
        node.material = new MeshStandardMaterial();
        node.material.roughness = 0.1;
        node.material.map = teethTexture;
        node.material.normalMap = teethNormalTexture;

        node.material.envMapIntensity = 0.7;


      }

      if (node.name.includes("Hair")) {
        node.material = new MeshStandardMaterial();
        node.material.map = hairTexture;
        node.material.alphaMap = hairAlphaTexture;
        node.material.normalMap = hairNormalTexture;
        node.material.roughnessMap = hairRoughnessTexture;
        
        node.material.transparent = true;
        node.material.depthWrite = false;
        node.material.side = 2;
        node.material.color.setHex(0x000000);
        
        node.material.envMapIntensity = 0.3;

      
      }

      if (node.name.includes("TSHIRT")) {
        node.material = new MeshStandardMaterial();

        node.material.map = tshirtDiffuseTexture;
        node.material.roughnessMap = tshirtRoughnessTexture;
        node.material.normalMap = tshirtNormalTexture;
        node.material.color.setHex(0xffffff);

        node.material.envMapIntensity = 0.5;


      }

      if (node.name.includes("TeethLower")) {
        morphTargetDictionaryLowerTeeth = node.morphTargetDictionary;
        
        // Debug: Log available morph targets
        console.log('Lower Teeth Morph Targets:', Object.keys(morphTargetDictionaryLowerTeeth || {}));
      }

    }

  });

  const [clips, setClips] = useState([]);
  const [blendData, setBlendData] = useState([]);
  const mixer = useMemo(() => new THREE.AnimationMixer(gltf.scene), []);

  useEffect(() => {

    if (speak === false)
      return;

    // Set a timeout to reset speak state if processing takes too long
    const timeoutId = setTimeout(() => {
      console.warn('Speech generation timed out after 15 seconds');
      setSpeak(false);
    }, 15000); // 15 second timeout

    makeSpeech(text)
    .then( response => {
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);

      if (!response || !response.data) {
        console.error('Invalid response from server');
        setSpeak(false);
        return;
      }

      let {blendData, filename}= response.data;

      console.log('Received blend data sample:', blendData.slice(0, 3)); // Debug first 3 frames

      let newClips = [ 
        createAnimation(blendData, morphTargetDictionaryBody, 'HG_Body'), 
        createAnimation(blendData, morphTargetDictionaryLowerTeeth, 'HG_TeethLower') ];

      filename = host + filename;
        
      setClips(newClips);
      setBlendData(blendData); // Store blendData for direct control
      setAudioSource(filename);
    })
    .catch(err => {
      // Clear the timeout since we got an error response
      clearTimeout(timeoutId);
      console.error('Error in speech generation:', err);
      setSpeak(false);
    });

    // Cleanup function to clear timeout if component unmounts
    return () => clearTimeout(timeoutId);

  }, [speak]);

  let idleFbx = useFBX('/idle.fbx');
  let { clips: idleClips } = useAnimations(idleFbx.animations);

  idleClips[0].tracks = _.filter(idleClips[0].tracks, track => {
    return track.name.includes("Head") || track.name.includes("Neck") || track.name.includes("Spine2");
  });

  idleClips[0].tracks = _.map(idleClips[0].tracks, track => {

    if (track.name.includes("Head")) {
      track.name = "head.quaternion";
    }

    if (track.name.includes("Neck")) {
      track.name = "neck.quaternion";
    }

    if (track.name.includes("Spine")) {
      track.name = "spine2.quaternion";
    }

    return track;

  });

  useEffect(() => {

    let idleClipAction = mixer.clipAction(idleClips[0]);
    idleClipAction.play();

    let blinkClip = createAnimation(blinkData, morphTargetDictionaryBody, 'HG_Body');
    let blinkAction = mixer.clipAction(blinkClip);
    blinkAction.play();


  }, []);

  // Play animation clips when available
  useEffect(() => {
    if (playing === false || !clips || clips.length === 0)
      return;
    
    // Add a small delay before starting animations to ensure audio has started playing
    const animationDelay = setTimeout(() => {
      _.each(clips, clip => {
        if (clip) { // Check if clip exists
          let clipAction = mixer.clipAction(clip);
          clipAction.setLoop(THREE.LoopOnce);
          clipAction.play();
        }
      });
    }, 200); // 200ms delay to sync with audio start
    
    return () => clearTimeout(animationDelay);

  }, [playing, clips, mixer]); // Add clips and mixer to dependency array for better synchronization

  
  // Enhanced morph target mapping function
  const mapBlendShapeToMorphTarget = (blendShapeName, morphDict) => {
    if (!morphDict) return null;
    
    // Direct mapping
    if (morphDict[blendShapeName] !== undefined) {
      return blendShapeName;
    }
    
    // Common mappings for different naming conventions
    const mappings = {
      // Eye blinks
      'eyeBlinkLeft': ['eyeBlinkLeft', 'EyeBlinkLeft', 'eyeBlink_L', 'eyeClose_L'],
      'eyeBlinkRight': ['eyeBlinkRight', 'EyeBlinkRight', 'eyeBlink_R', 'eyeClose_R'],
      
      // Mouth shapes
      'mouthOpen': ['mouthOpen', 'MouthOpen', 'mouth_open', 'jawOpen', 'JawOpen'],
      'jawOpen': ['jawOpen', 'JawOpen', 'jaw_open', 'mouthOpen'],
      
      // Mouth positions
      'mouthSmileLeft': ['mouthSmileLeft', 'MouthSmileLeft', 'mouthSmile_L', 'mouth_smile_L'],
      'mouthSmileRight': ['mouthSmileRight', 'MouthSmileRight', 'mouthSmile_R', 'mouth_smile_R'],
      
      // Mouth movements
      'mouthClose': ['mouthClose', 'MouthClose', 'mouth_close', 'mouthPress'],
      'mouthFunnel': ['mouthFunnel', 'MouthFunnel', 'mouth_funnel', 'mouthPucker'],
      'mouthPucker': ['mouthPucker', 'MouthPucker', 'mouth_pucker', 'mouthFunnel'],
      'mouthRound': ['mouthRound', 'MouthRound', 'mouth_round', 'mouthO'],
      
      // Lip movements
      'mouthUpperUpLeft': ['mouthUpperUpLeft', 'MouthUpperUp_L', 'mouthUpperUp_L', 'mouth_upper_up_L'],
      'mouthUpperUpRight': ['mouthUpperUpRight', 'MouthUpperUp_R', 'mouthUpperUp_R', 'mouth_upper_up_R'],
      'mouthLowerDownLeft': ['mouthLowerDownLeft', 'MouthLowerDown_L', 'mouthLowerDown_L', 'mouth_lower_down_L'],
      'mouthLowerDownRight': ['mouthLowerDownRight', 'MouthLowerDown_R', 'mouthLowerDown_R', 'mouth_lower_down_R'],
      
      // Additional mouth controls
      'mouthLeft': ['mouthLeft', 'MouthLeft', 'mouth_left'],
      'mouthRight': ['mouthRight', 'MouthRight', 'mouth_right'],
      'mouthStretchLeft': ['mouthStretchLeft', 'MouthStretch_L', 'mouthStretch_L'],
      'mouthStretchRight': ['mouthStretchRight', 'MouthStretch_R', 'mouthStretch_R'],
      'mouthPressLeft': ['mouthPressLeft', 'MouthPress_L', 'mouthPress_L'],
      'mouthPressRight': ['mouthPressRight', 'MouthPress_R', 'mouthPress_R'],
      
      // Tongue
      'tongueOut': ['tongueOut', 'TongueOut', 'tongue_out', 'tongueLongStep1']
    };
    
    // Try mapped alternatives
    const alternatives = mappings[blendShapeName] || [];
    for (const alt of alternatives) {
      if (morphDict[alt] !== undefined) {
        return alt;
      }
    }
    
    return null;
  };
  
  // Function to find appropriate blend shapes for current time
  const updateLipSync = (currentTime) => {
    if (!blendData || blendData.length === 0 || !playing) return;
    
    // Find the two frames that surround the current time
    let prevFrame = null;
    let nextFrame = null;
    
    // Add a small offset to the current time to improve lip sync timing
    // This helps compensate for any delay between audio and animation
    const adjustedTime = currentTime + 0.1; // 100ms offset for better sync
    
    for (let i = 0; i < blendData.length; i++) {
      if (blendData[i].time > adjustedTime) {
        nextFrame = blendData[i];
        prevFrame = blendData[i - 1] || blendData[i];
        break;
      }
    }
    
    if (!prevFrame) {
      prevFrame = blendData[blendData.length - 1];
    }
    if (!nextFrame) {
      nextFrame = prevFrame;
    }
    
    // Interpolate between the two frames
    const frameDiff = nextFrame.time - prevFrame.time;
    let t = 0;
    if (frameDiff > 0) {
      t = (adjustedTime - prevFrame.time) / frameDiff;
      t = Math.max(0, Math.min(1, t)); // Clamp between 0 and 1
    }
    
    // Improved smoothstep function for more natural easing
    const smoothstep = (x) => {
      // Enhanced cubic smoothstep with better curve
      return x * x * (3 - 2 * x);
    };
    
    // Apply blend shapes directly to the mesh
    gltf.scene.traverse((node) => {
      if (node.morphTargetDictionary && node.morphTargetInfluences) {
        const morphDict = node.morphTargetDictionary;
        
        // Check if blendshapes exist in the frames
        if (!prevFrame.blendshapes || !nextFrame.blendshapes) {
          console.warn('Missing blendshapes in animation frames');
          return;
        }
        
        // Apply each blend shape with smoothing
        Object.entries(prevFrame.blendshapes).forEach(([key, value]) => {
          // Skip if value is undefined
          if (value === undefined) return;
          
          const nextValue = nextFrame.blendshapes[key] || 0;
          
          // Apply enhanced cubic easing for smoother transitions
          const smoothT = smoothstep(t);
          const interpolatedValue = value + (nextValue - value) * smoothT;
          
          // Enhance mouth movements for better visibility and fix lip overlap issue
          let finalValue = interpolatedValue;
          
          // Amplify certain movements for better visibility with increased factors
          if (key === 'mouthOpen') {
            finalValue = Math.min(0.7, interpolatedValue * 1.4); // Further reduced mouth opening
          } else if (key === 'jawOpen') {
            finalValue = Math.min(0.7, interpolatedValue * 1.4); // Further reduced jaw movement
          } else if (key.includes('mouthLowerDown')) {
            // Severely limit lower lip movement to prevent it from going above the upper lip
            finalValue = Math.min(0.2, interpolatedValue * 0.3); // Extremely reduced enhancement for lower lip
          } else if (key.includes('mouthUpperUp')) {
            finalValue = Math.min(0.8, interpolatedValue * 1.4); // Slightly reduced upper lip enhancement
          } else if (key === 'mouthSmileLeft' || key === 'mouthSmileRight') {
            finalValue = Math.min(0.8, interpolatedValue * 1.2); // Slightly reduced smile enhancement
          }
          
          // Find the correct morph target
          const mappedKey = mapBlendShapeToMorphTarget(key, morphDict);
          
          if (mappedKey && morphDict[mappedKey] !== undefined) {
            const morphIndex = morphDict[mappedKey];
            if (morphIndex < node.morphTargetInfluences.length) {
              node.morphTargetInfluences[morphIndex] = Math.max(0, Math.min(1, finalValue));
              
              // Debug first few applications
              if (currentTime < 1 && finalValue > 0.1) {
                console.log(`Applied ${key} -> ${mappedKey} = ${finalValue.toFixed(3)}`);
              }
            }
          } else if (finalValue > 0.1) {
            // Debug missing morph targets
            console.warn(`Could not map blend shape: ${key} (value: ${finalValue.toFixed(3)})`);
            console.log('Available morph targets:', Object.keys(morphDict).slice(0, 10), '...');
          }
        });
      }
    });
  };
  
  useFrame((state, delta) => {
    mixer.update(delta);
    
    // Update lip sync if we have current audio time
    if (playing && currentAudioTime > 0) {
      updateLipSync(currentAudioTime);
    }
  });


  return (
    <group name="avatar">
      <primitive object={gltf.scene} dispose={null} />
    </group>
  );
}


function makeSpeech(text) {
  return axios.post(host + '/talk', { text })
    .then(response => {
      // Validate and ensure blendData is properly structured
      if (response.data && response.data.blendData) {
        // Ensure blendData is an array
        if (!Array.isArray(response.data.blendData)) {
          console.error('blendData is not an array');
          response.data.blendData = [];
        }
        
        // Ensure each frame has required properties
        response.data.blendData = response.data.blendData.map(frame => {
          if (!frame.blendshapes) {
            frame.blendshapes = {};
          }
          return frame;
        });
      } else {
        // Create empty blendData if missing
        response.data.blendData = [];
      }
      return response;
    })
    .catch(error => {
      console.error('Error in makeSpeech:', error);
      // Return a rejected promise to ensure the error is properly handled
      return Promise.reject(error);
    });
}

const STYLES = {
  area: {position: 'absolute', bottom:'10px', left: '10px', zIndex: 500},
  text: {margin: '0px', width:'300px', padding: '5px', background: 'none', color: '#ffffff', fontSize: '1.2em', border: 'none'},
  speak: {padding: '10px', marginTop: '5px', display: 'block', color: '#FFFFFF', background: '#222222', border: 'None'},
  area2: {position: 'absolute', top:'5px', right: '15px', zIndex: 500},
  label: {color: '#777777', fontSize:'0.8em'}
}

function App() {

  const audioPlayer = useRef();

  const [speak, setSpeak] = useState(false);
  const [text, setText] = useState("My name is Arwen. I'm a virtual human who can speak whatever you type here along with realistic facial movements.");
  const [audioSource, setAudioSource] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [avatarGltf, setAvatarGltf] = useState(null);

  // Removed test morph targets function as it's no longer needed
  function playerEnded(e) {
    // Cancel the animation frame if it exists
    if (audioPlayer.current && audioPlayer.current.rafId) {
      cancelAnimationFrame(audioPlayer.current.rafId);
      audioPlayer.current.rafId = null;
    }
    
    // Immediately reset mouth to ensure it closes
    resetMouth();
    console.log('Initial mouth reset at end of speech');
    
    // Add a small delay before resetting states to ensure animations complete
    setTimeout(() => {
      setAudioSource(null);
      setPlaying(false);
      setSpeak(false);
      setCurrentAudioTime(0);
      // Reset mouth again after state changes
      resetMouth();
      console.log('Second mouth reset after delay');
      
      // Final reset with another delay to ensure complete closure
      setTimeout(() => {
        resetMouth();
        console.log('Final mouth reset after second delay');
      }, 200);
    }, 300); // 300ms delay to ensure animations finish after audio
  }
  
  // Enhanced reset mouth function to ensure complete closure
  const resetMouth = () => {
    if (!avatarGltf || !avatarGltf.scene) {
      console.warn('Avatar GLTF not available for mouth reset');
      return;
    }
    
    // Force multiple resets to ensure complete closure
    for (let attempt = 0; attempt < 3; attempt++) {
      avatarGltf.scene.traverse((node) => {
        if (node.morphTargetDictionary && node.morphTargetInfluences) {
          const morphDict = node.morphTargetDictionary;
          
          // Comprehensive list of all mouth-related morph targets to reset
          const mouthMorphs = [
            'mouthOpen', 'jawOpen', 'mouthLowerDown', 'mouthUpperUp', 'mouthSmile',
            'mouthLeft', 'mouthRight', 'mouthStretch', 'mouthPress', 'mouthPucker',
            'mouthFunnel', 'mouthClose', 'mouthRound', 'tongueOut'
          ];
          
          // Force reset all mouth-related morph targets to zero
          mouthMorphs.forEach(key => {
            Object.keys(morphDict).forEach(morphKey => {
              if (morphKey.toLowerCase().includes(key.toLowerCase())) {
                const morphIndex = morphDict[morphKey];
                if (morphIndex < node.morphTargetInfluences.length) {
                  // Force set to exactly zero to ensure complete closure
                  node.morphTargetInfluences[morphIndex] = 0;
                }
              }
            });
          });
          
          // Explicitly set all morph target influences to zero
          for (let i = 0; i < node.morphTargetInfluences.length; i++) {
            if (node.morphTargetInfluences[i] > 0) {
              node.morphTargetInfluences[i] = 0;
            }
          }
          
          // Directly set specific key morph targets if they exist
          const directMorphs = {
            'mouthOpen': 0,
            'jawOpen': 0,
            'MouthOpen': 0,
            'JawOpen': 0
          };
          
          Object.keys(directMorphs).forEach(key => {
            if (morphDict[key] !== undefined) {
              node.morphTargetInfluences[morphDict[key]] = directMorphs[key];
            }
          });
        }
      });
    }
    };

  // Player is ready
  function playerReady(e) {
    // Reset current time before starting
    setCurrentAudioTime(0);
    
    // Start playing audio only when it's fully loaded
    const audioEl = audioPlayer.current.audioEl.current;
    
    // Check if audio is ready to play
    if (audioEl.readyState >= 3) {
      // Audio is loaded enough to play
      audioEl.play()
        .then(() => {
          console.log('Audio playback started successfully');
        })
        .catch(error => {
          console.error('Audio playback failed:', error);
        });
      
      // Set up more precise time tracking with requestAnimationFrame for smoother updates
      let rafId;
      const updateTime = () => {
        if (audioEl && !audioEl.paused) {
          setCurrentAudioTime(audioEl.currentTime);
          rafId = requestAnimationFrame(updateTime);
        }
      };
      
      // Start the animation frame loop
      rafId = requestAnimationFrame(updateTime);
      
      // Set playing state after a delay to ensure everything is ready
      // Increased delay for better synchronization
      setTimeout(() => {
        setPlaying(true);
      }, 150);
      
      // Store the animation frame ID for cleanup
      audioPlayer.current.rafId = rafId;
    } else {
      // Audio not ready yet, retry after a short delay
      console.log('Audio not ready yet, retrying...');
      setTimeout(() => playerReady(e), 100);
    }
  }  

  return (
    <div className="full">
      <div style={STYLES.area}>
        <textarea rows={4} type="text" style={STYLES.text} value={text} onChange={(e) => setText(e.target.value.substring(0, 200))} />
        <button 
          onClick={() => {
            if (speak) return; // Prevent multiple clicks while processing
            setSpeak(true);
          }} 
          style={STYLES.speak}
        > 
          { speak ? 'Running...' : 'Speak' }
        </button>
      </div>

      <ReactAudioPlayer
        src={audioSource}
        ref={audioPlayer}
        onEnded={playerEnded}
        onCanPlayThrough={playerReady}
        controls={false}
        autoPlay
        preload="auto"
        crossOrigin="anonymous"
      />
      
      {/* <Stats /> */}
    <Canvas dpr={2} onCreated={(ctx) => {
        ctx.gl.physicallyCorrectLights = true;
      }}>

      <OrthographicCamera 
      makeDefault
      zoom={2000}
      position={[0, 1.65, 1]}
      />

      {/* <OrbitControls
        target={[0, 1.65, 0]}
      /> */}

      <Suspense fallback={null}>
        <Environment background={false} files="/images/photo_studio_loft_hall_1k.hdr" />
      </Suspense>

      <Suspense fallback={null}>
        <Bg />
      </Suspense>

      <Suspense fallback={null}>



          <Avatar 
            avatar_url="/model.glb" 
            speak={speak} 
            setSpeak={setSpeak}
            text={text}
            setGltf={setAvatarGltf}
            setAudioSource={setAudioSource}
            playing={playing}
            currentAudioTime={currentAudioTime}
            setCurrentAudioTime={setCurrentAudioTime}
            />

      
      </Suspense>

  

  </Canvas>
  <Loader dataInterpolation={(p) => `Loading... please wait`}  />
  </div>
  )
}

function Bg() {
  
  const texture = useTexture('/images/bg.webp');

  return(
    <mesh position={[0, 1.5, -2]} scale={[0.8, 0.8, 0.8]}>
      <planeGeometry />
      <meshBasicMaterial map={texture} />
    </mesh>
  )
}

export default App;