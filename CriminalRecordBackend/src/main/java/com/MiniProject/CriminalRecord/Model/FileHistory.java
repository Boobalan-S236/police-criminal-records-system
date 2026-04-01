package com.MiniProject.CriminalRecord.Model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_history")
@Data
public class FileHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Which file this action was performed on
    @ManyToOne
    @JoinColumn(name = "file_id")
    private EncryptedFile encryptedFile;

    // Who did this action
    @ManyToOne
    @JoinColumn(name = "performed_by")
    private AdminUser performedBy;

    // ENCRYPTED, SHARED, DECRYPTED, DOWNLOADED, DELETED
    private String action;

    // Extra detail about the action
    private String description;

    private LocalDateTime timestamp;

    @PrePersist
    public void prePersist() {
        this.timestamp = LocalDateTime.now();
    }

}