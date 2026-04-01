package com.MiniProject.CriminalRecord.Service;

import com.MiniProject.CriminalRecord.Util.RSAUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.io.*;
import java.nio.file.*;
import java.security.KeyPair;

@Service
public class KeyService {

    // This path comes from application.properties
    // C:/police-storage/private-keys/
    @Value("${app.storage.private-keys}")
    private String privateKeyStoragePath;

    // Generate RSA key pair for a new admin
    // Returns public key string to save in DB
    // Saves private key file to secure folder
    public String generateAndStoreKeys(Long adminId) throws Exception {

        // Step 1: Generate RSA 2048 key pair
        KeyPair keyPair = RSAUtil.generateRSAKeyPair();

        // Step 2: Convert both keys to Base64 strings
        String publicKeyStr = RSAUtil.publicKeyToString(keyPair.getPublic());
        String privateKeyStr = RSAUtil.privateKeyToString(keyPair.getPrivate());

        // Step 3: Save private key to file system
        // File name = adminId_private.key
        // Example: 1_private.key, 2_private.key
        savePrivateKeyToFile(adminId, privateKeyStr);

        // Step 4: Return public key to be saved in DB
        return publicKeyStr;
    }

    // Save private key as a file outside tomcat server
    private void savePrivateKeyToFile(Long adminId, String privateKeyStr) throws Exception {
        // Create directory if it doesn't exist
        Path dirPath = Paths.get(privateKeyStoragePath);
        if (!Files.exists(dirPath)) {
            Files.createDirectories(dirPath);
        }

        // File path: C:/police-storage/private-keys/1_private.key
        String filePath = privateKeyStoragePath + adminId + "_private.key";

        // Write private key string to file
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(filePath))) {
            writer.write(privateKeyStr);
        }
    }

    // Read private key from file for decryption
    // Called during decryption flow
    public String getPrivateKey(Long adminId) throws Exception {
        String filePath = privateKeyStoragePath + adminId + "_private.key";

        // Read file content
        try (BufferedReader reader = new BufferedReader(new FileReader(filePath))) {
            StringBuilder sb = new StringBuilder();
            String line;
            while ((line = reader.readLine()) != null) {
                sb.append(line);
            }
            return sb.toString();
        }
    }
}