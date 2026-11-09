from django.contrib import admin
from django.urls import include, path

from tasks.auth_views import csrf_token, current_user, login_view, logout_view, register_view

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/csrf/", csrf_token, name="csrf-token"),
    path("api/auth/login/", login_view, name="login"),
    path("api/auth/register/", register_view, name="register"),
    path("api/auth/logout/", logout_view, name="logout"),
    path("api/auth/me/", current_user, name="current-user"),
    path("api/", include("tasks.urls")),
]
