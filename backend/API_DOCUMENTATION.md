# Recruitment AI Platform API Documentation

This document provides detailed information about the API endpoints available in the Recruitment AI Platform.

## Base URL

All API endpoints are prefixed with `/api/v1`.

## Authentication

Most endpoints require authentication using JWT tokens. To authenticate, include the token in the Authorization header:

```
Authorization: Bearer <your_token>
```

### Authentication Endpoints

#### Login

```
POST /api/v1/login/access-token
```

Obtain a JWT access token.

**Request Body:**
```json
{
  "username": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

#### Test Token

```
GET /api/v1/login/test-token
```

Test if the access token is valid.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",
  "status": "actif"
}
```

## Users

### Get All Users

```
GET /api/v1/users/
```

Retrieve all users. Requires admin role.

**Query Parameters:**
- `role`: Filter by role (admin, recruteur, candidat)
- `status`: Filter by status (actif, inactif)
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "admin",
    "status": "actif",
    "created_at": "2023-01-01T00:00:00"
  },
  ...
]
```

### Create User

```
POST /api/v1/users/
```

Create a new user.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password",
  "name": "New User",
  "role": "candidat",
  "status": "actif"
}
```

**Response:**
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "name": "New User",
  "role": "candidat",
  "status": "actif",
  "created_at": "2023-01-01T00:00:00"
}
```

### Get Current User

```
GET /api/v1/users/me
```

Get the current authenticated user's details.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",
  "status": "actif",
  "created_at": "2023-01-01T00:00:00"
}
```

### Update Current User

```
PUT /api/v1/users/me
```

Update the current authenticated user's details.

**Request Body:**
```json
{
  "name": "Updated Name",
  "password": "newpassword"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Updated Name",
  "role": "admin",
  "status": "actif",
  "created_at": "2023-01-01T00:00:00"
}
```

### Get User Statistics

```
GET /api/v1/users/stats
```

Get user statistics. Requires admin role.

**Response:**
```json
{
  "total": 10,
  "active": 8,
  "inactive": 2,
  "admins": 1,
  "recruiters": 3,
  "candidates": 6
}
```

### Get User by ID

```
GET /api/v1/users/{user_id}
```

Get a specific user by ID. Requires admin role.

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "User Name",
  "role": "admin",
  "status": "actif",
  "created_at": "2023-01-01T00:00:00"
}
```

### Update User by ID

```
PUT /api/v1/users/{user_id}
```

Update a specific user by ID. Requires admin role.

**Request Body:**
```json
{
  "name": "Updated Name",
  "role": "recruteur",
  "status": "inactif"
}
```

**Response:**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Updated Name",
  "role": "recruteur",
  "status": "inactif",
  "created_at": "2023-01-01T00:00:00"
}
```

## Jobs

### Get All Jobs

```
GET /api/v1/jobs/
```

Retrieve all jobs.

