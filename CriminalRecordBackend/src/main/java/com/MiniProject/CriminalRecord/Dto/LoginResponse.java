package com.MiniProject.CriminalRecord.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private boolean success;
    private String message;
    private String token;        // JWT token
    private String username;
    private String policeStation;
    private Long adminId;

    // Used when login fails
    public LoginResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }
}
