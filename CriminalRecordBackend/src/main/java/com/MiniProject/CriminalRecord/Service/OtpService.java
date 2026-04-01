package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.OtpStore;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import com.MiniProject.CriminalRecord.Repository.OtpStoreRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpStoreRepository otpStoreRepository;
    private final AdminUserRepository adminUserRepository;
    private final JavaMailSender mailSender;

    // Generate 6 digit OTP and send to email
    public void generateAndSendOtp(String username) {

        // Step 1: Find admin
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Step 2: Generate random 6 digit OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Step 3: Save OTP to DB
        OtpStore otpStore = new OtpStore();
        otpStore.setAdmin(admin);
        otpStore.setOtpCode(otp);
        otpStore.setUsed(false);
        // expiry time set in @PrePersist - 5 minutes
        otpStoreRepository.save(otpStore);

        // Step 4: Send OTP email
        sendOtpEmail(admin.getEmail(), otp, admin.getUsername());
    }

    // Send email using Spring Mail
    private void sendOtpEmail(String toEmail, String otp, String username) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject("Police Records System - OTP Verification");
        message.setText(
                "Dear " + username + ",\n\n" +
                        "Your OTP for login verification is: " + otp + "\n\n" +
                        "This OTP is valid for 5 minutes only.\n" +
                        "Do not share this OTP with anyone.\n\n" +
                        "Police Records Security System"
        );
        mailSender.send(message);
    }

    // Verify OTP entered by admin
    public boolean verifyOtp(String username, String enteredOtp) {

        // Step 1: Find admin
        AdminUser admin = adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // Step 2: Get latest unused OTP for this admin
        OtpStore otpStore = otpStoreRepository
                .findTopByAdminAndUsedFalseOrderByCreatedAtDesc(admin)
                .orElse(null);

        // No OTP found
        if (otpStore == null) {
            throw new RuntimeException("No OTP found. Please request a new OTP");
        }

        // Step 3: Check if OTP expired
        if (LocalDateTime.now().isAfter(otpStore.getExpiryTime())) {
            throw new RuntimeException("OTP expired. Please request a new OTP");
        }

        // Step 4: Check if OTP matches
        if (!otpStore.getOtpCode().equals(enteredOtp)) {
            throw new RuntimeException("Invalid OTP entered");
        }

        // Step 5: Mark OTP as used so it cant be reused
        otpStore.setUsed(true);
        otpStoreRepository.save(otpStore);

        return true;
    }
}
