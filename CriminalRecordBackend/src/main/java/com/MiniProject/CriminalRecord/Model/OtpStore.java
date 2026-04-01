package com.MiniProject.CriminalRecord.Model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "otp_store")
@Data
public class OtpStore {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which admin requested this OTP
    @ManyToOne
    @JoinColumn(name = "admin_id")
    private AdminUser admin;

    // 6 digit OTP code
    private String otpCode;

    // OTP invalid after this time
    private LocalDateTime expiryTime;

    // Once verified mark as used
    // So same OTP cant be reused
    private boolean used = false;

    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
        // 5 minutes expiry
        this.expiryTime = LocalDateTime.now().plusMinutes(5);
    }

}
