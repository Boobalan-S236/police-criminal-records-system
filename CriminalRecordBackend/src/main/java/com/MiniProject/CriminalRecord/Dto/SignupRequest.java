package com.MiniProject.CriminalRecord.Dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class SignupRequest {

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 50, message = "Username must be 3-50 characters")
    private String username;

    @NotBlank(message = "Police station is required")
    private String policeStation;

    @NotBlank(message = "Police ID is required")
    private String policeId;

    @NotBlank(message = "Aadhar ID is required")
    @Size(min = 12, max = 12, message = "Aadhar must be 12 digits")
    private String aadharId;

    @NotBlank(message = "Password is required")
    @Size(min = 8, message = "Password must be at least 8 characters")
    private String password;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
