# patients/serializers.py
from rest_framework import serializers

class PatientProfileSerializer(serializers.Serializer):
    """Serializer for patient profile view/edit"""
    id = serializers.IntegerField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    date_of_birth = serializers.DateField(allow_null=True, required=False)
    age = serializers.IntegerField(read_only=True, required=False)
    gender = serializers.CharField(max_length=10, allow_blank=True, required=False)
    phone = serializers.CharField(max_length=20, allow_blank=True, required=False)
    address = serializers.CharField(allow_blank=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    

class DoctorAvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.CharField())
    total_slots = serializers.IntegerField(required=False)
    available_slots = serializers.IntegerField(required=False)
    booked_slots = serializers.IntegerField(required=False)


class DoctorClinicInfoSerializer(serializers.Serializer):
    clinic_id = serializers.IntegerField()
    clinic_name = serializers.CharField()
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True)


class DoctorListSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    specialization = serializers.CharField()
    qualification = serializers.CharField()
    experience_years = serializers.IntegerField(allow_null=True)
    clinics = DoctorClinicInfoSerializer(many=True)


class DoctorDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    user_id = serializers.IntegerField()
    first_name = serializers.CharField()
    last_name = serializers.CharField()
    specialization = serializers.CharField()
    qualification = serializers.CharField()
    experience_years = serializers.IntegerField(allow_null=True)
    clinics = DoctorClinicInfoSerializer(many=True)


class AvailableSlotsSerializer(serializers.Serializer):
    date = serializers.DateField()
    slots = serializers.ListField(child=serializers.CharField())


class AppointmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    doctor_id = serializers.IntegerField()
    doctor_name = serializers.CharField()
    clinic_id = serializers.IntegerField()
    clinic_name = serializers.CharField()
    scheduled_time = serializers.DateTimeField()
    status = serializers.CharField()
    notes = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()


class PastAppointmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    doctor_id = serializers.IntegerField()
    doctor_name = serializers.CharField()
    clinic_id = serializers.IntegerField()
    clinic_name = serializers.CharField()
    scheduled_time = serializers.DateTimeField()
    status = serializers.CharField()
    notes = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField()
