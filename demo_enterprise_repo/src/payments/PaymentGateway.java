package com.enterprise.payments;

import javax.crypto.Cipher;
import java.security.KeyPairGenerator;

public class PaymentGateway {
    public void processPayment() throws Exception {
        // Vulnerable RSA-2048 and DES encryption
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        Cipher cipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
        Cipher legacyCipher = Cipher.getInstance("DES/CBC/PKCS5Padding");
    }
}
