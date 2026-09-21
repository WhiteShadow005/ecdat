package in.npci.upi;

import java.security.KeyPairGenerator;
import java.security.MessageDigest;

public class TransactionSigner {
    public void initializeSettlementKey() throws Exception {
        // RSA-2048 KeyPair for inter-bank transaction payloads
        KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
        kpg.initialize(2048);

        // Broken SHA-1 checksum in legacy settlement reconciliation
        MessageDigest sha1Digest = MessageDigest.getInstance("SHA-1");

        // Classical SHA-256 for payment message digests
        MessageDigest sha256Digest = MessageDigest.getInstance("SHA-256");
    }
}
