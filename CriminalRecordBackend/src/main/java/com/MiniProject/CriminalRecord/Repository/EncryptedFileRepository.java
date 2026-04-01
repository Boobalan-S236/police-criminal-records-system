package com.MiniProject.CriminalRecord.Repository;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.EncryptedFile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EncryptedFileRepository extends JpaRepository<EncryptedFile, Long> {
    List<EncryptedFile> findByReceiver(AdminUser receiver);
    List<EncryptedFile> findBySender(AdminUser sender);
    List<EncryptedFile> findByReceiverAndStatus(AdminUser receiver, String status);
}