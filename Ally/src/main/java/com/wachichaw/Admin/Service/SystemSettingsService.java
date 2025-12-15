package com.wachichaw.Admin.Service;

import com.wachichaw.Admin.Entity.SystemSettingsEntity;
import com.wachichaw.Admin.Repo.SystemSettingsRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class SystemSettingsService {

    @Autowired
    private SystemSettingsRepo systemSettingsRepo;

    private static final Integer SETTINGS_ID = 1;

    public SystemSettingsEntity getSettings() {
        Optional<SystemSettingsEntity> settings = systemSettingsRepo.findById(SETTINGS_ID);
        if (settings.isPresent()) {
            return settings.get();
        } else {
            // Create default settings if not present
            SystemSettingsEntity defaultSettings = new SystemSettingsEntity(SETTINGS_ID, true, false);
            return systemSettingsRepo.save(defaultSettings);
        }
    }

    public SystemSettingsEntity updateSettings(SystemSettingsEntity updatedSettings) {
        SystemSettingsEntity settings = getSettings(); // Ensures settings exist
        settings.setEnableEmailVerification(updatedSettings.isEnableEmailVerification());
        settings.setEnableAppointmentReminders(updatedSettings.isEnableAppointmentReminders());
        return systemSettingsRepo.save(settings);
    }
}