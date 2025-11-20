# doctors/urls.py
from django.urls import path
from .views import (
    DoctorProfileView,
    DoctorClinicListView,
    DoctorClinicAddView,
    DoctorClinicRemoveView,
    DoctorAvailabilityCreateView,
    DoctorMyAppointmentsView,
    DoctorPastAppointmentsView,
)

urlpatterns = [
    # Profile management
    path('profile/', DoctorProfileView.as_view(), name='doctor-profile'),
    
    # Clinic management
    path('my-clinics/', DoctorClinicListView.as_view(), name='doctor-my-clinics'),
    path('add-clinic/', DoctorClinicAddView.as_view(), name='doctor-add-clinic'),
    path('remove-clinic/<int:clinic_id>/', DoctorClinicRemoveView.as_view(), name='doctor-remove-clinic'),
    
    # Availability management
    path('add-availability/', DoctorAvailabilityCreateView.as_view(), name='doctor-add-availability'),
    
    # Appointments
    path('my-appointments/', DoctorMyAppointmentsView.as_view(), name='doctor-my-appointments'),
    path('past-appointments/', DoctorPastAppointmentsView.as_view(), name='doctor-past-appointments'),
]