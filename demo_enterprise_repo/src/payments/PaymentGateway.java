package com.enterprise.payments;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;

/**
 * Enterprise Payment Gateway
 * Handles transaction encryption and checksum generation.
 */
public class PaymentGateway {

    public KeyPair generateMerchantKeys() throws NoSuchAlgorithmException {
        // Quantum-vulnerable: RSA-2048 key exchange
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);
        return kpg.generateKeyPair();
    }

    public byte[] encryptPayload(byte[] plainText, SecretKey key) throws Exception {
        // Weakened: AES in CBC mode with legacy padding
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(plainText);
    }

    public byte[] legacyEncrypt(byte[] data, SecretKey key) throws Exception {
        // Obsolete legacy 3DES encryption
        Cipher cipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");
        cipher.init(Cipher.ENCRYPT_MODE, key);
        return cipher.doFinal(data);
    }

    public String computeTransactionHash(byte[] payload) throws NoSuchAlgorithmException {
        // Broken: MD5 checksum
        MessageDigest md = MessageDigest.getInstance("MD5");
        byte[] hash = md.digest(payload);
        StringBuilder sb = new StringBuilder();
        for (byte b : hash) {
            sb.append(String.format("%02x", b));
        }
        return sb.toString();
    }
}
