package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

@Service
@RequiredArgsConstructor
public class FaceService {

    @Value("${app.storage.face-images}")
    private String faceImageStoragePath;

    private final AdminUserRepository adminUserRepository;

    // Save face image during signup
    // Called after signup is done
    public String saveFaceImage(Long adminId, MultipartFile faceImage) throws IOException {

        // Step 1: Create directory if not exists
        Path dirPath = Paths.get(faceImageStoragePath);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        // Step 2: Save image as adminId_face.jpg
        // Example: 1_face.jpg
        String fileName = adminId + "_face.jpg";
        Path filePath = dirPath.resolve(fileName);

        // Step 3: Write image bytes to file
        Files.write(filePath, faceImage.getBytes());

        // Step 4: Update admin record with face image path
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        admin.setFaceImagePath(filePath.toString());
        adminUserRepository.save(admin);

        return filePath.toString();
    }

    // Get face image path for an admin
    // React fetches this image to compare during login
    public String getFaceImagePath(Long adminId) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return admin.getFaceImagePath();
    }

    // Check if face image exists for admin
    public boolean hasFaceImage(Long adminId) {
        AdminUser admin = adminUserRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        return admin.getFaceImagePath() != null &&
                Files.exists(Paths.get(admin.getFaceImagePath()));
    }
}