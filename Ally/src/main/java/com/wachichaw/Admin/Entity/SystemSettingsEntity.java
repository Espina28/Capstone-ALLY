package com.wachichaw.Admin.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "system_settings")
public class SystemSettingsEntity {

    @Id
    private Integer id;

    private boolean enableEmailVerification = true;
    private boolean enableAppointmentReminders = false;

    // Default constructor
    public SystemSettingsEntity() {
    }

    // Constructor for initialization
    public SystemSettingsEntity(Integer id, boolean enableEmailVerification, boolean enableAppointmentReminders) {
        this.id = id;
        this.enableEmailVerification = enableEmailVerification;
        this.enableAppointmentReminders = enableAppointmentReminders;
    }

    // Getters and Setters
    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public boolean isEnableEmailVerification() {
        return enableEmailVerification;
    }

    public void setEnableEmailVerification(boolean enableEmailVerification) {
        this.enableEmailVerification = enableEmailVerification;
    }

    public boolean isEnableAppointmentReminders() {
        return enableAppointmentReminders;
    }

    public void setEnableAppointmentReminders(boolean enableAppointmentReminders) {
        this.enableAppointmentReminders = enableAppointmentReminders;
    }
}