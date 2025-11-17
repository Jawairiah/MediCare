from django.shortcuts import render

# Create your views here.
from rest_framework import generics, permissions
from doctors.models import DoctorProfile
from .serializers import DoctorListSerializer,DoctorDetailSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from datetime import datetime, timedelta
from doctors.models import DoctorAvailability, DoctorClinic
from appointments.models import Appointment

class PatientDoctorListView(generics.ListAPIView):
    serializer_class = DoctorListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = DoctorProfile.objects.all()

        clinic_id = self.request.query_params.get("clinic_id")
        specialization = self.request.query_params.get("specialization")
        name = self.request.query_params.get("name")

        if clinic_id:
            queryset = queryset.filter(doctorclinic__clinic_id=clinic_id)

        if specialization:
            queryset = queryset.filter(specialization__icontains=specialization)

        if name:
            queryset = queryset.filter(
                user__first_name__icontains=name
            ) | queryset.filter(
                user__last_name__icontains=name
            )

        return queryset


class PatientDoctorDetailView(generics.RetrieveAPIView):
    serializer_class = DoctorDetailSerializer
    queryset = DoctorProfile.objects.all()
    permission_classes = [permissions.IsAuthenticated]





class PatientDoctorAvailabilityView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctor_id = request.query_params.get("doctor_id")
        clinic_id = request.query_params.get("clinic_id")
        date = request.query_params.get("date")

        if not doctor_id or not clinic_id or not date:
            return Response({"error": "doctor_id, clinic_id, and date are required."}, status=400)

        # Fetch doctor_clinic first
        try:
            doctor_clinic = DoctorClinic.objects.get(
                doctor_id=doctor_id,
                clinic_id=clinic_id
            )
        except DoctorClinic.DoesNotExist:
            return Response({"error": "Invalid doctor-clinic relationship."}, status=404)

        availability = DoctorAvailability.objects.filter(
            doctor_clinic=doctor_clinic,
            date=date,
            is_available=True
        ).first()

        if not availability:
            return Response({"date": date, "slots": []})  # No availability created

        # Generate time slots
        start_dt = datetime.combine(availability.date, availability.start_time)
        end_dt = datetime.combine(availability.date, availability.end_time)
        delta = timedelta(minutes=availability.slot_duration)

        all_slots = []
        current = start_dt
        while current < end_dt:
            all_slots.append(current.strftime("%H:%M"))
            current += delta

        # Remove booked slots
        booked_slots = Appointment.objects.filter(
            doctor_id=doctor_id,
            clinic_id=clinic_id,
            date=date
        ).values_list("start_time", flat=True)

        booked_set = {b.strftime("%H:%M") for b in booked_slots}
        free_slots = [slot for slot in all_slots if slot not in booked_set]

        return Response({
            "date": date,
            "slots": free_slots
        })


class PatientBookAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """
        Patient books an appointment with a doctor at a specific clinic and time.
        Expects JSON:
        {
            "doctor_id": int,
            "clinic_id": int,
            "scheduled_time": "YYYY-MM-DDTHH:MM",
            "notes": "optional notes"
        }
        """
        doctor_id = request.data.get("doctor_id")
        clinic_id = request.data.get("clinic_id")
        scheduled_time_str = request.data.get("scheduled_time")
        notes = request.data.get("notes", "")

        # Check for missing params
        if not (doctor_id and clinic_id and scheduled_time_str):
            return Response({"error": "Missing parameters."}, status=400)

        # Parse scheduled_time
        try:
            scheduled_time = datetime.strptime(scheduled_time_str, "%Y-%m-%dT%H:%M")
        except ValueError:
            return Response({"error": "scheduled_time must be in YYYY-MM-DDTHH:MM format."}, status=400)

        patient = request.user.patientprofile

        # Validate doctor_clinic relationship
        try:
            doctor_clinic = DoctorClinic.objects.get(
                doctor_id=doctor_id,
                clinic_id=clinic_id
            )
        except DoctorClinic.DoesNotExist:
            return Response({"error": "Doctor is not registered at this clinic."}, status=404)

        # Validate availability exists for that date
        availability = DoctorAvailability.objects.filter(
            doctor_clinic=doctor_clinic,
            date=scheduled_time.date(),
            is_available=True
        ).first()

        if not availability:
            return Response({"error": "Doctor is not available on this date."}, status=400)

        # Check if scheduled_time is within availability window
        start_dt = datetime.combine(availability.date, availability.start_time)
        end_dt = datetime.combine(availability.date, availability.end_time)

        if not (start_dt <= scheduled_time < end_dt):
            return Response({"error": "Scheduled time is outside doctor's availability window."}, status=400)

        # Check slot alignment with slot_duration
        diff_minutes = int((scheduled_time - start_dt).total_seconds() / 60)
        if diff_minutes % availability.slot_duration != 0:
            return Response({"error": "Scheduled time does not align with slot duration."}, status=400)

        # Check if slot already booked
        exists = Appointment.objects.filter(
            doctor_id=doctor_id,
            clinic_id=clinic_id,
            scheduled_time=scheduled_time
        ).exists()

        if exists:
            return Response({"error": "This slot is already booked."}, status=409)

        # Create the appointment
        appointment = Appointment.objects.create(
            doctor_id=doctor_id,
            clinic_id=clinic_id,
            patient=patient,
            scheduled_time=scheduled_time,
            notes=notes
        )

        return Response({
            "message": "Appointment booked successfully.",
            "appointment": {
                "id": appointment.id,
                "doctor": doctor_id,
                "clinic": clinic_id,
                "patient": patient.id,
                "scheduled_time": scheduled_time.strftime("%Y-%m-%dT%H:%M"),
                "status": appointment.status,
                "notes": notes
            }
        })