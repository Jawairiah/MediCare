# users/views.py
from django.db import connection
from rest_framework import permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import make_password, check_password
from users.serializers import RegisterSerializer, LoginSerializer, UserSerializer


def dictfetchone(cursor):
    """Return one row from a cursor as a dict"""
    row = cursor.fetchone()
    if row is None:
        return None
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))


class RegisterView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        role = serializer.validated_data.get("role")
        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")
        first_name = serializer.validated_data.get("first_name", "")
        last_name = serializer.validated_data.get("last_name", "")
        clinic_id = serializer.validated_data.get("clinic_id")

        with connection.cursor() as cursor:
            # Check if email already exists
            cursor.execute("SELECT id FROM users_user WHERE email = %s", [email])
            if cursor.fetchone():
                return Response({"error": "Email already registered."}, status=400)
            
            
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get("email")
        password = serializer.validated_data.get("password")

        with connection.cursor() as cursor:
            cursor.execute("""
                SELECT id, email, password, first_name, last_name, role 
                FROM users_user 
                WHERE email = %s
            """, [email])

            user = dictfetchone(cursor)

        # If no user found
        if not user:
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Check password
        if not check_password(password, user["password"]):
            return Response({"error": "Invalid email or password."}, status=status.HTTP_401_UNAUTHORIZED)

        # Create JWT tokens
        refresh = RefreshToken()
        refresh["user_id"] = user["id"]
        refresh["email"] = user["email"]
        refresh["role"] = user["role"]

        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Prepare user data
        user_data = {
            "id": user["id"],
            "email": user["email"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "role": user["role"],
        }

        return Response({
            "user": user_data,
            "access": access_token,
            "refresh": refresh_token
        })
            