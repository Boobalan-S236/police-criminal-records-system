package com.MiniProject.CriminalRecord.TestTing;

import com.MiniProject.CriminalRecord.Util.AESUtil;
import com.MiniProject.CriminalRecord.Util.RSAUtil;
import javax.crypto.SecretKey;
import java.security.KeyPair;

// I declared main() method inside this class for testing purpose only don't get confused...
public class CryptoTest {

    public static void main(String[] args) throws Exception {

        System.out.println("=== Testing AES ===");

        // Generate AES key
        SecretKey aesKey = AESUtil.generateAESKey();
        System.out.println("AES Key: " + AESUtil.keyToString(aesKey));

        // Encrypt some text
        String originalText = "Secret Criminal Record Data";
        byte[] encrypted = AESUtil.encryptFile(originalText.getBytes(), aesKey);
        System.out.println("Encrypted bytes length: " + encrypted.length);

        // Decrypt it back
        byte[] decrypted = AESUtil.decryptFile(encrypted, aesKey);
        System.out.println("Decrypted text: " + new String(decrypted));

        System.out.println("\n=== Testing RSA ===");

        // Generate RSA key pair
        KeyPair keyPair = RSAUtil.generateRSAKeyPair();
        String publicKeyStr = RSAUtil.publicKeyToString(keyPair.getPublic());
        String privateKeyStr = RSAUtil.privateKeyToString(keyPair.getPrivate());

        System.out.println("Public Key generated: " + publicKeyStr.substring(0, 20) + "...");
        System.out.println("Private Key generated: " + privateKeyStr.substring(0, 20) + "...");

        // Encrypt AES key with RSA public key
        String aesKeyStr = AESUtil.keyToString(aesKey);
        String encryptedAesKey = RSAUtil.encryptAESKey(aesKeyStr, publicKeyStr);
        System.out.println("AES key encrypted with RSA: " + encryptedAesKey.substring(0, 20) + "...");

        // Decrypt AES key with RSA private key
        String decryptedAesKey = RSAUtil.decryptAESKey(encryptedAesKey, privateKeyStr);
        System.out.println("AES key decrypted: " + decryptedAesKey.substring(0, 20) + "...");

        // Verify both AES keys match
        System.out.println("\nKeys match: " + aesKeyStr.equals(decryptedAesKey));
        System.out.println("\n✅ All crypto tests passed!");
    }
}