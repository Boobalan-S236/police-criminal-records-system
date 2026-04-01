package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Dto.SignupRequest;
import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminUserRepository adminUserRepository;
    private final KeyService keyService;
    private final PasswordEncoder passwordEncoder;

    public AdminUser signup(SignupRequest request) throws Exception {

        // Step 1: Check for duplicates
        if (adminUserRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username already exists");
        }
        if (adminUserRepository.existsByPoliceId(request.getPoliceId())) {
            throw new RuntimeException("Police ID already registered");
        }
        if (adminUserRepository.existsByAadharId(request.getAadharId())) {
            throw new RuntimeException("Aadhar ID already registered");
        }
        if (adminUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Step 2: Create new admin object
        AdminUser admin = new AdminUser();
        admin.setUsername(request.getUsername());
        admin.setPoliceStation(request.getPoliceStation());
        admin.setPoliceId(request.getPoliceId());
        admin.setAadharId(request.getAadharId());
        admin.setEmail(request.getEmail());

        // Step 3: Hash the password - never store plain text
        admin.setPassword(passwordEncoder.encode(request.getPassword()));
        admin.setStatus("ACTIVE");

        // Step 4: Save admin to DB first to get the generated ID
        AdminUser savedAdmin = adminUserRepository.save(admin);

        // Step 5: Generate RSA key pair using admin's DB id
        // Public key returned, private key saved to file
        String publicKey = keyService.generateAndStoreKeys(savedAdmin.getId());

        // Step 6: Save public key to DB
        savedAdmin.setPublicKey(publicKey);
        adminUserRepository.save(savedAdmin);

        return savedAdmin;
    }

    // Get admin by username
    public AdminUser getAdminByUsername(String username) {
        return adminUserRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
    }

    // Get all active admins except current
    // Used in share feature to show receiver list
    public java.util.List<AdminUser> getActiveAdmins(String currentUsername) {
        return adminUserRepository.findByStatus("ACTIVE")
                .stream()
                .filter(a -> !a.getUsername().equals(currentUsername))
                .toList();
    }
}