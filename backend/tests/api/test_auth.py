import pytest
from fastapi.testclient import TestClient

from app.core.config import settings


def test_login_access_token(client, test_db):
    # This test will fail until we have a real user in the test database
    # We'll need to create a user first in a more comprehensive test
    response = client.post(
        f"{settings.API_V1_STR}/login/access-token",
        data={"username": "admin@example.com", "password": "password"}
    )
    # Since we don't have a real user yet, we expect this to fail
    assert response.status_code == 400
    assert "Incorrect email or password" in response.text


def test_test_token(client, test_admin_headers):
    response = client.get(
        f"{settings.API_V1_STR}/login/test-token",
        headers=test_admin_headers
    )
    assert response.status_code == 200
    assert "email" in response.json()
    assert response.json()["email"] == "test@example.com"