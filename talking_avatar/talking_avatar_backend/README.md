# Talking Avatar Backend

This is a free alternative backend for the Talking Avatar project. It provides text-to-speech conversion and lip sync data generation without requiring Azure APIs.

## Features

- Text-to-speech conversion using free StreamElements API with female voice (Amy)
- Automatic viseme (lip sync) data generation
- Simple REST API compatible with the frontend

## Requirements

- Node.js 16 or higher

## Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

## Usage

1. Start the server:

```bash
npm start
```

The server will run on port 5000 by default.

2. The API endpoint `/talk` accepts POST requests with a JSON body containing a `text` field.

## API

### POST /talk

Converts text to speech and generates lip sync data.

**Request Body:**

```json
{
  "text": "Hello, this is a test"
}
```

**Response:**

```json
{
  "blendData": [...],  // Array of viseme data for lip sync
  "filename": "/audio/speech_1234567890.mp3"  // Path to the generated audio file
}
```

## How It Works

1. The server receives text from the frontend
2. It sends the text to the StreamElements TTS API to generate audio
3. It generates viseme data for lip sync based on the text and estimated audio duration
4. It returns both the audio file path and viseme data to the frontend

## Customization

You can modify the `server.js` file to:

- Change the TTS voice (currently set to 'Brian')
- Adjust the viseme mapping for different mouth shapes
- Use a different free TTS API if desired