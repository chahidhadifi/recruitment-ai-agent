import pytest
from fastapi.testclient import TestClient

from app.core.config import settings


def test_create_job(client, test_admin_headers):
    # Test creating a new job
    job_data = {
        "title": "Software Engineer",
        "description": "We are looking for a software engineer",
        "company": "Tech Company",
        "location": "New York",
        "salary": "100000",
        "job_type": "full-time",
        "requirements": "5 years of experience",
        "status": "active"
    }
    response = client.post(
        f"{settings.API_V1_STR}/jobs/",
        headers=test_admin_headers,
        json=job_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == job_data["title"]
    assert data["company"] == job_data["company"]
    assert "id" in data
    assert "created_at" in data
    return data["id"]


def test_get_jobs(client):
    # Test getting all jobs (public endpoint)
    response = client.get(f"{settings.API_V1_STR}/jobs/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_job_by_id(client, test_admin_headers):
    # Create a job first
    job_id = test_create_job(client, test_admin_headers)
    
    # Test getting a specific job by ID
    response = client.get(f"{settings.API_V1_STR}/jobs/{job_id}")
    assert response.status_code == 200
    assert response.json()["id"] == job_id


def test_update_job(client, test_admin_headers):
    # Create a job first
    job_id = test_create_job(client, test_admin_headers)
    
    # Test updating a job
    update_data = {
        "title": "Senior Software Engineer",
        "salary": "120000"
    }
    response = client.put(
        f"{settings.API_V1_STR}/jobs/{job_id}",
        headers=test_admin_headers,
        json=update_data
    )
    assert response.status_code == 200
    assert response.json()["title"] == update_data["title"]
    assert response.json()["salary"] == update_data["salary"]


def test_delete_job(client, test_admin_headers):
    # Create a job first
    job_id = test_create_job(client, test_admin_headers)
    
    # Test deleting a job
    response = client.delete(
        f"{settings.API_V1_STR}/jobs/{job_id}",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # Verify the job is deleted
    response = client.get(f"{settings.API_V1_STR}/jobs/{job_id}")
    assert response.status_code == 404