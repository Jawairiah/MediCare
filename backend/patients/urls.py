from django.urls import path
from .views import (PatientDoctorAvailabilityView,PatientBookAppointmentView)

urlpatterns = [
    path( "doctor-availability/", PatientDoctorAvailabilityView.as_view(),name="patient-doctor-availability"),

    path( "book-appointment/", PatientBookAppointmentView.as_view(),name="patient-book-appointment"),
]
