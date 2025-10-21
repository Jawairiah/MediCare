# users/views.py
from rest_framework import generics, status, permissions
from rest_framework.response import Response
from users.serializers import RegisterSerializer, LoginSerializer, UserSerializer
from users.models import User
from django.db import transaction
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

class RegisterView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    @transaction.atomic
    def post(self, request, *args, **kwargs):
        """
        Client must send role first (doctor/patient) and all required fields in one request.
        Example payload (doctor):
        {
          "role": "doctor",
          "email": "...",
          "password": "...",
          "first_name": "...",
          "last_name": "...",
          "specialization": "...",
          "qualification": "...",
          "clinic_name": "..."
        }
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({
            "user": UserSerializer(user).data,
            "detail": "Account created successfully."
        }, status=status.HTTP_201_CREATED)


class LoginView(generics.GenericAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        """
        Login requires role + email + password.
        If the role does not match the stored role for the user, login is rejected.
        """
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        role = serializer.validated_data["role"]
        email = serializer.validated_data["email"]
        password = serializer.validated_data["password"]

        # authenticate using Django auth (ModelBackend consults USERNAME_FIELD)
        user = authenticate(request, email=email, password=password)
        if user is None:
            return Response({"detail": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)

        if user.role != role:
            return Response({"detail": "Role mismatch. Please login using the correct role."},
                            status=status.HTTP_403_FORBIDDEN)

        # issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response({
            "user": UserSerializer(user).data,
            "access": str(refresh.access_token),
            "refresh": str(refresh)
        })