**Query Parameters:**
- `search`: Search term for title, description, or company
- `location`: Filter by location
- `job_type`: Filter by job type (full-time, part-time, contract, etc.)
- `company`: Filter by company
- `sort`: Sort by field (created_at, title, company)
- `order`: Sort order (asc, desc)
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "description": "We are looking for a software engineer",
    "company": "Tech Company",
    "location": "New York",
    "salary": "100000",
    "job_type": "full-time",
    "requirements": "5 years of experience",
    "status": "active",
    "recruiter_id": 2,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  },
  ...
]
```

### Create Job

```
POST /api/v1/jobs/
```

Create a new job. Requires recruiter role.

**Request Body:**
```json
{
  "title": "Software Engineer",
  "description": "We are looking for a software engineer",
  "company": "Tech Company",
  "location": "New York",
  "salary": "100000",
  "job_type": "full-time",
  "requirements": "5 years of experience",
  "status": "active"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Software Engineer",
  "description": "We are looking for a software engineer",
  "company": "Tech Company",
  "location": "New York",
  "salary": "100000",
  "job_type": "full-time",
  "requirements": "5 years of experience",
  "status": "active",
  "recruiter_id": 2,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Get Jobs Posted by Current Recruiter

```
GET /api/v1/jobs/me
```

Get jobs posted by the current authenticated recruiter. Requires recruiter role.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "description": "We are looking for a software engineer",
    "company": "Tech Company",
    "location": "New York",
    "salary": "100000",
    "job_type": "full-time",
    "requirements": "5 years of experience",
    "status": "active",
    "recruiter_id": 2,
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  },
  ...
]
```

### Get Job by ID

```
GET /api/v1/jobs/{job_id}
```

Get a specific job by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Software Engineer",
  "description": "We are looking for a software engineer",
  "company": "Tech Company",
  "location": "New York",
  "salary": "100000",
  "job_type": "full-time",
  "requirements": "5 years of experience",
  "status": "active",
  "recruiter_id": 2,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Update Job by ID

```
PUT /api/v1/jobs/{job_id}
```

Update a specific job by ID. Requires the job's recruiter or admin role.

**Request Body:**
```json
{
  "title": "Senior Software Engineer",
  "salary": "120000",
  "status": "inactive"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "description": "We are looking for a software engineer",
  "company": "Tech Company",
  "location": "New York",
  "salary": "120000",
  "job_type": "full-time",
  "requirements": "5 years of experience",
  "status": "inactive",
  "recruiter_id": 2,
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Delete Job by ID

```
DELETE /api/v1/jobs/{job_id}
```

Delete a specific job by ID. Requires the job's recruiter or admin role.

**Response:**
```json
{
  "success": true,
  "message": "Job deleted successfully"
}
```

## Applications

### Get All Applications

```
GET /api/v1/applications/
```

Retrieve all applications. Access is role-based:
- Admins: All applications
- Recruiters: Applications for their jobs
- Candidates: Their own applications

**Query Parameters:**
- `job_id`: Filter by job ID
- `candidate_id`: Filter by candidate ID
- `status`: Filter by status (pending, accepted, rejected, etc.)
- `sort`: Sort by field (created_at, status)
- `order`: Sort order (asc, desc)
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "job_id": 1,
    "candidate_id": 3,
    "cover_letter": "I am interested in this position",
    "resume": "My resume content",
    "status": "pending",
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  },
  ...
]
```

### Create Application

```
POST /api/v1/applications/
```

Create a new application. Requires candidate role.

**Request Body:**
```json
{
  "job_id": 1,
  "cover_letter": "I am interested in this position",
  "resume": "My resume content",
  "status": "pending"
}
```

**Response:**
```json
{
  "id": 1,
  "job_id": 1,
  "candidate_id": 3,
  "cover_letter": "I am interested in this position",
  "resume": "My resume content",
  "status": "pending",
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Get Applications Submitted by Current Candidate

```
GET /api/v1/applications/me
```

Get applications submitted by the current authenticated candidate. Requires candidate role.

**Response:**
```json
[
  {
    "id": 1,
    "job_id": 1,
    "candidate_id": 3,
    "cover_letter": "I am interested in this position",
    "resume": "My resume content",
    "status": "pending",
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  },
  ...
]
```

### Get Application by ID

```
GET /api/v1/applications/{application_id}
```

Get a specific application by ID. Access is role-based.

**Response:**
```json
{
  "id": 1,
  "job_id": 1,
  "candidate_id": 3,
  "cover_letter": "I am interested in this position",
  "resume": "My resume content",
  "status": "pending",
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Update Application by ID

```
PUT /api/v1/applications/{application_id}
```

Update a specific application by ID. Access and field restrictions are role-based.

**Request Body:**
```json
{
  "status": "accepted",
  "cover_letter": "Updated cover letter"
}
```

**Response:**
```json
{
  "id": 1,
  "job_id": 1,
  "candidate_id": 3,
  "cover_letter": "Updated cover letter",
  "resume": "My resume content",
  "status": "accepted",
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Delete Application by ID

```
DELETE /api/v1/applications/{application_id}
```

Delete a specific application by ID. Requires the application's candidate, the job's recruiter, or admin role.

**Response:**
```json
{
  "success": true,
  "message": "Application deleted successfully"
}
```

## Interviews

### Get All Interviews

```
GET /api/v1/interviews/
```

Retrieve all interviews. Access is role-based:
- Admins: All interviews
- Recruiters: Interviews they created
- Candidates: Interviews for their applications

**Query Parameters:**
- `application_id`: Filter by application ID
- `recruiter_id`: Filter by recruiter ID
- `status`: Filter by status (scheduled, completed, cancelled, etc.)
- `date_from`: Filter by date (from)
- `date_to`: Filter by date (to)
- `sort`: Sort by field (date, status, created_at)
- `order`: Sort order (asc, desc)
- `skip`: Number of records to skip (default: 0)
- `limit`: Maximum number of records to return (default: 100)

**Response:**
```json
[
  {
    "id": 1,
    "application_id": 1,
    "recruiter_id": 2,
    "date": "2023-12-01T10:00:00",
    "duration": 60,
    "location": "Online",
    "notes": "Technical interview",
    "status": "scheduled",
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  },
  ...
]
```

### Create Interview

```
POST /api/v1/interviews/
```

Create a new interview. Requires recruiter role.

**Request Body:**
```json
{
  "application_id": 1,
  "date": "2023-12-01T10:00:00",
  "duration": 60,
  "location": "Online",
  "notes": "Technical interview",
  "status": "scheduled"
}
```

**Response:**
```json
{
  "id": 1,
  "application_id": 1,
  "recruiter_id": 2,
  "date": "2023-12-01T10:00:00",
  "duration": 60,
  "location": "Online",
  "notes": "Technical interview",
  "status": "scheduled",
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Get Interviews for Current User

```
GET /api/v1/interviews/me
```

Get interviews for the current authenticated user. Role-based:
- Recruiters: Interviews they created
- Candidates: Interviews for their applications

**Response:**
```json
[
  {
    "id": 1,
    "application_id": 1,
    "recruiter_id": 2,
    "date": "2023-12-01T10:00:00",
    "duration": 60,
    "location": "Online",
    "notes": "Technical interview",
    "status": "scheduled",
    "created_at": "2023-01-01T00:00:00",
    "updated_at": "2023-01-01T00:00:00"
  },
  ...
]
```

### Get Interview by ID

```
GET /api/v1/interviews/{interview_id}
```

Get a specific interview by ID. Access is role-based.

**Response:**
```json
{
  "id": 1,
  "application_id": 1,
  "recruiter_id": 2,
  "date": "2023-12-01T10:00:00",
  "duration": 60,
  "location": "Online",
  "notes": "Technical interview",
  "status": "scheduled",
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Update Interview by ID

```
PUT /api/v1/interviews/{interview_id}
```

Update a specific interview by ID. Requires the interview's recruiter or admin role.

**Request Body:**
```json
{
  "date": "2023-12-02T14:00:00",
  "status": "completed",
  "notes": "Interview went well"
}
```

**Response:**
```json
{
  "id": 1,
  "application_id": 1,
  "recruiter_id": 2,
  "date": "2023-12-02T14:00:00",
  "duration": 60,
  "location": "Online",
  "notes": "Interview went well",
  "status": "completed",
  "created_at": "2023-01-01T00:00:00",
  "updated_at": "2023-01-01T00:00:00"
}
```

### Delete Interview by ID

```
DELETE /api/v1/interviews/{interview_id}
```

Delete a specific interview by ID. Requires the interview's recruiter or admin role.

**Response:**
```json
{
  "success": true,
  "message": "Interview deleted successfully"
}
```