package com.enterprise.payments;

import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.ECGenParameterSpec;
import java.security.KeyPairGenerator;
import java.security.KeyPair;

/**
 * Enterprise Transaction Signer
 * Signs outbound payment authorizations using digital signatures.
 */
public class TransactionSigner {

    public KeyPair generateECKeyPair() throws Exception {
        // Quantum-vulnerable: ECDSA key pair generation
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("EC");
        ECGenParameterSpec ecSpec = new ECGenParameterSpec("secp256r1");
        kpg.initialize(ecSpec);
        return kpg.generateKeyPair();
    }

    public byte[] signTransaction(byte[] transactionData, PrivateKey privateKey) throws Exception {
        // Quantum-vulnerable: ECDSA signature algorithm
        Signature dsa = Signature.getInstance("SHA256withECDSA");
        dsa.initSign(privateKey);
        dsa.update(transactionData);
        return dsa.sign();
    }

    public boolean verifySignature(byte[] data, byte[] signature, PublicKey publicKey) throws Exception {
        Signature verifier = Signature.getInstance("SHA256withECDSA");
        verifier.initVerify(publicKey);
        verifier.update(data);
        return verifier.verify(signature);
    }
}
