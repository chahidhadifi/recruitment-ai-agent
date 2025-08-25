import pytest
from fastapi.testclient import TestClient

from app.core.config import settings


def test_create_user(client):
    # Test creating a new user
    user_data = {
        "email": "newuser@example.com",
        "password": "password123",
        "name": "New User",
        "role": "candidat",
        "status": "actif"
    }
    response = client.post(
        f"{settings.API_V1_STR}/users/",
        json=user_data
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user_data["email"]
    assert data["name"] == user_data["name"]
    assert data["role"] == user_data["role"]
    assert "id" in data
    assert "password" not in data


def test_get_users(client, test_admin_headers):
    # Test getting all users (requires admin token)
    response = client.get(
        f"{settings.API_V1_STR}/users/",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert isinstance(response.json(), list)


def test_get_current_user(client, test_admin_headers):
    # Test getting current user details
    response = client.get(
        f"{settings.API_V1_STR}/users/me",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"


def test_update_current_user(client, test_admin_headers):
    # Test updating current user details
    update_data = {
        "name": "Updated Name"
    }
    response = client.put(
        f"{settings.API_V1_STR}/users/me",
        headers=test_admin_headers,
        json=update_data
    )
    assert response.status_code == 200
    assert response.json()["name"] == update_data["name"]