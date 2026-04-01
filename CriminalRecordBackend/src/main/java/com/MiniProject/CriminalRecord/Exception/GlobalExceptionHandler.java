package com.MiniProject.CriminalRecord.Exception;

import com.MiniProject.CriminalRecord.Dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─────────────────────────────────────────
    // Validation errors
    // @Valid fails → this catches it
    // Example: password less than 8 chars
    // Example: invalid email format
    // Example: blank username
    // ─────────────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationErrors(
            MethodArgumentNotValidException ex) {

        // Collect all field errors into a map
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors().forEach(error ->
                errors.put(error.getField(), error.getDefaultMessage())
        );

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, "Validation failed", errors));
    }

    // ─────────────────────────────────────────
    // Runtime exceptions
    // Example: "Username already exists"
    // Example: "Admin not found"
    // Example: "OTP expired"
    // ─────────────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse> handleRuntimeException(
            RuntimeException ex) {

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(false, ex.getMessage()));
    }

    // ─────────────────────────────────────────
    // 403 Forbidden
    // Happens when JWT missing or invalid
    // Now returns proper JSON instead of 403
    // ─────────────────────────────────────────
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse> handleAccessDenied(
            AccessDeniedException ex) {

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ApiResponse(false,
                        "Access denied. Please login and try again."));
    }

    // ─────────────────────────────────────────
    // Authentication exceptions
    // Bad credentials etc
    // ─────────────────────────────────────────
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse> handleAuthException(
            AuthenticationException ex) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(false,
                        "Authentication failed. Please login again."));
    }

    // ─────────────────────────────────────────
    // Any other unexpected exception
    // Catches everything else
    // ─────────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse> handleGeneralException(
            Exception ex) {

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new ApiResponse(false,
                        "Something went wrong: " + ex.getMessage()));
    }
}