package com.MiniProject.CriminalRecord.Controller;

import com.MiniProject.CriminalRecord.Dto.ApiResponse;
import com.MiniProject.CriminalRecord.Dto.FaceVerifyRequest;
import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Repository.AdminUserRepository;
import com.MiniProject.CriminalRecord.Service.FaceService;
import com.MiniProject.CriminalRecord.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/face")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FaceController {

    private final FaceService faceService;
    private final JwtUtil jwtUtil;
    private final AdminUserRepository adminUserRepository;

    // POST /api/face/save
    // Called during signup to save face image
    // Needs JWT token
    @PostMapping("/save")
    public ResponseEntity<ApiResponse> saveFaceImage(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("faceImage") MultipartFile faceImage) {
        try {
            // Get username from token
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            // Get admin id
            AdminUser admin = adminUserRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            // Validate file type
            String contentType = faceImage.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Only image files allowed"));
            }

            // Save face image
            faceService.saveFaceImage(admin.getId(), faceImage);

            return ResponseEntity.ok(
                    new ApiResponse(true, "Face image saved successfully")
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Failed to save face: " + e.getMessage()));
        }
    }

    // GET /api/face/image
    // React fetches stored face image to compare during login
    // face-api.js does the actual comparison in browser
    @GetMapping("/image")
    public ResponseEntity<Resource> getFaceImage(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            AdminUser admin = adminUserRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            String imagePath = faceService.getFaceImagePath(admin.getId());

            if (imagePath == null || !Files.exists(Paths.get(imagePath))) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new FileSystemResource(imagePath);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "inline; filename=\"" + admin.getId() + "_face.jpg\"")
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // POST /api/face/verify
    // React sends match result from face-api.js
    // Backend records the verification result
    @PostMapping("/verify")
    public ResponseEntity<ApiResponse> verifyFace(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody FaceVerifyRequest request) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            // Check admin exists and is active
            AdminUser admin = adminUserRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("Admin not found"));

            if (!admin.getStatus().equals("ACTIVE")) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Account is inactive"));
            }

            // face-api.js sends match score from browser
            // We trust score >= 0.6 as a match
            if (request.isMatched() && request.getMatchScore() >= 0.6) {
                return ResponseEntity.ok(
                        new ApiResponse(true, "Face verified successfully. MFA complete!")
                );
            } else {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false,
                                "Face verification failed. Score: " + request.getMatchScore()));
            }

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Face verification error: " + e.getMessage()));
        }
    }
}