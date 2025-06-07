# RagBot - AI Question Answering System

## Project Overview
RagBot is an intelligent question-answering system that uses RAG (Retrieval Augmented Generation) technology to provide accurate answers based on your documents.

## Technology Stack
- **Frontend**: React + JavaScript + Vite
- **Backend**: FastAPI + Python
- **Database**: PostgreSQL + ChromaDB for vector embeddings
- **AI Model**: LangChain / OpenAI
- **Docker**: Containerization and deployment

## Project Structure
```
RagBot/
├── frontend/              # React frontend application
│   ├── src/              # Source files
│   ├── public/           # Static files
│   └── package.json      # Dependencies
├── backend/              # FastAPI backend server
│   ├── app/             # Application code
│   ├── models/          # Database models
│   └── services/        # Business logic
├── docs/                # Documentation
└── docker-compose.yml   # Docker services configuration
```

## Features
- Document upload and processing
- Semantic search using vector embeddings
- Real-time question answering
- Document context retrieval
- API documentation with Swagger

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 16+
- Python 3.9+

### Installation Steps
1. Clone the repository:
```bash
git clone https://github.com/yourusername/RagBot.git
cd RagBot
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start the services:
```bash
docker-compose up -d
```

4. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Development

See individual README files in frontend and backend directories for detailed development instructions.

## Contributing
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request
