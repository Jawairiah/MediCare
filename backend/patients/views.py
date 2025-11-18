# patients/views.py
from django.db import connection
from rest_framework.response import Response
from rest_framework import permissions
from rest_framework.views import APIView
from datetime import datetime, timedelta, date
from patients.serializers import (
    DoctorListSerializer,
    DoctorDetailSerializer,
    AppointmentSerializer
)


def dictfetchall(cursor):
    """Return all rows from a cursor as a dict"""
    columns = [col[0] for col in cursor.description]
    return [dict(zip(columns, row)) for row in cursor.fetchall()]


def dictfetchone(cursor):
    """Return one row from a cursor as a dict"""
    row = cursor.fetchone()
    if row is None:
        return None
    columns = [col[0] for col in cursor.description]
    return dict(zip(columns, row))


class PatientDoctorListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        clinic_id = request.query_params.get("clinic_id")
        specialization = request.query_params.get("specialization")
        name = request.query_params.get("name")

        with connection.cursor() as cursor:
            # Build dynamic SQL query
            sql = """
                SELECT DISTINCT
                    dp.id,
                    dp.user_id,
                    u.first_name,
                    u.last_name,
                    dp.specialization,
                    dp.qualification,
                    dp.experience_years
                FROM doctors_doctorprofile dp
                INNER JOIN users_user u ON dp.user_id = u.id
                WHERE 1=1
            """
            params = []

            if clinic_id:
                sql += " AND EXISTS (SELECT 1 FROM doctors_doctorclinic dc WHERE dc.doctor_id = dp.id AND dc.clinic_id = %s)"
                params.append(clinic_id)

            if specialization:
                sql += " AND dp.specialization ILIKE %s"
                params.append(f"%{specialization}%")

            if name:
                sql += " AND (u.first_name ILIKE %s OR u.last_name ILIKE %s)"
                params.extend([f"%{name}%", f"%{name}%"])

            sql += " ORDER BY u.first_name, u.last_name"

            cursor.execute(sql, params)
            doctors = dictfetchall(cursor)

            # For each doctor, get their clinics
            for doctor in doctors:
                cursor.execute("""
                    SELECT 
                        dc.clinic_id,
                        c.name as clinic_name,
                        dc.consultation_fee
                    FROM doctors_doctorclinic dc
                    INNER JOIN clinic_clinic c ON dc.clinic_id = c.id
                    WHERE dc.doctor_id = %s
                """, [doctor['id']])
                
                doctor['clinics'] = dictfetchall(cursor)

        serializer = DoctorListSerializer(doctors, many=True)
        return Response(serializer.data)


class PatientDoctorDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        with connection.cursor() as cursor:
            # Get doctor details
            cursor.execute("""
                SELECT 
                    dp.id,
                    dp.user_id,
                    u.first_name,
                    u.last_name,
                    dp.specialization,
                    dp.qualification,
                    dp.experience_years
                FROM doctors_doctorprofile dp
                INNER JOIN users_user u ON dp.user_id = u.id
                WHERE dp.id = %s
            """, [pk])

            doctor = dictfetchone(cursor)
            if not doctor:
                return Response({"detail": "Doctor not found."}, status=404)

            # Get clinics
            cursor.execute("""
                SELECT 
                    dc.clinic_id,
                    c.name as clinic_name,
                    dc.consultation_fee
                FROM doctors_doctorclinic dc
                INNER JOIN clinic_clinic c ON dc.clinic_id = c.id
                WHERE dc.doctor_id = %s
            """, [doctor['id']])
            
            doctor['clinics'] = dictfetchall(cursor)

        serializer = DoctorDetailSerializer(doctor)
        return Response(serializer.data)


