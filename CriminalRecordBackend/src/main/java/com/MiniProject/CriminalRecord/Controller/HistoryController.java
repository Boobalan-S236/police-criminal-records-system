package com.MiniProject.CriminalRecord.Controller;

import com.MiniProject.CriminalRecord.Dto.ApiResponse;
import com.MiniProject.CriminalRecord.Model.FileHistory;
import com.MiniProject.CriminalRecord.Service.HistoryService;
import com.MiniProject.CriminalRecord.Util.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/history")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class HistoryController {

    private final HistoryService historyService;
    private final JwtUtil jwtUtil;

    // GET /api/history/my
    @GetMapping("/my")
    public ResponseEntity<ApiResponse> getMyHistory(
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7);
            String username = jwtUtil.extractUsername(token);

            List<FileHistory> history = historyService.getMyHistory(username);

            return ResponseEntity.ok(
                    new ApiResponse(true, "History fetched", history)
            );

        } catch (RuntimeException e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(new ApiResponse(false, "Failed: " + e.getMessage()));
        }
    }
}

