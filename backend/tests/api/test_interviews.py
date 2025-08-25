import pytest
from fastapi.testclient import TestClient

from app.core.config import settings
from tests.api.test_applications import test_create_application


def test_create_interview(client, test_admin_headers):
    # Create an application first
    application_id = test_create_application(client, test_admin_headers)
    
    # Test creating a new interview
    interview_data = {
        "application_id": application_id,
        "date": "2023-12-01T10:00:00",
        "duration": 60,
        "location": "Online",
        "notes": "Technical interview",
        "status": "scheduled"
    }
    response = client.post(
        f"{settings.API_V1_STR}/interviews/",
        headers=test_admin_headers,
        json=interview_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["application_id"] == interview_data["application_id"]
    assert data["status"] == interview_data["status"]
    assert "id" in data
    assert "created_at" in data
    return data["id"]


def test_get_interviews(client, test_admin_headers):
    # Test getting all interviews (requires authentication)
    response = client.get(
        f"{settings.API_V1_STR}/interviews/",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_interview_by_id(client, test_admin_headers):
    # Create an interview first
    interview_id = test_create_interview(client, test_admin_headers)
    
    # Test getting a specific interview by ID
    response = client.get(
        f"{settings.API_V1_STR}/interviews/{interview_id}",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert response.json()["id"] == interview_id


def test_update_interview(client, test_admin_headers):
    # Create an interview first
    interview_id = test_create_interview(client, test_admin_headers)
    
    # Test updating an interview
    update_data = {
        "date": "2023-12-02T14:00:00",
        "status": "completed",
        "notes": "Interview went well"
    }
    response = client.put(
        f"{settings.API_V1_STR}/interviews/{interview_id}",
        headers=test_admin_headers,
        json=update_data
    )
    assert response.status_code == 200
    assert response.json()["status"] == update_data["status"]
    assert response.json()["notes"] == update_data["notes"]


def test_delete_interview(client, test_admin_headers):
    # Create an interview first
    interview_id = test_create_interview(client, test_admin_headers)
    
    # Test deleting an interview
    response = client.delete(
        f"{settings.API_V1_STR}/interviews/{interview_id}",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert response.json()["success"] is True
    
    # Verify the interview is deleted
    response = client.get(
        f"{settings.API_V1_STR}/interviews/{interview_id}",
        headers=test_admin_headers
    )
    assert response.status_code == 404