class PatientDoctorAvailabilityView(APIView):
    """Get available time slots for a doctor at a clinic on a specific date"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        doctor_id = request.query_params.get("doctor_id")
        clinic_id = request.query_params.get("clinic_id")
        date_str = request.query_params.get("date")

        if not doctor_id or not clinic_id or not date_str:
            return Response({"error": "doctor_id, clinic_id, and date are required."}, status=400)

        # Validate date
        try:
            availability_date = datetime.strptime(date_str, "%Y-%m-%d").date()
        except ValueError:
            return Response({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

        # Cannot check past dates
        if availability_date < date.today():
            return Response({
                "date": date_str,
                "slots": [],
                "message": "Cannot book appointments in the past"
            })

        with connection.cursor() as cursor:

            # Validate doctor-clinic relation
            cursor.execute("""
                SELECT id FROM doctors_doctorclinic
                WHERE doctor_id = %s AND clinic_id = %s
            """, [doctor_id, clinic_id])

            row = cursor.fetchone()
            if not row:
                return Response({"error": "Invalid doctor-clinic relationship."}, status=404)

            doctor_clinic_id = row[0]

            # Fetch availability
            cursor.execute("""
                SELECT 
                    date, start_time, end_time, slot_duration
                FROM doctors_doctoravailability
                WHERE doctor_clinic_id = %s 
                  AND date = %s 
                  AND is_available = TRUE
            """, [doctor_clinic_id, availability_date])

            availability = dictfetchone(cursor)
            if not availability:
                return Response({"date": date_str, "slots": [], "message": "No availability set for this date"})

            # Build time slots
            start_dt = datetime.combine(availability['date'], availability['start_time'])
            end_dt = datetime.combine(availability['date'], availability['end_time'])
            delta = timedelta(minutes=availability['slot_duration'])

            all_slots = []
            current = start_dt
            now = datetime.now()

            while current < end_dt:
                if availability_date == date.today():
                    if current > now:
                        all_slots.append(current.strftime("%H:%M"))
                else:
                    all_slots.append(current.strftime("%H:%M"))

                current += delta

            # -------------------------
            # Get booked slots correctly
            # -------------------------
            cursor.execute("""
                SELECT scheduled_time::time
                FROM appointments_appointment
                WHERE doctor_id = %s
                  AND clinic_id = %s
                  AND DATE(scheduled_time) = %s
                  AND status IN ('booked', 'rescheduled')
            """, [doctor_id, clinic_id, availability_date])

            booked_rows = cursor.fetchall()
            booked_set = {r[0].strftime("%H:%M") for r in booked_rows}

            # Filter free slots
            free_slots = [slot for slot in all_slots if slot not in booked_set]

        return Response({
            "date": date_str,
            "slots": free_slots,
            "total_slots": len(all_slots),
            "available_slots": len(free_slots),
            "booked_slots": len(booked_set)
        })


class PatientBookAppointmentView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        doctor_id = request.data.get("doctor_id")
        clinic_id = request.data.get("clinic_id")
        scheduled_time_str = request.data.get("scheduled_time")
        notes = request.data.get("notes", "")

        if not (doctor_id and clinic_id and scheduled_time_str):
            return Response({"error": "Missing parameters."}, status=400)

        try:
            scheduled_time = datetime.strptime(scheduled_time_str, "%Y-%m-%dT%H:%M")
        except ValueError:
            return Response({"error": "scheduled_time must be in YYYY-MM-DDTHH:MM format."}, status=400)

        # VALIDATION: Cannot book appointments in the past
        if scheduled_time < datetime.now():
            return Response({
                "error": "Cannot book appointments in the past"
            }, status=400)

        user = request.user

        with connection.cursor() as cursor:
            # Get patient profile
            cursor.execute("""
                SELECT id FROM patients_patientprofile 
                WHERE user_id = %s
            """, [user.id])

            patient_row = cursor.fetchone()
            if not patient_row:
                return Response({"error": "User is not a patient."}, status=400)

            patient_id = patient_row[0]

            # Validate doctor_clinic relationship
            cursor.execute("""
                SELECT id FROM doctors_doctorclinic
                WHERE doctor_id = %s AND clinic_id = %s
            """, [doctor_id, clinic_id])

            dc_row = cursor.fetchone()
            if not dc_row:
                return Response({"error": "Doctor is not registered at this clinic."}, status=404)

            doctor_clinic_id = dc_row[0]

            # Validate availability exists for that date
            cursor.execute("""
                SELECT start_time, end_time, slot_duration
                FROM doctors_doctoravailability
                WHERE doctor_clinic_id = %s 
                  AND date = %s 
                  AND is_available = TRUE
            """, [doctor_clinic_id, scheduled_time.date()])

            availability = dictfetchone(cursor)
            if not availability:
                return Response({"error": "Doctor is not available on this date."}, status=400)

            # Check if scheduled_time is within availability window
            start_dt = datetime.combine(scheduled_time.date(), availability['start_time'])
            end_dt = datetime.combine(scheduled_time.date(), availability['end_time'])

            if not (start_dt <= scheduled_time < end_dt):
                return Response({"error": "Scheduled time is outside doctor's availability window."}, status=400)

            # Check slot alignment
            diff_minutes = int((scheduled_time - start_dt).total_seconds() / 60)
            if diff_minutes % availability['slot_duration'] != 0:
                return Response({"error": "Scheduled time does not align with slot duration."}, status=400)

            # Check if slot already booked
            cursor.execute("""
                SELECT id FROM appointments_appointment
                WHERE doctor_id = %s 
                  AND clinic_id = %s 
                  AND scheduled_time = %s
                  AND status IN ('booked', 'rescheduled')
            """, [doctor_id, clinic_id, scheduled_time])

            if cursor.fetchone():
                return Response({"error": "This slot is already booked."}, status=409)

            # Create the appointment
            cursor.execute("""
                INSERT INTO appointments_appointment 
                (doctor_id, clinic_id, patient_id, scheduled_time, status, notes, created_at)
                VALUES (%s, %s, %s, %s, 'booked', %s, NOW())
                RETURNING id
            """, [doctor_id, clinic_id, patient_id, scheduled_time, notes])

            appointment_id = cursor.fetchone()[0]

        return Response({
            "message": "Appointment booked successfully.",
            "appointment": {
                "id": appointment_id,
                "doctor": doctor_id,
                "clinic": clinic_id,
                "patient": patient_id,
                "scheduled_time": scheduled_time.strftime("%Y-%m-%dT%H:%M"),
                "status": "booked",
                "notes": notes
            }
        }, status=201)


class PatientMyAppointmentsView(APIView):
    """View all upcoming appointments for the patient"""
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        with connection.cursor() as cursor:
            # Get patient profile
            cursor.execute("""
                SELECT id FROM patients_patientprofile 
                WHERE user_id = %s
            """, [user.id])

            patient_row = cursor.fetchone()
            if not patient_row:
                return Response({"detail": "User is not a patient."}, status=400)

            patient_id = patient_row[0]

            # Get all upcoming appointments
            cursor.execute("""
                SELECT 
                    a.id,
                    a.doctor_id,
                    CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
                    a.clinic_id,
                    c.name as clinic_name,
                    a.scheduled_time,
                    a.status,
                    a.notes,
                    a.created_at
                FROM appointments_appointment a
                INNER JOIN doctors_doctorprofile dp ON a.doctor_id = dp.id
                INNER JOIN users_user u ON dp.user_id = u.id
                INNER JOIN clinic_clinic c ON a.clinic_id = c.id
                WHERE a.patient_id = %s
                  AND a.scheduled_time >= NOW()
                  AND a.status != 'cancelled'
                ORDER BY a.scheduled_time ASC
            """, [patient_id])

            appointments = dictfetchall(cursor)

        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)


# class PatientPastAppointmentsView(APIView):
#     """View all past appointments for the patient"""
#     permission_classes = [permissions.IsAuthenticated]

#     def get(self, request):
#         user = request.user

#         with connection.cursor() as cursor:
#             # Get patient profile
#             cursor.execute("""
#                 SELECT id FROM patients_patientprofile 
#                 WHERE user_id = %s
#             """, [user.id])

