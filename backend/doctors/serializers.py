# doctors/serializers.py
from rest_framework import serializers


class DoctorProfileSerializer(serializers.Serializer):
    """Serializer for doctor profile view/edit"""
    id = serializers.IntegerField(read_only=True)
    user_id = serializers.IntegerField(read_only=True)
    email = serializers.EmailField()
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    specialization = serializers.CharField(max_length=255, allow_blank=True)
    qualification = serializers.CharField(max_length=255, allow_blank=True)
    experience_years = serializers.IntegerField(allow_null=True, required=False)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)
    
    
class DoctorAvailabilitySerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    doctor_clinic_id = serializers.IntegerField()
    date = serializers.DateField()
    start_time = serializers.TimeField()
    end_time = serializers.TimeField()
    slot_duration = serializers.IntegerField()


class ClinicSimpleSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    name = serializers.CharField()
    address = serializers.CharField()
    phone = serializers.CharField()
    email = serializers.EmailField(required=False)


class DoctorClinicSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True)
    clinic_id = serializers.IntegerField()
    clinic_name = serializers.CharField(read_only=True)
    clinic_address = serializers.CharField(read_only=True)
    clinic_phone = serializers.CharField(read_only=True)
    clinic_email = serializers.EmailField(read_only=True, required=False)
    consultation_fee = serializers.DecimalField(max_digits=10, decimal_places=2, allow_null=True, required=False)
    created_at = serializers.DateTimeField(read_only=True)


class DoctorAppointmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    patient_id = serializers.IntegerField()
    patient_name = serializers.CharField()
    clinic_id = serializers.IntegerField()
    clinic_name = serializers.CharField()
    scheduled_time = serializers.DateTimeField()
    status = serializers.CharField()
    notes = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()


class DoctorPastAppointmentSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    patient_id = serializers.IntegerField()
    patient_name = serializers.CharField()
    clinic_id = serializers.IntegerField()
    clinic_name = serializers.CharField()
    scheduled_time = serializers.DateTimeField()
    status = serializers.CharField()
    notes = serializers.CharField(allow_blank=True)
    created_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField()