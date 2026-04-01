package com.MiniProject.CriminalRecord.Repository;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.FileHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FileHistoryRepository extends JpaRepository<FileHistory, Long> {
    // Get all history for one admin newest first
    List<FileHistory> findByPerformedByOrderByTimestampDesc(AdminUser admin);
}