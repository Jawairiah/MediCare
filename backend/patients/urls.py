# patients/urls.py
from django.urls import path
from .views import (
    PatientProfileView,
    PatientDoctorListView,
    PatientDoctorDetailView,
    PatientDoctorAvailabilityView,
    PatientBookAppointmentView,
    PatientMyAppointmentsView,
    PatientPastAppointmentsView,
    PatientCancelAppointmentView,
)

urlpatterns = [
    # Profile management
    path('profile/', PatientProfileView.as_view(), name='patient-profile'),
    
    # Doctor browsing
    path('doctors/', PatientDoctorListView.as_view(), name='patient-doctor-list'),
    path('doctors/<int:pk>/', PatientDoctorDetailView.as_view(), name='patient-doctor-detail'),
    path('doctor-availability/', PatientDoctorAvailabilityView.as_view(), name='patient-doctor-availability'),
    
    # Appointment management
    path('book-appointment/', PatientBookAppointmentView.as_view(), name='patient-book-appointment'),
    path('my-appointments/', PatientMyAppointmentsView.as_view(), name='patient-my-appointments'),
    path('past-appointments/', PatientPastAppointmentsView.as_view(), name='patient-past-appointments'),
    path('cancel-appointment/<int:appointment_id>/', PatientCancelAppointmentView.as_view(), name='patient-cancel-appointment'),
]