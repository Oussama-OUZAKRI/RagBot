# RagBot Backend

FastAPI backend server for the RagBot project.

## Setup

1. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Start development server:
```bash
uvicorn main:app --reload
```

## API Documentation

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

Create a `.env` file with:
```
DATABASE_URL=postgresql://user:password@localhost:5432/ragbot
MODEL_PATH=path/to/model
```

## Testing

Run tests with:
```bash
pytest
```
