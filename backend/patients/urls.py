from django.urls import path
from .views import (
    PatientDoctorListView,
    PatientDoctorDetailView,
    PatientDoctorAvailabilityView,
    PatientBookAppointmentView,
    PatientMyAppointmentsView,
    PatientCancelAppointmentView,
)

urlpatterns = [
    path('doctors/', PatientDoctorListView.as_view(), name='patient-doctor-list'),
    path('doctors/<int:pk>/', PatientDoctorDetailView.as_view(), name='patient-doctor-detail'),
    path('doctor-availability/', PatientDoctorAvailabilityView.as_view(), name='patient-doctor-availability'),
    path('book-appointment/', PatientBookAppointmentView.as_view(), name='patient-book-appointment'),
    path('my-appointments/', PatientMyAppointmentsView.as_view(), name='patient-my-appointments'),
    path('cancel-appointment/<int:appointment_id>/', PatientCancelAppointmentView.as_view(), name='patient-cancel-appointment'),
]
