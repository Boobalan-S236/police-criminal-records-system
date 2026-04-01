package com.MiniProject.CriminalRecord.Util;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.IvParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

public class AESUtil {

    // AES-256 with CBC mode and PKCS5 padding
    private static final String ALGORITHM = "AES/CBC/PKCS5Padding";
    private static final int KEY_SIZE = 256;
    private static final int IV_SIZE = 16;

    // Step 1: Generate a brand new random AES-256 key
    // Called every time a new file needs to be encrypted
    public static SecretKey generateAESKey() throws Exception {
        KeyGenerator keyGen = KeyGenerator.getInstance("AES");
        keyGen.init(KEY_SIZE, new SecureRandom());
        return keyGen.generateKey();
    }

    // Step 2: Encrypt file bytes using AES key
    // Returns IV + encrypted data combined
    // IV is needed for decryption later
    public static byte[] encryptFile(byte[] fileBytes, SecretKey key) throws Exception {
        // IV = Initialization Vector - makes encryption unique each time
        byte[] iv = new byte[IV_SIZE];
        new SecureRandom().nextBytes(iv);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, key, ivSpec);
        byte[] encryptedData = cipher.doFinal(fileBytes);

        // Combine IV + encrypted data into one byte array
        // First 16 bytes = IV, rest = encrypted file
        byte[] combined = new byte[IV_SIZE + encryptedData.length];
        System.arraycopy(iv, 0, combined, 0, IV_SIZE);
        System.arraycopy(encryptedData, 0, combined, IV_SIZE, encryptedData.length);

        return combined;
    }

    // Step 3: Decrypt file bytes using AES key
    // Extract IV from first 16 bytes then decrypt rest
    public static byte[] decryptFile(byte[] encryptedBytes, SecretKey key) throws Exception {
        // Extract IV from first 16 bytes
        byte[] iv = new byte[IV_SIZE];
        System.arraycopy(encryptedBytes, 0, iv, 0, IV_SIZE);
        IvParameterSpec ivSpec = new IvParameterSpec(iv);

        // Extract actual encrypted data after IV
        byte[] encryptedData = new byte[encryptedBytes.length - IV_SIZE];
        System.arraycopy(encryptedBytes, IV_SIZE, encryptedData, 0, encryptedData.length);

        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, key, ivSpec);

        return cipher.doFinal(encryptedData);
    }

    // Convert SecretKey to Base64 String for storage
    public static String keyToString(SecretKey key) {
        return Base64.getEncoder().encodeToString(key.getEncoded());
    }

    // Convert Base64 String back to SecretKey
    public static SecretKey stringToKey(String keyStr) {
        byte[] keyBytes = Base64.getDecoder().decode(keyStr);
        return new SecretKeySpec(keyBytes, "AES");
    }
}
