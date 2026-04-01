package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.EncryptedFile;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import com.MiniProject.CriminalRecord.Repository.EncryptedFileRepository;
import com.MiniProject.CriminalRecord.Util.AESUtil;
import com.MiniProject.CriminalRecord.Util.RSAUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.crypto.SecretKey;
import java.nio.file.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ShareService {

    @Value("${app.storage.encrypted-files}")
    private String encryptedStoragePath;

    private final AdminUserRepository adminUserRepository;
    private final EncryptedFileRepository encryptedFileRepository;
    private final EncryptionService encryptionService;
    private final JavaMailSender mailSender;

    public EncryptedFile shareFile(String senderUsername,
                                   String receiverUsername,
                                   MultipartFile file) throws Exception {

        // Step 1: Get sender details
        AdminUser sender = adminUserRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Step 2: Get receiver details
        AdminUser receiver = adminUserRepository.findByUsername(receiverUsername)
                .orElse(null);

        // Step 3: Validate receiver exists
        if (receiver == null) {
            throw new RuntimeException("Receiver admin not found");
        }

        // Step 4: Validate receiver is ACTIVE
        // Cant send file to inactive/suspended admin
        if (!receiver.getStatus().equals("ACTIVE")) {
            throw new RuntimeException(
                    "Receiver admin is currently INACTIVE. Cannot share file."
            );
        }

        // Step 5: Cant send file to yourself
        if (sender.getId().equals(receiver.getId())) {
            throw new RuntimeException("Cannot share file with yourself");
        }

        // Step 6: Read file bytes
        byte[] fileBytes = file.getBytes();

        // Step 7: Generate fresh AES-256 key for this file
        SecretKey aesKey = AESUtil.generateAESKey();

        // Step 8: Encrypt file using AES key
        byte[] encryptedBytes = AESUtil.encryptFile(fileBytes, aesKey);

        // Step 9: Save encrypted file to storage
        String encryptedFileName = UUID.randomUUID() + "_" +
                file.getOriginalFilename() + ".enc";
        Path storagePath = Paths.get(encryptedStoragePath);
        if (!Files.exists(storagePath)) {
            Files.createDirectories(storagePath);
        }
        Path encryptedFilePath = storagePath.resolve(encryptedFileName);
        Files.write(encryptedFilePath, encryptedBytes);

        // Step 10: Encrypt AES key using RECEIVER's RSA public key
        // KEY POINT: Only receiver's private key can decrypt this!
        // Sender cannot decrypt this file
        String aesKeyStr = AESUtil.keyToString(aesKey);
        String encryptedAesKey = RSAUtil.encryptAESKey(
                aesKeyStr,
                receiver.getPublicKey() // Receiver's public key from DB
        );

        // Step 11: Save share record to DB
        EncryptedFile sharedFile = new EncryptedFile();
        sharedFile.setSender(sender);
        sharedFile.setReceiver(receiver);
        sharedFile.setOriginalFileName(file.getOriginalFilename());
        sharedFile.setEncryptedFilePath(encryptedFilePath.toString());
        sharedFile.setEncryptedAesKey(encryptedAesKey);
        sharedFile.setStatus("PENDING");
        EncryptedFile saved = encryptedFileRepository.save(sharedFile);

        // Step 12: Save history
        encryptionService.saveHistory(
                saved, sender,
                "SHARED",
                "File shared to " + receiver.getUsername() +
                        " at " + receiver.getPoliceStation()
        );

        // Step 13: Send email notification to receiver
        sendShareNotification(sender, receiver, saved);

        return saved;
    }

    // Email notification to receiver
    private void sendShareNotification(AdminUser sender,
                                       AdminUser receiver,
                                       EncryptedFile file) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(receiver.getEmail());
        message.setSubject("Police Records System - New File Received");
        message.setText(
                "Dear " + receiver.getUsername() + ",\n\n" +
                        "You have received a new encrypted file from:\n" +
                        "Station : " + sender.getPoliceStation() + "\n" +
                        "Admin   : " + sender.getUsername() + "\n" +
                        "File    : " + file.getOriginalFileName() + "\n" +
                        "File ID : " + file.getId() + "\n\n" +
                        "Login to Police Records System to download the file.\n" +
                        "You will need to complete MFA verification to decrypt.\n\n" +
                        "Note: File will be deleted after download.\n\n" +
                        "Police Records Security System"
        );
        mailSender.send(message);
    }

    // Get all files received by this admin
    public List<EncryptedFile> getReceivedFiles(String username) {
        AdminUser receiver = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return encryptedFileRepository.findByReceiver(receiver);
    }

    // Get pending files only
    public List<EncryptedFile> getPendingFiles(String username) {
        AdminUser receiver = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return encryptedFileRepository.findByReceiverAndStatus(receiver, "PENDING");
    }

    // Get all active admins except current
    // For React dropdown to select receiver
    public List<AdminUser> getActiveAdmins(String currentUsername) {
        return adminUserRepository.findByStatus("ACTIVE")
                .stream()
                .filter(a -> !a.getUsername().equals(currentUsername))
                .toList();
    }
}