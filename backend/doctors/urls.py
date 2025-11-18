
# doctors/urls.py
from django.urls import path
from .views import (
    DoctorClinicListView,
    DoctorClinicAddView,
    DoctorAvailabilityCreateView,
    DoctorMyAppointmentsView,
    DoctorPastAppointmentsView,
)

urlpatterns = [
    path('my-clinics/', DoctorClinicListView.as_view(), name='doctor-my-clinics'),
    path('add-clinic/', DoctorClinicAddView.as_view(), name='doctor-add-clinic'),
    path('add-availability/', DoctorAvailabilityCreateView.as_view(), name='doctor-add-availability'),
    path('my-appointments/', DoctorMyAppointmentsView.as_view(), name='doctor-my-appointments'),
    path('past-appointments/', DoctorPastAppointmentsView.as_view(), name='doctor-past-appointments'),
]