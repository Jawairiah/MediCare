# doctors/views.py
from clinic.models import Clinic
from rest_framework.response import Response
from rest_framework import status,serializers
from rest_framework import generics, permissions
from doctors.models import DoctorClinic,DoctorProfile
from doctors.serializers import DoctorClinicSerializer
from doctors.serializers import DoctorAvailabilitySerializer


class DoctorClinicListView(generics.ListAPIView):
    serializer_class = DoctorClinicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        try:
            doctor = user.doctorprofile
        except DoctorProfile.DoesNotExist:
            # Return empty queryset if user is not a doctor
            return DoctorClinic.objects.none()

        return DoctorClinic.objects.filter(doctor=doctor)



class DoctorClinicAddView(generics.CreateAPIView):
    serializer_class = DoctorClinicSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        clinic_id = request.data.get("clinic_id")
        fee = request.data.get("consultation_fee")

        try:
            clinic = Clinic.objects.get(id=clinic_id)
        except Clinic.DoesNotExist:
            return Response({"error": "Invalid clinic ID"}, status=status.HTTP_400_BAD_REQUEST)

        doctor = request.user.doctorprofile
        obj, created = DoctorClinic.objects.get_or_create(
            doctor=doctor,
            clinic=clinic,
            defaults={"consultation_fee": fee},
        )
        if not created:
            return Response({"message": "Doctor already associated with this clinic."}, status=status.HTTP_200_OK)

        return Response({"message": "Clinic added successfully."}, status=status.HTTP_201_CREATED)




class DoctorAvailabilityCreateView(generics.CreateAPIView):
    serializer_class = DoctorAvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        doctor_clinic = serializer.validated_data['doctor_clinic']
        if doctor_clinic.doctor != self.request.user.doctorprofile:
            raise serializers.ValidationError("You can only set availability for your own clinics.")
        serializer.save()
