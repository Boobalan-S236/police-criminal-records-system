package com.MiniProject.CriminalRecord.Controller;

import com.MiniProject.CriminalRecord.Dto.ApiResponse;
import com.MiniProject.CriminalRecord.Model.AdminUser;
import com.MiniProject.CriminalRecord.Model.EncryptedFile;
import com.MiniProject.CriminalRecord.Repository.EncryptedFileRepository;
import com.MiniProject.CriminalRecord.Service.DecryptionService;
import com.MiniProject.CriminalRecord.Service.EncryptionService;
import com.MiniProject.CriminalRecord.Service.ShareService;
import com.MiniProject.CriminalRecord.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {

    private final EncryptionService encryptionService;
    private final DecryptionService decryptionService;
    private final ShareService shareService;
    private final EncryptedFileRepository encryptedFileRepository;
    private final JwtUtil jwtUtil;

    // ─────────────────────────────────────────
    // ENCRYPT
    // ─────────────────────────────────────────
    @PostMapping("/encrypt")
    public ResponseEntity<ApiResponse> encryptFile(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Please select a file"));
            }
            String username = extractUsername(authHeader);
            EncryptedFile encryptedFile = encryptionService.encryptFile(username, file);
            return ResponseEntity.ok(new ApiResponse(
                    true, "File encrypted successfully!", encryptedFile.getId()
            ));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Encryption failed: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────
    // DECRYPT + DOWNLOAD
    // ─────────────────────────────────────────
    // GET /api/files/decrypt/{fileId}
    @GetMapping("/decrypt/{fileId}")
    public ResponseEntity<byte[]> decryptFile(
            @RequestHeader("Authorization") String authHeader,
            @PathVariable Long fileId) {
        try {
            String username = extractUsername(authHeader);

            // Fetch file record BEFORE decryption
            EncryptedFile fileRecord = encryptedFileRepository
                    .findById(fileId)
                    .orElseThrow(() -> new RuntimeException("File not found"));

            // FIX 1: CRITICAL SECURITY CHECK
            // Verify logged in admin is the actual receiver
            // Without this any admin can decrypt any file!
            if (!fileRecord.getReceiver().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .build();
            }

            // FIX 2: Check already downloaded or deleted
            if (fileRecord.getStatus().equals("DELETED")) {
                return ResponseEntity.badRequest().build();
            }

            String originalName = fileRecord.getOriginalFileName();

            // Decrypt file - this handles delete internally
            byte[] decryptedBytes = decryptionService.decryptFile(username, fileId);

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + originalName + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(decryptedBytes);

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ─────────────────────────────────────────
    // SHARE FILE TO ANOTHER ADMIN
    // ─────────────────────────────────────────
    @PostMapping("/share")
    public ResponseEntity<ApiResponse> shareFile(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file,
            @RequestParam("receiverUsername") String receiverUsername) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ApiResponse(false, "Please select a file"));
            }
            String senderUsername = extractUsername(authHeader);
            EncryptedFile shared = shareService.shareFile(
                    senderUsername, receiverUsername, file
            );
            return ResponseEntity.ok(new ApiResponse(
                    true,
                    "File shared successfully to " + receiverUsername,
                    shared.getId()
            ));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Share failed: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────
    // GET ACTIVE ADMINS (for receiver dropdown)
    // ─────────────────────────────────────────
    @GetMapping("/active-admins")
    public ResponseEntity<ApiResponse> getActiveAdmins(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            List<AdminUser> admins = shareService.getActiveAdmins(username);
            return ResponseEntity.ok(new ApiResponse(true, "Active admins", admins));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Failed: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────
    // GET MY ENCRYPTED FILES
    // ─────────────────────────────────────────
    @GetMapping("/my-files")
    public ResponseEntity<ApiResponse> getMyFiles(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            List<EncryptedFile> files = encryptionService.getMyEncryptedFiles(username);
            return ResponseEntity.ok(new ApiResponse(true, "Files fetched", files));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Failed: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────
    // GET RECEIVED FILES (inbox)
    // ─────────────────────────────────────────
    @GetMapping("/received")
    public ResponseEntity<ApiResponse> getReceivedFiles(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            List<EncryptedFile> files = shareService.getReceivedFiles(username);
            return ResponseEntity.ok(new ApiResponse(true, "Received files", files));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Failed: " + e.getMessage()));
        }
    }

    // ─────────────────────────────────────────
    // GET PENDING FILES ONLY
    // ─────────────────────────────────────────
    @GetMapping("/pending")
    public ResponseEntity<ApiResponse> getPendingFiles(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String username = extractUsername(authHeader);
            List<EncryptedFile> files = shareService.getPendingFiles(username);
            return ResponseEntity.ok(new ApiResponse(true, "Pending files", files));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Failed: " + e.getMessage()));
        }
    }

    // Helper method to extract username from JWT
    private String extractUsername(String authHeader) {
        String token = authHeader.substring(7);
        return jwtUtil.extractUsername(token);
    }
}
