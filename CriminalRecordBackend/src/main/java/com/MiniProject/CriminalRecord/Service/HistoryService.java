package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.FileHistory;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import com.MiniProject.CriminalRecord.Repository.FileHistoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class HistoryService {

    private final FileHistoryRepository fileHistoryRepository;
    private final AdminUserRepository adminUserRepository;

    // Get all history for logged in admin
    // Newest first
    public List<FileHistory> getMyHistory(String username) {
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        return fileHistoryRepository
                .findByPerformedByOrderByTimestampDesc(admin);
    }
}