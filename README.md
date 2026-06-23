# 🎮 Arcade Chess Battle — Local Deployment Guide

Deploy and play **Arcade Chess Battle** on your own computer! This guide provides comprehensive, step-by-step instructions to set up the game, configure a local AI opponent via LM Studio, and run the production build smoothly.

---

## 📋 Prerequisites

Before starting, ensure your local PC has the following software installed:

- **Node.js** (v18.0.0 or higher recommended)
- **npm** (comes pre-bundled with Node.js)
- *Optional:* **LM Studio** (if you want to run the advanced LLM boss-fighter AI mode locally)

---

## ⚡ Quick Start: Running on Local PC

### 1. Download & Extract Code
Download the project files or clone the repository to your local PC. Open your terminal or Command Prompt (`cmd`) and navigate to the extracted directory:
```bash
cd path/to/arcade-chess-battle
```

### 2. Install Project Dependencies
Install all the required packages (React, TSX, Tailwind CSS, chess.js, motion, etc.):
```bash
npm install
```

### 3. Run Development Server
Start the interactive developer mode:
```bash
npm run dev
```

Once started, the terminal will display the local addresses. By default, you can open your web browser and navigate to:
👉 **`http://localhost:3000`** (or whichever port is shown in your terminal)

---

## 🛠️ Configuring a Local AI Opponent (LM Studio)

This game features a high-performance, responsive offline chess logic solver. To interact with the immersive, fully offline LLM bosses (which trash-talk and adapt dialogue based on board conditions):

1. **Download and Launch LM Studio**:
   - Get it free at [lmstudio.ai](https://lmstudio.ai/).
   - Search for and download a model (e.g., `gemma-2-9b-it`, `Llama-3-8B-Instruct`, or any compatible model).

2. **Start the Local Inference Server**:
   - Go to the **Developer / Local Server** tab in LM Studio.
   - Select your downloaded model from the dropdown.
   - Click **Start Server** (by default, it hosts on `http://localhost:1234`).

3. **Turn On AI Mode In-Game**:
   - In the game, open the **Settings Menu** (located on the side panel).
   - Toggle **Online Mode / Local LLM** to **ON**.
   - Ensure the server endpoint matches: `http://localhost:1234`.
   - Select or type your running model ID (e.g., `gemma-2-9b-it`).
   - Play and suffer the hilarious, fully local boss monologue.

---

## 🏗️ Building for Production (Optimized & Fast)

If you want to compile and serve a highly optimized version of the application from your local computer:

### 1. Build the App
Run the Vite assembly command:
```bash
npm run build
```
This generates an optimized, minified bundle inside the `/dist` directory.

### 2. Preview the Production Build
Run the following preview command to serve the production static files:
```bash
npm run preview
```
Open **`http://localhost:4173`** (or the port specified in the CLI) in your browser to experience ultra-smooth gameplay.

### 3. Deploy to Web Hosts
To make it public, you can drag-and-drop the generated `/dist` folder directly onto free hostings such as:
- **Vercel** (`vercel deploy`)
- **Netlify**
- **GitHub Pages**

---

## 🧩 Troubleshooting & Tips

- **Checkmate / Freeze Glitch**: If a king gets captured/defeated, simply click **Insert Coin / Start New Game** to restart the game.
- **Microphone / Sound Settings**: Audio is enabled of default. You can mute the game or reset stats directly through the Settings Panel.
- **Port Conflicts**: If port 3000 is already occupied on your computer, Vite will automatically select the next available port (e.g., 3001) or you can override it in `package.json` with the `--port` flag.

---

Have fun dominating the arcade bosses! 🏆
