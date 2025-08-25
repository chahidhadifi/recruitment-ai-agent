import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from tests.api.test_jobs import test_create_job


def test_create_application(client, test_admin_headers):
    # Create a job first
    job_id = test_create_job(client, test_admin_headers)
    
    # Test creating a new application
    application_data = {
        "job_id": job_id,
        "cover_letter": "I am interested in this position",
        "resume": "My resume content",
        "status": "pending"
    }
    response = client.post(
        f"{settings.API_V1_STR}/applications/",
        headers=test_admin_headers,
        json=application_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["job_id"] == application_data["job_id"]
    assert data["status"] == application_data["status"]
    assert "id" in data
    assert "created_at" in data
    return data["id"]


def test_get_applications(client, test_admin_headers):
    # Test getting all applications (requires authentication)
    response = client.get(
        f"{settings.API_V1_STR}/applications/",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_application_by_id(client, test_admin_headers):
    # Create an application first
    application_id = test_create_application(client, test_admin_headers)
    
    # Test getting a specific application by ID
    response = client.get(
        f"{settings.API_V1_STR}/applications/{application_id}",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == application_id


def test_update_application(client, test_admin_headers):
    # Create an application first
    application_id = test_create_application(client, test_admin_headers)
    
    # Test updating an application
    update_data = {
        "status": "accepted",
        "cover_letter": "Updated cover letter"
    }
    response = client.put(
        f"{settings.API_V1_STR}/applications/{application_id}",
        headers=test_admin_headers,
        json=update_data
    )
    assert response.status_code == 200
    assert response.json()["status"] == update_data["status"]
    assert response.json()["cover_letter"] == update_data["cover_letter"]


def test_delete_application(client, test_admin_headers):
    # Create an application first
    application_id = test_create_application(client, test_admin_headers)
    
    # Test deleting an application
    response = client.delete(
        f"{settings.API_V1_STR}/applications/{application_id}",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # Verify the application is deleted
    response = client.get(
        f"{settings.API_V1_STR}/applications/{application_id}",
        headers=test_admin_headers
    )
    assert response.status_code == 404