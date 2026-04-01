package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.EncryptedFile;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import com.MiniProject.CriminalRecord.Repository.EncryptedFileRepository;
import com.MiniProject.CriminalRecord.Repository.FileHistoryRepository;
import com.MiniProject.CriminalRecord.Util.AESUtil;
import com.MiniProject.CriminalRecord.Util.RSAUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.file.*;

@Service
@RequiredArgsConstructor
public class DecryptionService {

    private final AdminUserRepository adminUserRepository;
    private final EncryptedFileRepository encryptedFileRepository;
    private final FileHistoryRepository fileHistoryRepository;
    private final KeyService keyService;
    private final EncryptionService encryptionService;

    public byte[] decryptFile(String username, Long fileId) throws Exception {

        // Step 1: Get admin
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Step 2: Get encrypted file record from DB
        EncryptedFile encryptedFile = encryptedFileRepository.findById(fileId)
                .orElseThrow(() -> new RuntimeException("File not found"));
        // Step 3: Security check
        // Only the receiver can decrypt the file
        if (!encryptedFile.getReceiver().getId().equals(admin.getId())) {
            throw new RuntimeException("Access denied. This file is not for you.");
        }

        // Step 4: Check file status
        if (encryptedFile.getStatus().equals("DELETED")) {
            throw new RuntimeException("File already downloaded and deleted from server");
        }

        // Step 5: Read encrypted file bytes from storage
        Path encryptedFilePath = Paths.get(encryptedFile.getEncryptedFilePath());
        if (!Files.exists(encryptedFilePath)) {
            throw new RuntimeException("Encrypted file not found on server");
        }
        byte[] encryptedBytes = Files.readAllBytes(encryptedFilePath);

        // Step 6: Get admin's RSA private key from file system
        // C:/police-storage/private-keys/1_private.key
        String privateKeyStr = keyService.getPrivateKey(admin.getId());

        // Step 7: Decrypt AES key using RSA private key
        String encryptedAesKey = encryptedFile.getEncryptedAesKey();
        String decryptedAesKeyStr = RSAUtil.decryptAESKey(encryptedAesKey, privateKeyStr);

        // Step 8: Convert AES key string back to SecretKey object
        SecretKey aesKey = AESUtil.stringToKey(decryptedAesKeyStr);

        // Step 9: Decrypt the actual file using AES key
        byte[] decryptedBytes = AESUtil.decryptFile(encryptedBytes, aesKey);

        // Step 10: Delete encrypted file from server after decryption
        Files.delete(encryptedFilePath);

        // Step 11: Update status in DB to DELETED
        encryptedFile.setStatus("DELETED");
        encryptedFile.setDownloadedAt(java.time.LocalDateTime.now());
        encryptedFileRepository.save(encryptedFile);

        // Step 12: Save history
        encryptionService.saveHistory(
                encryptedFile, admin,
                "DECRYPTED",
                "File decrypted and downloaded: " + encryptedFile.getOriginalFileName()
        );

        return decryptedBytes;
    }
}