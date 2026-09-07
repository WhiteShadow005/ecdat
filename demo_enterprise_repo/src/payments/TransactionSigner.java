package com.enterprise.payments;

import java.security.KeyPairGenerator;
import java.security.spec.ECGenParameterSpec;
import java.security.Signature;

public class TransactionSigner {
    public void setupKey() throws Exception {
        // Vulnerable ECDSA secp256r1 (Broken by Shor's Algorithm)
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        kpg.initialize(new ECGenParameterSpec("secp256r1"));
        Signature sig = Signature.getInstance("SHA256withECDSA");
    }
}
