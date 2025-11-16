# doctors/urls.py
from django.urls import path
from .views import DoctorClinicListView
from .views import DoctorClinicAddView
from .views import DoctorAvailabilityCreateView


urlpatterns = [
    path('my-clinics/', DoctorClinicListView.as_view(), name='doctor-my-clinics'),
    path('add-clinic/', DoctorClinicAddView.as_view(), name='doctor-add-clinic'),
    path('add-availability/', DoctorAvailabilityCreateView.as_view(), name='doctor-add-availability'),

]
