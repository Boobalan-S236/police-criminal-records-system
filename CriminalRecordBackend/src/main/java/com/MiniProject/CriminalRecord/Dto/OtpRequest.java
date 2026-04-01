package com.MiniProject.CriminalRecord.Dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpRequest {

    @NotBlank(message = "OTP is required")
    private String otp;
}