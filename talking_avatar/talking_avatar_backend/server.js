import express from 'express';
import cors from 'cors';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import fetch from 'node-fetch';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Create directories if they don't exist
fs.ensureDirSync(path.join(__dirname, 'public'));
fs.ensureDirSync(path.join(__dirname, 'public', 'audio'));

// Free TTS API endpoint
const TTS_API_URL = 'https://api.streamelements.com/kappa/v2/speech';

// Simplified viseme mapping using common avatar morph target names
const VISEME_MAP = {
  // Basic vowel sounds - using common naming conventions
  'A': { // 'ah' sound - wide open mouth
    'viseme_aa': 0.8,
    'jawOpen': 0.6,
    'mouthOpen': 0.8
  },
  
  'E': { // 'eh' sound - mid open with slight smile
    'viseme_E': 0.7,
    'mouthOpen': 0.4,
    'jawOpen': 0.3,
    'mouthSmile_L': 0.3,
    'mouthSmile_R': 0.3
  },
  
  'I': { // 'ee' sound - wide smile
    'viseme_I': 0.8,
    'mouthOpen': 0.2,
    'mouthSmile_L': 0.7,
    'mouthSmile_R': 0.7
  },
  
  'O': { // 'oh' sound - round lips
    'viseme_O': 0.8,
    'mouthOpen': 0.6,
    'jawOpen': 0.4
  },
  
  'U': { // 'oo' sound - pucker
    'viseme_U': 0.8,
    'mouthOpen': 0.3,
    'jawOpen': 0.2
  },

  // Consonant sounds
  'B': { // Closed lips for B, M, P
    'viseme_PP': 0.9,
    'mouthClose': 0.9
  },
  
  'F': { // F, V sounds - lip to teeth
    'viseme_FF': 0.8,
    'mouthOpen': 0.2
  },
  
  'T': { // T, D, N, L sounds - tongue to teeth
    'viseme_TH': 0.7,
    'mouthOpen': 0.3,
    'jawOpen': 0.2
  },
  
  'S': { // S, Z sounds - slight smile
    'viseme_SS': 0.8,
    'mouthOpen': 0.1,
    'mouthSmile_L': 0.4,
    'mouthSmile_R': 0.4
  },
  
  'R': { // R sound - slight pucker
    'viseme_RR': 0.7,
    'mouthOpen': 0.3,
    'jawOpen': 0.2
  },

  // Rest position
  'X': { // Neutral/rest
    'mouthSmile_L': 0.05,
    'mouthSmile_R': 0.05
  }
};

