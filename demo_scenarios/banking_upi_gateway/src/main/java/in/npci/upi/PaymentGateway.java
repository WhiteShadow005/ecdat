package in.npci.upi;

import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import java.security.Signature;

public class PaymentGateway {
    public void processUpiTransaction() throws Exception {
        // Vulnerable 3DES ATM PIN block encryption
        KeyGenerator keyGen = KeyGenerator.getInstance("DESede");
        keyGen.init(168);
        Cipher desCipher = Cipher.getInstance("DESede/CBC/PKCS5Padding");

        // Vulnerable RSA-2048 Digital Signature for NPCI settlement
        Signature rsaSig = Signature.getInstance("SHA256withRSA");

        // AES-128 Session token encryption (Grover's weakened)
        Cipher aesCipher = Cipher.getInstance("AES/CBC/PKCS5Padding");
    }
}
