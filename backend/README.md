# GPS Tracking & Passenger Count Backend

FastAPI backend for tracking live GPS data from NEO-6M module and processing passenger counts using AI.

## Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── models.py            # Pydantic models for data validation
├── ai_service.py        # Placeholder AI service for passenger counting
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
└── .gitignore          # Git ignore rules
```

## Features

- **GPS Data Endpoint**: POST `/api/location` to receive GPS coordinates from NEO-6M module
- **Dashboard Data Endpoint**: GET `/api/dashboard-data` to retrieve latest location and AI passenger count
- **CORS Enabled**: Configured for frontend at `http://localhost:5173`
- **Async AI Processing**: Simulated AI service with async processing
- **Type Safety**: Full typing with Pydantic models
- **Health Check**: Root endpoint for service status

## Installation

1. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Configure environment variables in `.env`:
   ```env
   # Server Configuration
   PORT=5000
   
   # AI API Configuration
   # Replace with your actual AI API key when ready
   AI_API_KEY=your_ai_api_key_here
   
   # Optional: AI API Endpoint (uncomment and modify if needed)
   # AI_API_URL=https://api.example.com/v1/passenger-count
   ```

## Running the Server

### Development Mode (with auto-reload):
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Production Mode:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

The API will be available at:
- **Base URL**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

## API Endpoints

### Health Check
```http
GET /
```
Returns service health status.

### Receive GPS Data
```http
POST /api/location
Content-Type: application/json

{
  "latitude": 40.7128,
  "longitude": -74.0060,
  "timestamp": "2026-03-27T18:54:53.190Z"
}
```

### Get Dashboard Data
```http
GET /api/dashboard-data
```
Returns latest GPS data and AI-processed passenger count.

## Environment Variables

- `PORT`: Server port (default: 5000)
- `AI_API_KEY`: API key for external AI service (if used)
- `AI_API_URL`: Endpoint for external AI service (optional)

## Dependencies

- **FastAPI**: Modern web framework for building APIs
- **Uvicorn**: ASGI server for production deployment
- **Pydantic**: Data validation and settings management
- **Python-dotenv**: Environment variable management

## Development Notes

This backend is designed to work with a frontend running on `http://localhost:5173` (typical Vite dev server port). The CORS middleware is configured accordingly.

The AI service (`ai_service.py`) currently provides a mock implementation that simulates processing delay and returns random passenger counts. Replace this with actual AI model integration when available.