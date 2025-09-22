import requests
import json
import uuid

BASE_URL = "http://localhost:8000"

def login(email, password):
    response = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": password})
    if response.status_code == 200:
        return response.json()["access_token"]
    else:
        print(f"Login failed: {response.status_code} - {response.text}")
        return None

def test_endpoint(method, url, headers=None, data=None, expected_status=200):
    response = requests.request(method, url, headers=headers, json=data)
    print(f"{method} {url} - Status: {response.status_code}")
    if response.status_code != expected_status:
        print(f"  Expected {expected_status}, got {response.status_code}")
        print(f"  Response: {response.text}")
    else:
        print(f"  Success: {response.json() if response.headers.get('content-type') == 'application/json' else response.text}")
    return response.status_code == expected_status

def register_user(email, password, name="Test User", role="candidat"):
    response = requests.post(f"{BASE_URL}/api/users/", json={"email": email, "password": password, "name": name, "role": role})
    if response.status_code == 201:
        print(f"User registered: {email}")
        return True
    else:
        print(f"Registration failed: {response.status_code} - {response.text}")
        return False

def main():
    # Generate unique email for testing
    unique_email = f"testuser_{uuid.uuid4().hex[:8]}@example.com"
    password = "testpass"

    # First, register a test user
    if not register_user(unique_email, password, "Test User", "candidat"):
        print("Cannot register user")
        return

    # Test login
    token = login(unique_email, password)
    if not token:
        print("Cannot proceed without login token")
        return

    headers = {"Authorization": f"Bearer {token}"}

    # Test user endpoints
    print("\n=== Testing User Endpoints ===")
    test_endpoint("GET", f"{BASE_URL}/api/users/", headers=headers)
    test_endpoint("POST", f"{BASE_URL}/api/users/", headers=headers, data={"email": f"test_{uuid.uuid4().hex[:8]}@example.com", "password": "testpass", "name": "Test User", "role": "candidat"}, expected_status=201)
    test_endpoint("GET", f"{BASE_URL}/api/users/1", headers=headers)
    test_endpoint("PUT", f"{BASE_URL}/api/users/1", headers=headers, data={"email": f"updated_{uuid.uuid4().hex[:8]}@example.com"})
    test_endpoint("DELETE", f"{BASE_URL}/api/users/1", headers=headers, expected_status=204)

    # Test auth endpoints
    print("\n=== Testing Auth Endpoints ===")
    test_endpoint("POST", f"{BASE_URL}/api/auth/login", data={"email": unique_email, "password": password})
    test_endpoint("POST", f"{BASE_URL}/api/auth/register", data={"email": f"newuser_{uuid.uuid4().hex[:8]}@example.com", "password": "newpass", "name": "New User", "role": "candidat"}, expected_status=201)

    # Test job endpoints
    print("\n=== Testing Job Endpoints ===")
    test_endpoint("GET", f"{BASE_URL}/api/jobs/", headers=headers)
    test_endpoint("POST", f"{BASE_URL}/api/jobs/", headers=headers, data={"title": "Test Job", "description": "Test Description", "company": "Test Company", "location": "Test City", "type": "CDI", "recruiter_id": 1}, expected_status=201)
    test_endpoint("GET", f"{BASE_URL}/api/jobs/1", headers=headers)
    test_endpoint("PUT", f"{BASE_URL}/api/jobs/1", headers=headers, data={"title": "Updated Job"})
    test_endpoint("DELETE", f"{BASE_URL}/api/jobs/1", headers=headers, expected_status=204)

    # Test application endpoints
    print("\n=== Testing Application Endpoints ===")
    test_endpoint("GET", f"{BASE_URL}/api/applications/", headers=headers)
    test_endpoint("POST", f"{BASE_URL}/api/applications/", headers=headers, data={"job_id": 1, "candidate_id": 1, "cv_url": "test_cv.pdf"}, expected_status=201)
    test_endpoint("GET", f"{BASE_URL}/api/applications/1", headers=headers)
    test_endpoint("PUT", f"{BASE_URL}/api/applications/1", headers=headers, data={"status": "accepted"})
    test_endpoint("DELETE", f"{BASE_URL}/api/applications/1", headers=headers, expected_status=204)

    # Test interview endpoints
    print("\n=== Testing Interview Endpoints ===")
    test_endpoint("GET", f"{BASE_URL}/api/interviews/", headers=headers)
    test_endpoint("POST", f"{BASE_URL}/api/interviews/", headers=headers, data={"candidate_id": 1, "position": "Test Position", "date": "2024-01-01T10:00:00"}, expected_status=201)
    test_endpoint("GET", f"{BASE_URL}/api/interviews/1", headers=headers)
    test_endpoint("PUT", f"{BASE_URL}/api/interviews/1", headers=headers, data={"status": "completed"})
    test_endpoint("DELETE", f"{BASE_URL}/api/interviews/1", headers=headers, expected_status=204)

    # Test message endpoints
    print("\n=== Testing Message Endpoints ===")
    test_endpoint("GET", f"{BASE_URL}/api/messages/", headers=headers)
    test_endpoint("POST", f"{BASE_URL}/api/messages/", headers=headers, data={"interview_id": 1, "role": "user", "content": "Test message"}, expected_status=201)
    test_endpoint("GET", f"{BASE_URL}/api/messages/1", headers=headers)
    test_endpoint("PUT", f"{BASE_URL}/api/messages/1", headers=headers, data={"content": "Updated message"})
    test_endpoint("DELETE", f"{BASE_URL}/api/messages/1", headers=headers, expected_status=204)

if __name__ == "__main__":
    main()
