import json

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_protect
from django.views.decorators.http import require_GET, require_POST


def user_data(user):
    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
    }


def read_payload(request):
    try:
        payload = json.loads(request.body or b"{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None
    return payload if isinstance(payload, dict) else None


@require_GET
@ensure_csrf_cookie
def csrf_token(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
@csrf_protect
def register_view(request):
    payload = read_payload(request)
    if payload is None:
        return JsonResponse({"detail": "A valid JSON object is required."}, status=400)

    email = payload.get("email", "")
    password = payload.get("password", "")
    if not isinstance(email, str) or not email.strip():
        return JsonResponse({"email": ["Enter a valid email address."]}, status=400)
    if not isinstance(password, str) or not password:
        return JsonResponse({"password": ["Enter a password."]}, status=400)

    email = email.strip().lower()
    try:
        validate_email(email)
    except ValidationError:
        return JsonResponse({"email": ["Enter a valid email address."]}, status=400)

    from django.contrib.auth.models import User

    if User.objects.filter(username__iexact=email).exists():
        return JsonResponse({"email": ["An account with this email already exists."]}, status=400)

    candidate = User(username=email, email=email)
    try:
        validate_password(password, user=candidate)
    except ValidationError as error:
        return JsonResponse({"password": list(error.messages)}, status=400)

    candidate.set_password(password)
    candidate.save()
    return JsonResponse(
        {"detail": "Account created. Sign in with your email and password."},
        status=201,
    )


@require_POST
@csrf_protect
def login_view(request):
    payload = read_payload(request)
    if payload is None:
        return JsonResponse({"detail": "A valid JSON object is required."}, status=400)

    email = payload.get("email", "")
    password = payload.get("password", "")
    if not isinstance(email, str) or not email.strip() or not isinstance(password, str) or not password:
        return JsonResponse({"detail": "Enter your email and password."}, status=400)

    user = authenticate(request, username=email.strip().lower(), password=password)
    if user is None:
        return JsonResponse({"detail": "The email or password is incorrect."}, status=400)

    login(request, user)
    return JsonResponse({"user": user_data(user)})


@require_POST
@csrf_protect
def logout_view(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication is required."}, status=401)
    logout(request)
    return JsonResponse({"detail": "Signed out."})


@require_GET
def current_user(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Authentication is required."}, status=401)
    return JsonResponse({"user": user_data(request.user)})
