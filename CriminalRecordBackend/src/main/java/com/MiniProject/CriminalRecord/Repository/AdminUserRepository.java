package com.MiniProject.CriminalRecord.Repository;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AdminUserRepository extends JpaRepository<AdminUser, Long> {

    Optional<AdminUser> findByUsername(String username);
    Optional<AdminUser> findByPoliceId(String policeId);
    boolean existsByUsername(String username);
    boolean existsByPoliceId(String policeId);
    boolean existsByAadharId(String aadharId);
    boolean existsByEmail(String email);
    List<AdminUser> findByStatus(String status);

}