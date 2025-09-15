# Talking Avatar

A ThreeJS-powered virtual human being that can speak input text with facial expressions!

## Features

- 3D avatar with realistic facial expressions
- Text-to-speech conversion
- Automatic lip sync animation
- Free backend implementation (no Azure API required)

## Requirements

- Node.js 16 or higher

## Installation

1. Clone this repository
2. Install dependencies:

```bash
npm install
```

3. Start the backend server:

```bash
cd talking_avatar_backend
npm install
node server.js
```

4. Start the frontend:

```bash
npm start
```

## How It Works

This project consists of two parts:

1. **Frontend**: A React application that displays a 3D avatar and handles user input
2. **Backend**: A Node.js server that converts text to speech and generates lip sync data

### Backend Implementation

The backend uses:
- StreamElements TTS API (free) for text-to-speech conversion with female voice (Amy)
- Custom algorithm for generating viseme data for lip sync
- Express.js for the API server

### Testing

You can test the backend directly by visiting:
- http://localhost:5000/test.html - Simple test page
- http://localhost:5000/avatar-test.html - 3D avatar test page

## Customization

You can customize the avatar by:
- Replacing the 3D model in `/public/model.glb`
- Modifying the textures in `/public/images/`
- Adjusting the viseme mapping in the backend server

## License

MIT
