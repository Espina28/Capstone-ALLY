package com.wachichaw.Schedule.Service;

import com.wachichaw.EmailConfig.Service.EmailService;
import com.wachichaw.Schedule.Entity.ScheduleEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


@Service
public class ReminderService {

    // Toggle flag to enable/disable appointment reminder emails
    public static boolean ENABLE_APPOINTMENT_REMINDERS = false;

    @Autowired
    private EmailService emailService;

    public void sendAppointmentReminders(ScheduleEntity schedule) {
        // Check if appointment reminders are enabled
        if (!ENABLE_APPOINTMENT_REMINDERS) {
            return; // Skip sending reminder emails if disabled
        }

        // Send reminder to client
        emailService.sendAppointmentReminder(
                schedule.getClient().getEmail(),
                schedule.getClient().getFname(),
                schedule.getBookingStartTime(),
                "client"
        );

        // Send reminder to lawyer
        emailService.sendAppointmentReminder(
                schedule.getLawyer().getEmail(),
                schedule.getLawyer().getFname(),
                schedule.getBookingStartTime(),
                "lawyer"
        );
    }
}
