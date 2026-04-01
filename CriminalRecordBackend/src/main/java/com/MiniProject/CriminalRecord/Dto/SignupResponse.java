package com.MiniProject.CriminalRecord.Dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignupResponse {
    private boolean success;
    private String message;
    private Long adminId;
}