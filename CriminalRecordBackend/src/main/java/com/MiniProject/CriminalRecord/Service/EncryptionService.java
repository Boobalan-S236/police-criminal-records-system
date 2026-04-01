package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.EncryptedFile;
import com.MiniProject.CriminalRecord.Model.FileHistory;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import com.MiniProject.CriminalRecord.Repository.EncryptedFileRepository;
import com.MiniProject.CriminalRecord.Repository.FileHistoryRepository;
import com.MiniProject.CriminalRecord.Util.AESUtil;
import com.MiniProject.CriminalRecord.Util.RSAUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.SecretKey;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EncryptionService {

    @Value("${app.storage.encrypted-files}")
    private String encryptedStoragePath;

    private final AdminUserRepository adminUserRepository;
    private final EncryptedFileRepository encryptedFileRepository;
    private final FileHistoryRepository fileHistoryRepository;

    public EncryptedFile encryptFile(String username, MultipartFile file) throws Exception {

        // Step 1: Get admin details
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Step 2: Read file bytes
        byte[] fileBytes = file.getBytes();

        // Step 3: Generate fresh AES-256 key for this file
        SecretKey aesKey = AESUtil.generateAESKey();

        // Step 4: Encrypt the file using AES key
        byte[] encryptedBytes = AESUtil.encryptFile(fileBytes, aesKey);

        // Step 5: Save encrypted file to storage folder
        // Unique filename using UUID to avoid conflicts
        String encryptedFileName = UUID.randomUUID() + "_" +
                file.getOriginalFilename() + ".enc";
        Path storagePath = Paths.get(encryptedStoragePath);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
        }
        Path encryptedFilePath = storagePath.resolve(encryptedFileName);
        Files.write(encryptedFilePath, encryptedBytes);

        // Step 6: Encrypt AES key using admin's OWN RSA public key
        // So only this admin can decrypt it later
        String aesKeyStr = AESUtil.keyToString(aesKey);
        String encryptedAesKey = RSAUtil.encryptAESKey(aesKeyStr, admin.getPublicKey());

        // Step 7: Save record to DB
        EncryptedFile encryptedFile = new EncryptedFile();
        encryptedFile.setSender(admin);
        encryptedFile.setReceiver(admin); // Self encrypted
        encryptedFile.setOriginalFileName(file.getOriginalFilename());
        encryptedFile.setEncryptedFilePath(encryptedFilePath.toString());
        encryptedFile.setEncryptedAesKey(encryptedAesKey);
        encryptedFile.setStatus("ENCRYPTED");
        EncryptedFile saved = encryptedFileRepository.save(encryptedFile);

        // Step 8: Save history
        saveHistory(saved, admin, "ENCRYPTED",
                "File encrypted successfully: " + file.getOriginalFilename());

        return saved;
    }

    // Get all files encrypted by this admin
    public List<EncryptedFile> getMyEncryptedFiles(String username) {
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return encryptedFileRepository.findBySender(admin);
    }

    // Save action to history table
    public void saveHistory(EncryptedFile file, AdminUser admin,
                            String action, String description) {
        FileHistory history = new FileHistory();
        history.setEncryptedFile(file);
        history.setPerformedBy(admin);
        history.setAction(action);
        history.setDescription(description);
        fileHistoryRepository.save(history);
    }
}
