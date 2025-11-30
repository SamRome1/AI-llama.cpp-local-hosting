## AI-llama.cpp-local-hosting

A local AI playground for running open-source LLMs (GPT-OSS-20B) directly on macOS using llama.cpp, paired with a Next.js + TypeScript frontend chat interface.

This project demonstrates:

Hosting an LLM locally using llama.cpp

Exposing an OpenAI-compatible API (/v1/chat/completions)

A modern Next.js chat UI for interacting with the model

Fully local, offline inference — no external API calls required

Ideal for experimentation, development, and learning how to self-host open-weight models.

## Getting Started
1. Install llama.cpp
brew install llama.cpp


Verify:

llama-server --help

2. Run GPT-OSS-20B locally
llama-server \
  -hf ggml-org/gpt-oss-20b-GGUF \
  --port 8000 \
  --host 127.0.0.1 \
  -c 4096


This starts a local OpenAI-compatible inference server at:

http://localhost:8000/v1/chat/completions

3. Start the Next.js frontend
cd frontend
npm install
npm run dev

Open in browser:

http://localhost:3000

The app sends requests to /api/chat, which forwards them to the local model.

Environment Variables

Create a .env.local file inside the frontend directory:

LLAMA_BASE_URL=http://localhost:8000

## Tech Stack
Backend (Local LLM)

llama.cpp

GPT-OSS-20B (GGUF version)

Runs via llama-server with OpenAI-style endpoints

macOS CPU inference compatible

Frontend

Next.js (App Router + TypeScript)

Tailwind CSS

Custom chat UI

API route that proxies requests to llama-server

## Project Structure
ai-vllm-local-hosting/
│
├── frontend/          # Next.js web app
│   ├── src/app/      
│   ├── public/
│   └── ...
│
└── (backend runs via llama.cpp installed system-wide)


Since llama-server runs locally, no backend folder is required.
