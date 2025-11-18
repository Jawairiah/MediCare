# doctors/serializers.py
from .models import DoctorClinic,DoctorAvailability
from rest_framework import serializers
from clinic.models import Clinic

class DoctorAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = DoctorAvailability
        fields = ['id', 'doctor_clinic', 'date', 'start_time', 'end_time', 'slot_duration']



class ClinicSimpleSerializer(serializers.ModelSerializer):
    """Lightweight serializer to show clinic details within doctor views"""
    class Meta:
        model = Clinic
        fields = ['id', 'name', 'address', 'phone']


class DoctorClinicSerializer(serializers.ModelSerializer):
    """Serializer for doctor-clinic relationships"""
    clinic = ClinicSimpleSerializer(read_only=True)
    clinic_id = serializers.PrimaryKeyRelatedField(
        queryset=Clinic.objects.all(), write_only=True,required=False, source='clinic'
    )

    class Meta:
        model = DoctorClinic
        fields = [
            'id',
            'clinic',         # nested read-only details
            'clinic_id',      # used when creating or updating
            'consultation_fee',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        """Ensure no duplicate doctor-clinic pair is created"""
        doctor = self.context['request'].user.doctorprofile
        clinic = validated_data['clinic']
        consultation_fee = validated_data.get('consultation_fee')

        obj, created = DoctorClinic.objects.get_or_create(
            doctor=doctor,
            clinic=clinic,
            defaults={'consultation_fee': consultation_fee},
        )
        if not created and consultation_fee:
            obj.consultation_fee = consultation_fee
            obj.save()
        return obj

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