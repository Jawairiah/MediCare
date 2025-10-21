# doctors/models.py
from django.db import models
from users.models import User

class DoctorProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    clinic_name = models.CharField(max_length=255, blank=True)
    specialization = models.CharField(max_length=255, blank=True)
    qualification = models.CharField(max_length=255, blank=True)
    experience_years = models.IntegerField(null=True, blank=True)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability_rules = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"