#             patient_row = cursor.fetchone()
#             if not patient_row:
#                 return Response({"detail": "User is not a patient."}, status=400)

#             patient_id = patient_row[0]

#             # Get all past appointments
#             cursor.execute("""
#                 SELECT 
#                     pa.id,
#                     pa.doctor_id,
#                     CONCAT(u.first_name, ' ', u.last_name) as doctor_name,
#                     pa.clinic_id,
#                     c.name as clinic_name,
#                     pa.scheduled_time,
#                     pa.status,
#                     pa.notes,
#                     pa.created_at,
#                     pa.completed_at
#                 FROM appointments_pastappointment pa
#                 INNER JOIN doctors_doctorprofile dp ON pa.doctor_id = dp.id
#                 INNER JOIN users_user u ON dp.user_id = u.id
#                 INNER JOIN clinic_clinic c ON pa.clinic_id = c.id
#                 WHERE pa.patient_id = %s
#                 ORDER BY pa.scheduled_time DESC
#             """, [patient_id])

#             past_appointments = dictfetchall(cursor)

#         serializer = PastAppointmentSerializer(past_appointments, many=True)
#         return Response(serializer.data)


class PatientCancelAppointmentView(APIView):
    """Cancel an upcoming appointment"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, appointment_id):
        user = request.user

        with connection.cursor() as cursor:
            # Get patient profile
            cursor.execute("""
                SELECT id FROM patients_patientprofile 
                WHERE user_id = %s
            """, [user.id])

            patient_row = cursor.fetchone()
            if not patient_row:
                return Response({"error": "User is not a patient."}, status=400)

            patient_id = patient_row[0]

            # Check if appointment exists and belongs to this patient
            cursor.execute("""
                SELECT id, status, scheduled_time 
                FROM appointments_appointment
                WHERE id = %s AND patient_id = %s
            """, [appointment_id, patient_id])

            appointment = dictfetchone(cursor)
            if not appointment:
                return Response({"error": "Appointment not found or does not belong to you."}, status=404)

            if appointment['status'] == 'cancelled':
                return Response({"error": "Appointment is already cancelled."}, status=400)

            if appointment['scheduled_time'] < datetime.now():
                return Response({"error": "Cannot cancel past appointments."}, status=400)

            # Update appointment status to cancelled
            cursor.execute("""
                UPDATE appointments_appointment
                SET status = 'cancelled'
                WHERE id = %s
            """, [appointment_id])

        return Response({
            "message": "Appointment cancelled successfully.",
            "appointment_id": appointment_id
        })