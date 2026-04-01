package com.MiniProject.CriminalRecord.Repository;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.OtpStore;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpStoreRepository extends JpaRepository<OtpStore, Long> {
    // Get latest unused OTP for this admin
    Optional<OtpStore> findTopByAdminAndUsedFalseOrderByCreatedAtDesc(AdminUser admin);
}
