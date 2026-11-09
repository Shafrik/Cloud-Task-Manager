from rest_framework import status
from rest_framework.test import APIClient, APITestCase
from django.contrib.auth.models import User

from .models import Task


class TaskApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username="owner@example.com",
            email="owner@example.com",
            password="Secure-Task-Password-2046!",
        )
        self.client.force_authenticate(user=self.user)

    def test_create_task_and_reject_blank_title(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Plan launch", "priority": "high"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["title"], "Plan launch")
        self.assertEqual(response.data["status"], Task.Status.PENDING)
        self.assertEqual(Task.objects.get().owner, self.user)

        invalid_response = self.client.post(
            "/api/tasks/",
            {"title": "   "},
            format="json",
        )
        self.assertEqual(invalid_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("title", invalid_response.data)

    def test_task_filters_and_search(self):
        Task.objects.create(title="Write proposal", status=Task.Status.PENDING, owner=self.user)
        Task.objects.create(
            title="Review dashboard",
            description="Check the launch design",
            priority=Task.Priority.HIGH,
            status=Task.Status.IN_PROGRESS,
            owner=self.user,
        )

        response = self.client.get("/api/tasks/?status=in_progress&priority=high&search=launch")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["title"], "Review dashboard")

    def test_invalid_filter_returns_validation_error(self):
        response = self.client.get("/api/tasks/?status=finished")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status", response.data)

    def test_complete_stats_update_and_delete(self):
        task = Task.objects.create(title="Ship feature", owner=self.user)

        complete_response = self.client.post(f"/api/tasks/{task.id}/complete/")
        self.assertEqual(complete_response.status_code, status.HTTP_200_OK)
        self.assertEqual(complete_response.data["status"], Task.Status.COMPLETED)

        stats_response = self.client.get("/api/tasks/stats/")
        self.assertEqual(stats_response.data["total"], 1)
        self.assertEqual(stats_response.data["completed"], 1)
        self.assertEqual(stats_response.data["completion_percentage"], 100)

        update_response = self.client.patch(
            f"/api/tasks/{task.id}/",
            {"title": "Ship improved feature"},
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["title"], "Ship improved feature")

        delete_response = self.client.delete(f"/api/tasks/{task.id}/")
        self.assertEqual(delete_response.status_code, status.HTTP_204_NO_CONTENT)

    def test_user_can_only_access_their_own_tasks(self):
        other_user = User.objects.create_user(
            username="other@example.com",
            email="other@example.com",
            password="Secure-Task-Password-2046!",
        )
        own_task = Task.objects.create(title="My task", owner=self.user)
        other_task = Task.objects.create(title="Private task", owner=other_user)

        list_response = self.client.get("/api/tasks/")
        other_detail_response = self.client.get(f"/api/tasks/{other_task.id}/")

        self.assertEqual([task["id"] for task in list_response.data], [own_task.id])
        self.assertEqual(other_detail_response.status_code, status.HTTP_404_NOT_FOUND)

    def test_past_deadline_is_allowed(self):
        response = self.client.post(
            "/api/tasks/",
            {"title": "Past deadline", "deadline": "2020-01-01"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["deadline"], "2020-01-01")


class AuthApiTests(APITestCase):
    def test_account_registration_requires_csrf_and_creates_session(self):
        client = APIClient(enforce_csrf_checks=True)
        csrf_response = client.get("/api/auth/csrf/")
        token = csrf_response.json()["csrfToken"]

        response = client.post(
            "/api/auth/register/",
            {"email": "new@example.com", "password": "A-Long-Unique-Password-2046!"},
            format="json",
            HTTP_X_CSRFTOKEN=token,
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("Sign in", response.json()["detail"])
        self.assertNotIn("sessionid", client.cookies)

        current_user = client.get("/api/auth/me/")
        self.assertEqual(current_user.status_code, status.HTTP_401_UNAUTHORIZED)

        fresh_token = client.get("/api/auth/csrf/").json()["csrfToken"]
        login_response = client.post(
            "/api/auth/login/",
            {"email": "new@example.com", "password": "A-Long-Unique-Password-2046!"},
            format="json",
            HTTP_X_CSRFTOKEN=fresh_token,
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        self.assertEqual(login_response.json()["user"]["email"], "new@example.com")
        self.assertIn("sessionid", client.cookies)

        fresh_token = client.get("/api/auth/csrf/").json()["csrfToken"]
        logout_response = client.post(
            "/api/auth/logout/",
            {},
            format="json",
            HTTP_X_CSRFTOKEN=fresh_token,
        )
        self.assertEqual(logout_response.status_code, status.HTTP_200_OK)

    def test_login_rejects_invalid_credentials(self):
        User.objects.create_user(
            username="person@example.com",
            email="person@example.com",
            password="A-Long-Unique-Password-2046!",
        )
        response = self.client.post(
            "/api/auth/login/",
            {"email": "person@example.com", "password": "not-the-password"},
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
