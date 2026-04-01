package com.MiniProject.CriminalRecord.Model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "encrypted_files")
@Data
public class EncryptedFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Admin who sent this file
    @ManyToOne
    @JoinColumn(name = "sender_id")
    private AdminUser sender;

    // Admin who should receive this file
    @ManyToOne
    @JoinColumn(name = "receiver_id")
    private AdminUser receiver;

    // Original file name shown in UI
    private String originalFileName;

    // Full path where encrypted file is saved in server
    private String encryptedFilePath;

    // AES key encrypted with receiver RSA public key
    // Only receiver's private key can decrypt this
    @Column(columnDefinition = "TEXT")
    private String encryptedAesKey;

    // PENDING → receiver not yet downloaded
    // DOWNLOADED → receiver downloaded
    // DELETED → file removed from server after download
    @Column(nullable = false)
    private String status = "PENDING";

    private LocalDateTime createdAt;

    private LocalDateTime downloadedAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

}