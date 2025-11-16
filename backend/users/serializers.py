# users/serializers.py
from rest_framework import serializers
from users.models import User
from doctors.models import DoctorProfile
from patients.models import PatientProfile

from clinic.models import Clinic
from doctors.models import DoctorClinic

class RegisterSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[("doctor", "doctor"), ("patient", "patient")])
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=6)
    first_name = serializers.CharField(required=False, allow_blank=True)
    last_name = serializers.CharField(required=False, allow_blank=True)

    # Doctor fields
    specialization = serializers.CharField(required=False, allow_blank=True)
    qualification = serializers.CharField(required=False, allow_blank=True)
    experience_years = serializers.IntegerField(required=False)
    clinic_id = serializers.IntegerField(required=False)  # NEW field: dropdown selection

    # Patient fields
    phone = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.CharField(required=False, allow_blank=True)
    address = serializers.CharField(required=False, allow_blank=True)

    def validate_clinic_id(self, value):
        if value and not Clinic.objects.filter(id=value).exists():
            raise serializers.ValidationError("Invalid clinic selected.")
        return value

    def create(self, validated_data):
        role = validated_data.pop("role")
        password = validated_data.pop("password")
        email = validated_data.pop("email")
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        clinic_id = validated_data.pop("clinic_id", None)

        user = User.objects.create_user(
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            role=role,
        )

        if role == "doctor":
            doctor = DoctorProfile.objects.create(
                user=user,
                specialization=validated_data.get("specialization", ""),
                qualification=validated_data.get("qualification", ""),
                experience_years=validated_data.get("experience_years"),
            )
            # Create DoctorClinic if clinic selected
            if clinic_id:
                clinic = Clinic.objects.get(id=clinic_id)
                DoctorClinic.objects.get_or_create(doctor=doctor, clinic=clinic)

        else:  # patient
            PatientProfile.objects.create(
                user=user,
                phone=validated_data.get("phone", ""),
                date_of_birth=validated_data.get("date_of_birth"),
                gender=validated_data.get("gender", ""),
                address=validated_data.get("address", ""),
            )

        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "first_name", "last_name", "role"]
        
        
class LoginSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=[("doctor","doctor"),("patient","patient")])
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        # Basic presence check done by fields; actual auth in view
        return data
        