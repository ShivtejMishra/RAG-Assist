# RAGAssist: Enterprise Knowledge Assistant Platform

RAGAssist is a production-grade, multi-tenant, secure document conversational AI platform designed using Python (FastAPI Clean Architecture), ReactJS, MongoDB Atlas, and Qdrant. 

It leverages the **Google Gemini API** for generating ultra-high precision grounded context completions (`gemini-2.5-flash`) and creating highly optimized vector text chunks (`text-embedding-004`).

---

## Key Features
- **Multi-Tenancy Isolation**: Strictly separates tenant records at the metadata storage (MongoDB collections filtered by `tenant_id`) and vector payload layers (Qdrant metadata query conditions).
- **Asynchronous Ingestion Pipeline**: Large PDF, DOCX, TXT, and CSV documents are parsed, divided into semantic overlapping chunks, embedded, and indexed in background queues backed by **Celery** and **Redis**.
- **Interactive Citations**: Chat completions stream to the user token-by-token (Server-Sent Events), accompanied by precise document sources displaying the exact text snippet and page number.
- **Premium Glassmorphic Interface**: A dark-themed dashboard powered by ReactJS + TypeScript + Tailwind CSS incorporating rich metrics cards, file statuses, and visual latencies.

---

## Technology Stack
- **Frontend**: ReactJS (Vite, TypeScript, TailwindCSS, Lucide Icons)
- **Backend (Python Clean Architecture)**:
  - `Domain`: Clean entities representing core models (Tenant, User, Document, Chat, Citation).
  - `Use Cases`: Pure business rules processing (Auth, Ingestion, Similarity Context compiler).
  - `Adapters`: Ports implementation for MongoDB, Qdrant client, and Google Gemini API.
  - `Infrastructure`: FastAPI server routes, Celery background tasks, rate limit logs.
- **Databases**: MongoDB Atlas (metadata, auth, chats), Qdrant (vectors & payloads).

---

## Local Development Setup

### Prerequisites
- Docker & Docker Compose
- Google Gemini API Key (get one from Google AI Studio)

### 1. Set environment variables
Copy the template `.env` and configure your API key:
```bash
cp backend/.env.example backend/.env
```
Open `backend/.env` and paste your `GEMINI_API_KEY`:
```env
GEMINI_API_KEY=AIzaSy...
```

### 2. Start the Orchestration Services
Launch the entire system using docker-compose:
```bash
docker-compose up --build
```
This boots:
- **Frontend** on [http://localhost:3000](http://localhost:3000)
- **FastAPI API Gateway** on [http://localhost:8000](http://localhost:8000)
- **Qdrant Vector Console** on [http://localhost:6333](http://localhost:6333)
- **MongoDB** on `localhost:27017`
- **Redis** & **Celery worker** tasks

### 3. Verify Multi-Tenant Onboarding
1. Navigate to the web client: [http://localhost:3000](http://localhost:3000)
2. Click **"Register Tenant Group"**.
3. Create your organization (e.g. Acme, Domain: `acme.com`) and admin profile.
4. Log in, upload a document under the **"Document Center"** tab, wait for the status to mark **"Ready"** (vectorized and uploaded to Qdrant).
5. Switch to **"Knowledge Chat"** and start querying!
