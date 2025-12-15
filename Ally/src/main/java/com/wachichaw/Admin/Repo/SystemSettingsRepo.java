package com.wachichaw.Admin.Repo;

import com.wachichaw.Admin.Entity.SystemSettingsEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingsRepo extends JpaRepository<SystemSettingsEntity, Integer> {
}