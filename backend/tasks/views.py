from django.db.models import Count, Q
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.filters import OrderingFilter, SearchFilter
from rest_framework.response import Response

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    queryset = Task.objects.all()
    filter_backends = [SearchFilter, OrderingFilter]
    search_fields = ["title", "description"]
    ordering_fields = ["created_at", "updated_at", "deadline", "title", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset().filter(owner=self.request.user)
        status_filter = self.request.query_params.get("status")
        priority_filter = self.request.query_params.get("priority")

        valid_statuses = Task.Status.values
        valid_priorities = Task.Priority.values

        if status_filter:
            if status_filter not in valid_statuses:
                raise ValidationError({"status": "Choose a valid task status."})
            queryset = queryset.filter(status=status_filter)

        if priority_filter:
            if priority_filter not in valid_priorities:
                raise ValidationError({"priority": "Choose a valid task priority."})
            queryset = queryset.filter(priority=priority_filter)

        return queryset

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    @action(detail=True, methods=["post"])
    def complete(self, request, pk=None):
        task = self.get_object()
        task.status = Task.Status.COMPLETED
        task.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(task).data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"])
    def stats(self, request):
        counts = Task.objects.filter(owner=request.user).aggregate(
            total=Count("id"),
            completed=Count("id", filter=Q(status=Task.Status.COMPLETED)),
            pending=Count("id", filter=Q(status=Task.Status.PENDING)),
            in_progress=Count("id", filter=Q(status=Task.Status.IN_PROGRESS)),
        )
        total = counts["total"]
        counts["completion_percentage"] = (
            round(counts["completed"] / total * 100) if total else 0
        )
        return Response(counts)
