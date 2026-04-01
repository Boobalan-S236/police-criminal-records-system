package com.MiniProject.CriminalRecord.Dto;

import lombok.Data;

@Data
public class FaceVerifyRequest {

    // Did face-api.js find a match?
    private boolean matched;

    // Confidence score from face-api.js
    // 0.0 = no match, 1.0 = perfect match
    // We accept >= 0.6
    private double matchScore;
}
