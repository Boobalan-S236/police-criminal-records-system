package com.MiniProject.CriminalRecord.Controller;

import com.MiniProject.CriminalRecord.Dto.*;
import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import com.MiniProject.CriminalRecord.Service.AdminService;
import com.MiniProject.CriminalRecord.Service.OtpService;
import com.MiniProject.CriminalRecord.Util.JwtUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final AdminService adminService;
    private final AdminUserRepository adminUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpService otpService;

    // POST /api/auth/signup
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse> signup(@Valid @RequestBody SignupRequest request) {
        try {
            AdminUser admin = adminService.signup(request);

            // Generate JWT token right after signup
            // So frontend can use it for face save
            String token = jwtUtil.generateToken(admin.getUsername());

            // Return both adminId and token
            Map<String, Object> responseData = new HashMap<>();
            responseData.put("adminId", admin.getId());
            responseData.put("token", token);

            return ResponseEntity.ok(
                    new ApiResponse(true, "Signup successful!", responseData)
            );
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Signup failed: " + e.getMessage()));
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AdminUser admin = adminUserRepository
                    .findByUsername(request.getUsername())
                    .orElse(null);

            if (admin == null) {
                return ResponseEntity.badRequest()
                        .body(new LoginResponse(false, "Invalid username or password"));
            }
            if (!admin.getStatus().equals("ACTIVE")) {
                return ResponseEntity.badRequest()
                        .body(new LoginResponse(false, "Account is inactive"));
            }
            if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(new LoginResponse(false, "Invalid username or password"));
            }

            String token = jwtUtil.generateToken(admin.getUsername());

            return ResponseEntity.ok(new LoginResponse(
                    true,
                    "Password verified. Proceed to OTP verification.",
                    token,
                    admin.getUsername(),
                    admin.getPoliceStation(),
                    admin.getId()
            ));

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new LoginResponse(false, "Login failed: " + e.getMessage()));
        }
    }

    // POST /api/auth/send-otp
    // Needs JWT token in header
    // React calls this after password step passes
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(
            @RequestHeader("Authorization") String authHeader) {
        try {
            // Extract username from JWT token
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                throw new RuntimeException("Invalid Authorization header");
            }
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            // Generate and send OTP to admin's email
            otpService.generateAndSendOtp(username);

            return ResponseEntity.ok(
                    new ApiResponse(true, "OTP sent to your registered email")
            );
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Failed to send OTP: " + e.getMessage()));
        }
    }

    // POST /api/auth/verify-otp
    // Needs JWT token in header
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse> verifyOtp(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody OtpRequest request) {
        try {
            // Extract username from JWT token
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            // Verify OTP
            boolean verified = otpService.verifyOtp(username, request.getOtp());

            if (verified) {
                return ResponseEntity.ok(
                        new ApiResponse(true, "OTP verified. Proceed to face detection.")
                );
            } else {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "OTP verification failed"));
            }

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Verification failed: " + e.getMessage()));
        }
    }
}
