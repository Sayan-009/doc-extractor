# 📄 DocExtract

**AI-Powered Document Extraction Platform** — Automatically extract structured data from PDF documents and Gmail attachments using AI (Groq LLM).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-green.svg)
![React](https://img.shields.io/badge/react-18-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.104+-teal.svg)

---

## ✨ Features

- **🔐 Authentication** — Email/password signup & login with JWT tokens, plus Google OAuth SSO
- **📋 Custom Templates** — Define extraction field templates (e.g., Invoice Number, Amount, Date) with a drag-and-drop field builder
- **📤 PDF Upload & Extraction** — Upload PDF documents and extract structured data using AI
- **📧 Gmail Integration** — Connect your Gmail account to automatically scan and extract data from PDF attachments
- **📊 Session Management** — Organize extractions into sessions, track progress, and manage processing
- **📥 CSV Export** — Download all extracted data as CSV files
- **⏰ Auto Processing** — Schedule automatic email processing at configurable intervals
- **🎨 Modern UI** — Beautiful, responsive dashboard built with React and Tailwind CSS

---

## 🏗️ Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI** | Async Python web framework |
| **SQLAlchemy** (async) | ORM with async support |
| **SQLite** / **PostgreSQL** | Database (SQLite for dev, PostgreSQL for prod) |
| **Groq API** | LLM-powered document field extraction |
| **PyMuPDF** | PDF text extraction |
| **Gmail API** | Email attachment processing |
| **APScheduler** | Background job scheduling |
| **JWT (PyJWT)** | Token-based authentication |
| **Passlib + bcrypt** | Password hashing |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | UI framework |
| **Vite** | Build tool & dev server |
| **Tailwind CSS 4** | Utility-first styling |
| **React Router v6** | Client-side routing |
| **Zustand** | Lightweight state management |
| **Axios** | HTTP client |
| **Framer Motion** | Animations |
| **Lucide React** | Icon library |

---

## 📁 Project Structure

```
docextract/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application entry
│   │   ├── config.py            # Environment configuration
│   │   ├── database.py          # Async SQLAlchemy setup
│   │   ├── models/              # SQLAlchemy models
│   │   │   ├── user.py
│   │   │   ├── field_template.py
│   │   │   ├── user_token.py
│   │   │   ├── extraction_session.py
│   │   │   └── extracted_row.py
│   │   ├── schemas/             # Pydantic request/response schemas
│   │   ├── routers/             # API route handlers
│   │   │   ├── auth.py          # Authentication endpoints
│   │   │   ├── templates.py     # Template CRUD
│   │   │   ├── upload.py        # PDF upload & test extraction
│   │   │   ├── gmail.py         # Gmail OAuth connection
│   │   │   ├── sessions.py      # Session management
│   │   │   ├── email_processing.py  # Email processing triggers
│   │   │   └── export.py        # Data viewing & CSV download
│   │   ├── services/            # Business logic
│   │   │   ├── ai_service.py    # Groq LLM integration
│   │   │   ├── pdf_service.py   # PDF text extraction
│   │   │   ├── email_processor.py   # Gmail attachment processing
│   │   │   ├── export_service.py    # CSV generation
│   │   │   └── scheduler.py    # Background job scheduler
│   │   ├── auth/                # JWT & OAuth utilities
│   │   └── utils/               # Error handlers
│   ├── .env.example
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable UI components
│   │   ├── pages/               # Route-level page components
│   │   ├── hooks/               # Custom React hooks
│   │   ├── services/            # API service modules
│   │   ├── stores/              # Zustand state stores
│   │   └── App.jsx              # Root application component
│   ├── package.json
│   └── vite.config.js
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+**
- **Node.js 18+** & **npm**
- **Groq API Key** — Get one at [console.groq.com](https://console.groq.com)
- **Google OAuth Credentials** (optional) — For Gmail integration & Google SSO

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/docextract.git
cd docextract
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate it
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your API keys and secrets
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install
```

### 4. Configure Environment Variables

Edit `backend/.env` with your credentials:

```env
DATABASE_URL=sqlite+aiosqlite:///./app.db
JWT_SECRET=your-super-secret-key-here
GROQ_API_KEY=your_groq_api_key_here
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000
```

### 5. Run the Application

**Backend** (Terminal 1):
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

**Frontend** (Terminal 2):
```bash
cd frontend
npm run dev
```

Open your browser at **http://localhost:5173** 🎉

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/signup` | Register a new account |
| `POST` | `/api/auth/login` | Login with credentials |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `POST` | `/api/auth/logout` | Logout (clear refresh cookie) |
| `GET` | `/api/auth/me` | Get current user profile |
| `GET` | `/api/auth/google` | Get Google OAuth URL |
| `GET` | `/api/auth/google/callback` | Google OAuth callback |
| `GET` | `/api/templates/` | List user's templates |
| `POST` | `/api/templates/` | Create a new template |
| `PUT` | `/api/templates/{id}` | Update a template |
| `DELETE` | `/api/templates/{id}` | Delete a template |
| `POST` | `/api/upload/test-extraction` | Test PDF extraction with a template |
| `GET` | `/api/gmail/status` | Check Gmail connection status |
| `GET` | `/api/gmail/connect` | Start Gmail OAuth flow |
| `GET` | `/api/gmail/callback` | Gmail OAuth callback |
| `POST` | `/api/gmail/disconnect` | Disconnect Gmail |
| `GET` | `/api/sessions/` | List extraction sessions |
| `POST` | `/api/sessions/` | Create a new session |
| `GET` | `/api/sessions/{id}` | Get session details |
| `PUT` | `/api/sessions/{id}` | Update a session |
| `DELETE` | `/api/sessions/{id}` | Delete a session |
| `POST` | `/api/email/process/{id}` | Trigger email processing |
| `GET` | `/api/export/sessions/{id}/data` | Get extracted data (paginated) |
| `GET` | `/api/export/sessions/{id}/download` | Download CSV |

---

## 🔄 How It Works

```
1. Create a Template    →  Define what fields to extract (e.g., "Invoice No", "Amount")
2. Create a Session     →  Link a template to an extraction session
3. Upload PDFs          →  Or connect Gmail to auto-scan attachments
4. AI Extraction        →  Groq LLM reads the PDF text and extracts your fields
5. View & Export        →  See results in a table, download as CSV
```

---

## 🛡️ Security

- JWT access tokens (15 min expiry) + httpOnly refresh token cookies (7 day expiry)
- Passwords hashed with bcrypt via Passlib
- All API endpoints require authentication (except auth routes)
- Google OAuth tokens stored securely in the database
- CORS configured for frontend origin only

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

Built with ❤️ using FastAPI + React
