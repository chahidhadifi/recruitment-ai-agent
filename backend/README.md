# Recruitment AI Platform - Backend

This is the backend API for the Recruitment AI Platform, built with FastAPI and PostgreSQL.

## Features

- RESTful API with FastAPI
- PostgreSQL database with SQLAlchemy ORM
- Alembic for database migrations
- JWT authentication
- Role-based access control (Admin, Recruiter, Candidate)
- CRUD operations for users, jobs, applications, and interviews
- API documentation with Swagger UI

## Setup

### Prerequisites

- Python 3.8+
- PostgreSQL

### Installation

1. Clone the repository

```bash
git clone https://github.com/yourusername/recruitment-ai-full-platform.git
cd recruitment-ai-full-platform/backend
```

2. Create a virtual environment

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies

```bash
pip install -r requirements.txt
```

4. Set up environment variables

Create a `.env` file in the backend directory with the following variables:

```
POSTGRES_SERVER=localhost
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=recruitment
SECRET_KEY=your-secret-key
```

5. Run database migrations

```bash
alembic upgrade head
```

6. Initialize the database with seed data

```bash
python -m app.db.init_db_script
```

### Running the Application

```bash
uvicorn main:app --reload
```

The API will be available at http://localhost:8000

API documentation will be available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## API Endpoints

### Authentication
- POST /api/v1/login/access-token - Get access token
- GET /api/v1/login/test-token - Test access token

### Users
- GET /api/v1/users - Get all users
- POST /api/v1/users - Create a new user
- GET /api/v1/users/me - Get current user
- PUT /api/v1/users/me - Update current user
- GET /api/v1/users/stats - Get user statistics
- GET /api/v1/users/{user_id} - Get user by ID
- PUT /api/v1/users/{user_id} - Update user by ID

### Jobs
- GET /api/v1/jobs - Get all jobs
- POST /api/v1/jobs - Create a new job
- GET /api/v1/jobs/me - Get jobs posted by current recruiter
- GET /api/v1/jobs/{job_id} - Get job by ID
- PUT /api/v1/jobs/{job_id} - Update job by ID
- DELETE /api/v1/jobs/{job_id} - Delete job by ID

### Applications
- GET /api/v1/applications - Get all applications
- POST /api/v1/applications - Create a new application
- GET /api/v1/applications/me - Get applications submitted by current candidate
- GET /api/v1/applications/{application_id} - Get application by ID
- PUT /api/v1/applications/{application_id} - Update application by ID
- DELETE /api/v1/applications/{application_id} - Delete application by ID

### Interviews
- GET /api/v1/interviews - Get all interviews
- POST /api/v1/interviews - Create a new interview
- GET /api/v1/interviews/me - Get interviews for current user
- GET /api/v1/interviews/{interview_id} - Get interview by ID
- PUT /api/v1/interviews/{interview_id} - Update interview by ID
- DELETE /api/v1/interviews/{interview_id} - Delete interview by ID