// Generate simple viseme data based on text analysis
function generateSimpleVisemeData(text, audioDuration) {
  const words = text.split(' ');
  const visemeData = [];
  
  let currentTime = 0;
  const totalChars = text.length;
  // Ensure we have enough frames for smooth animation (at least 10 frames per second)
  const framesPerSecond = 15;
  const totalFrames = Math.max(30, Math.ceil(audioDuration * framesPerSecond));
  const charDuration = audioDuration / Math.max(totalChars, totalFrames / 2);
  
  // Add initial rest position
  visemeData.push({
    time: 0,
    blendshapes: {
      'eyeBlinkLeft': 0,
      'eyeBlinkRight': 0,
      'eyeBlink_L': 0,
      'eyeBlink_R': 0,
      'mouthSmile_L': 0.05,
      'mouthSmile_R': 0.05,
      'mouthOpen': 0,
      'jawOpen': 0
    }
  });
  
  // Process each character in the text
  for (let i = 0; i < text.length; i++) {
    const char = text[i].toLowerCase();
    const time = i * charDuration;
    
    let visemeKey = 'X'; // Default to rest
    
    // Map characters to basic visemes
    if ('aä'.includes(char)) visemeKey = 'A';
    else if ('eé'.includes(char)) visemeKey = 'E';
    else if ('iíy'.includes(char)) visemeKey = 'I';
    else if ('oóöø'.includes(char)) visemeKey = 'O';
    else if ('uúüůû'.includes(char)) visemeKey = 'U';
    else if ('bmp'.includes(char)) visemeKey = 'B';
    else if ('fv'.includes(char)) visemeKey = 'F';
    else if ('tdnl'.includes(char)) visemeKey = 'T';
    else if ('sz'.includes(char)) visemeKey = 'S';
    else if ('r'.includes(char)) visemeKey = 'R';
    else if (char === ' ') visemeKey = 'X';
    
    const viseme = VISEME_MAP[visemeKey];
    
    // Create blendshapes object with defaults
    const blendshapes = {
      'eyeBlinkLeft': 0,
      'eyeBlinkRight': 0,
      'eyeBlink_L': 0,
      'eyeBlink_R': 0,
      'mouthSmile_L': 0.05, // Slight default smile
      'mouthSmile_R': 0.05,
      'mouthOpen': 0,
      'jawOpen': 0,
      'mouthClose': 0,
      'viseme_aa': 0,
      'viseme_E': 0,
      'viseme_I': 0,
      'viseme_O': 0,
      'viseme_U': 0,
      'viseme_PP': 0,
      'viseme_FF': 0,
      'viseme_TH': 0,
      'viseme_SS': 0,
      'viseme_RR': 0
    };
    
    // Apply the viseme values
    Object.entries(viseme).forEach(([key, value]) => {
      blendshapes[key] = value;
    });
    
    // Add random blinks occasionally
    if (Math.random() < 0.01) { // 1% chance per character
      blendshapes['eyeBlinkLeft'] = 0.8;
      blendshapes['eyeBlinkRight'] = 0.8;
      blendshapes['eyeBlink_L'] = 0.8;
      blendshapes['eyeBlink_R'] = 0.8;
    }
    
    visemeData.push({
      time: time,
      blendshapes: { ...blendshapes }
    });
    
    // Add transition frame for smoother animation
    if (i < text.length - 1) {
      const nextTime = time + (charDuration * 0.5);
      const transitionBlendshapes = { ...blendshapes };
      
      // Reduce intensity for transition
      Object.keys(transitionBlendshapes).forEach(key => {
        if (!key.includes('eyeBlink') && !key.includes('mouthSmile')) {
          transitionBlendshapes[key] *= 0.5;
        }
      });
      
      visemeData.push({
        time: nextTime,
        blendshapes: transitionBlendshapes
      });
    }
  }
  
  // Add final rest position
  visemeData.push({
    time: audioDuration,
    blendshapes: {
      'eyeBlinkLeft': 0,
      'eyeBlinkRight': 0,
      'eyeBlink_L': 0,
      'eyeBlink_R': 0,
      'mouthSmile_L': 0.05,
      'mouthSmile_R': 0.05,
      'mouthOpen': 0,
      'jawOpen': 0,
      'mouthClose': 0,
      'viseme_aa': 0,
      'viseme_E': 0,
      'viseme_I': 0,
      'viseme_O': 0,
      'viseme_U': 0,
      'viseme_PP': 0,
      'viseme_FF': 0,
      'viseme_TH': 0,
      'viseme_SS': 0,
      'viseme_RR': 0
    }
  });
  
  return visemeData;
}

// Text to speech endpoint
app.post('/talk', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Generate a unique filename
    const timestamp = Date.now();
    const audioFilename = `speech_${timestamp}.mp3`;
    const audioPath = path.join(__dirname, 'public', 'audio', audioFilename);
    
    // Use StreamElements TTS API (free)
    const voice = 'Amy'; // Female voice (other options: Nicole, Salli, Kimberly)
    const ttsUrl = `${TTS_API_URL}?voice=${voice}&text=${encodeURIComponent(text)}`;
    
    // Fetch audio from TTS API
    const response = await fetch(ttsUrl);
    if (!response.ok) {
      throw new Error(`TTS API error: ${response.statusText}`);
    }
    
    // Save audio file
    const buffer = await response.buffer();
    await fs.writeFile(audioPath, buffer);
    
    // Better duration estimation based on speaking rate
    const wordsPerMinute = 150; // Average speaking rate
    const wordCount = text.split(/\s+/).length;
    // Improved duration estimation with character count consideration
    const charCount = text.length;
    const estimatedDuration = Math.max(2.0, (wordCount / wordsPerMinute) * 60 + (charCount * 0.01) + 1.0);
    
    // Generate viseme data
    const blendData = generateSimpleVisemeData(text, estimatedDuration);
    
    console.log(`Generated ${blendData.length} viseme frames for "${text.substring(0, 50)}..."`);
    console.log('Sample frame:', blendData[Math.floor(blendData.length / 2)]);
    
    // Return the response
    res.json({
      blendData,
      filename: `/audio/${audioFilename}`,
      metadata: {
        estimatedDuration,
        wordCount,
        frameCount: blendData.length
      }
    });
  } catch (error) {
    console.error('Error in /talk endpoint:', error);
    res.status(500).json({ error: error.message });
  }
});

// Debug endpoint to test viseme generation
app.post('/test-visemes', (req, res) => {
  try {
    const { text = "Hello world" } = req.body;
    const testDuration = 3.0;
    
    const blendData = generateSimpleVisemeData(text, testDuration);
    
    res.json({
      text,
      frameCount: blendData.length,
      sampleFrames: blendData.slice(0, 5),
      allBlendshapeKeys: Object.keys(blendData[0].blendshapes)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Simplified TTS with standard morph targets ready!`);
});