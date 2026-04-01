package com.MiniProject.CriminalRecord.Util;

import javax.crypto.Cipher;
import java.security.*;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;

public class RSAUtil {

    private static final String ALGORITHM = "RSA";
    private static final int KEY_SIZE = 2048;

    // Generate RSA 2048 bit key pair
    // Public key → DB
    // Private key → C:/police-storage/private-keys/
    public static KeyPair generateRSAKeyPair() throws Exception {
        KeyPairGenerator keyGen = KeyPairGenerator.getInstance(ALGORITHM);
        keyGen.initialize(KEY_SIZE, new SecureRandom());
        return keyGen.generateKeyPair();
    }

    // Convert PublicKey object to Base64 String
    // This string is what we store in DB
    public static String publicKeyToString(PublicKey publicKey) {
        return Base64.getEncoder().encodeToString(publicKey.getEncoded());
    }

    // Convert PrivateKey object to Base64 String
    // This string is what we save to file
    public static String privateKeyToString(PrivateKey privateKey) {
        return Base64.getEncoder().encodeToString(privateKey.getEncoded());
    }

    // Convert Base64 String back to PublicKey object
    public static PublicKey stringToPublicKey(String publicKeyStr) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(publicKeyStr);
        X509EncodedKeySpec keySpec = new X509EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        return keyFactory.generatePublic(keySpec);
    }

    // Convert Base64 String back to PrivateKey object
    public static PrivateKey stringToPrivateKey(String privateKeyStr) throws Exception {
        byte[] keyBytes = Base64.getDecoder().decode(privateKeyStr);
        PKCS8EncodedKeySpec keySpec = new PKCS8EncodedKeySpec(keyBytes);
        KeyFactory keyFactory = KeyFactory.getInstance(ALGORITHM);
        return keyFactory.generatePrivate(keySpec);
    }

    // Encrypt AES key using RSA Public Key
    // Only the person with private key can decrypt this
    public static String encryptAESKey(String aesKeyStr, String publicKeyStr) throws Exception {
        PublicKey publicKey = stringToPublicKey(publicKeyStr);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.ENCRYPT_MODE, publicKey);
        byte[] encryptedKey = cipher.doFinal(
                Base64.getDecoder().decode(aesKeyStr)
        );
        return Base64.getEncoder().encodeToString(encryptedKey);
    }

    // Decrypt AES key using RSA Private Key
    // Called during decryption flow after MFA passed
    public static String decryptAESKey(String encryptedAesKeyStr, String privateKeyStr) throws Exception {
        PrivateKey privateKey = stringToPrivateKey(privateKeyStr);
        Cipher cipher = Cipher.getInstance(ALGORITHM);
        cipher.init(Cipher.DECRYPT_MODE, privateKey);
        byte[] decryptedKey = cipher.doFinal(
                Base64.getDecoder().decode(encryptedAesKeyStr)
        );
        return Base64.getEncoder().encodeToString(decryptedKey);
    }
}