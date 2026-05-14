# AI Knowledge Base Assistant MVP

Cost-free starter MVP for an AI-powered personal knowledge base using ASP.NET Core Web API, EF Core, SQLite, JWT authentication, React, Vite, TypeScript, Tailwind CSS, and simple keyword retrieval.

## What It Includes

- Register and login with JWT bearer tokens
- SQLite persistence through Entity Framework Core
- Per-user document storage and deletion
- Automatic document chunking
- Keyword-based retrieval of the top 5 matching chunks
- Gemini API integration through `GEMINI_API_KEY`
- Chat history per user
- React dashboard frontend with protected routes
- Axios API client using `VITE_API_BASE_URL`
- Document management, chat, and history screens

## Project Structure

```text
.
|-- backend/              ASP.NET Core Web API
|   |-- Controllers/      API controllers
|   |-- Data/             EF Core DbContext
|   |-- DTOs/             API request and response models
|   |-- Entities/         EF Core entities
|   `-- Services/         Auth, document, retrieval, chat, Gemini services
`-- frontend/             React + Vite + TypeScript + Tailwind app
```

## Run The Backend

Install the .NET 8 SDK, then from the repository root run:

```powershell
cd backend
$env:GEMINI_API_KEY="your-gemini-api-key"
$env:JWT__Key="replace-with-a-long-random-secret-at-least-32-characters"
$env:ASPNETCORE_ENVIRONMENT="Development"
dotnet restore
dotnet run --project KnowledgeBaseAssistant.Api.csproj --urls http://localhost:5088
```

The app creates `knowledgebase.db` automatically on first run. For a production app, replace `EnsureCreated` with EF Core migrations.

## Run The Frontend

Install Node.js, then from the repository root run:

```powershell
cd frontend
copy .env.example .env
npm install
npm run dev -- --host 127.0.0.1
```

Set `VITE_API_BASE_URL` in `frontend/.env` to the backend URL:

```env
VITE_API_BASE_URL=http://localhost:5088
```

The API allows the Vite dev origin through the `Cors:AllowedOrigins` setting in `backend/appsettings.json`.

## Frontend Pages

- Register
- Login
- Dashboard
- Documents
- Add Document
- Chat
- History

## API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/documents`
- `GET /api/documents`
- `DELETE /api/documents/{id}`
- `POST /api/chat/ask`
- `GET /api/chat/history`

## API Flow

1. Register:

```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

2. Login:

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

3. Send authenticated requests:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

4. Save a document:

```http
POST /api/documents
Content-Type: application/json

{
  "title": "Refund Policy",
  "content": "Paste the full document text here..."
}
```

5. Ask a question:

```http
POST /api/chat/ask
Content-Type: application/json

{
  "question": "What is the refund window?"
}
```

## Notes

- This MVP uses keyword search, not embeddings or a vector database.
- Gemini is instructed to answer only from retrieved document context.
- The default model is `gemini-2.5-flash`; change `Gemini:Model` if your account uses a different Gemini model.
- Passwords are hashed with PBKDF2; raw passwords are never stored.
- JWT and Gemini secrets should be set through environment variables in real deployments.
