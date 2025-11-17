from rest_framework import serializers
from doctors.models import DoctorProfile
from clinic.models import Clinic
from doctors.models import DoctorClinic
from rest_framework import serializers
from doctors.models import DoctorAvailability

class DoctorAvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.CharField())


class DoctorClinicInfoSerializer(serializers.ModelSerializer):
    clinic_name = serializers.CharField(source="clinic.name", read_only=True)

    class Meta:
        model = DoctorClinic
        fields = ["clinic", "clinic_name", "consultation_fee"]
        

class DoctorListSerializer(serializers.ModelSerializer):
    clinics = DoctorClinicInfoSerializer(many=True, source="doctorclinic_set")

    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "user",
            "specialization",
            "qualification",
            "experience_years",
            "clinics"
        ]


class DoctorDetailSerializer(serializers.ModelSerializer):
    clinics = DoctorClinicInfoSerializer(many=True, source="doctorclinic_set")

    class Meta:
        model = DoctorProfile
        fields = [
            "id",
            "user",
            "specialization",
            "qualification",
            "experience_years",
            "clinics"
        ]


class AvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.CharField())

