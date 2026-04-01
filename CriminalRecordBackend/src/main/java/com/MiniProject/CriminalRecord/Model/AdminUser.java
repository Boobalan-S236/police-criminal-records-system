package com.MiniProject.CriminalRecord.Model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "admin_users")
@Data
public class AdminUser {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Unique login username
    @Column(unique = true, nullable = false)
    private String username;

    // Which police station this admin belongs to
    @Column(nullable = false)
    private String policeStation;

    // Official police ID card number
    @Column(unique = true, nullable = false)
    private String policeId;

    // Aadhar number for identity
    @Column(unique = true, nullable = false)
    private String aadharId;

    // BCrypt hashed password - never plain text
    @Column(nullable = false)
    private String password;

    // Email for OTP sending
    @Column(unique = true, nullable = false)
    private String email;

    // RSA public key stored in DB as text
    // Used by others to encrypt files for this admin
    @Column(columnDefinition = "TEXT")
    private String publicKey;

    // Face image stored path for MFA face detection
    private String faceImagePath;

    // ACTIVE or INACTIVE
    // Sender checks this before sharing file
    @Column(nullable = false)
    private String status = "ACTIVE";

    private LocalDateTime createdAt;

    // Auto set createdAt before saving to DB
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

}
