package com.wachichaw.Admin.Controller;

import com.wachichaw.Admin.Entity.SystemSettingsEntity;
import com.wachichaw.Admin.Service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/settings/system")
public class SystemSettingsController {

    @Autowired
    private SystemSettingsService systemSettingsService;

    @GetMapping
    public ResponseEntity<SystemSettingsEntity> getSettings() {
        return ResponseEntity.ok(systemSettingsService.getSettings());
    }

    @PutMapping
    public ResponseEntity<SystemSettingsEntity> updateSettings(@RequestBody SystemSettingsEntity settings) {
        return ResponseEntity.ok(systemSettingsService.updateSettings(settings));
    }
}