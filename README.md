# CHATAPP

Real-time chat application built with React, Node.js, Express, Socket.io, MongoDB, Redis, and Cloudinary.

## Status
Phase 1: project setup (done)

## Run locally

Terminal 1 (server):

```bash
cd server
cp .env.example .env   # then fill in your real MongoDB address
npm install
npm run dev
```

Terminal 2 (client):

```bash
cd client
cp .env.example .env
npm install
npm run dev
```

Health check: http://localhost:5001/api/health
Client: http://localhost:5173