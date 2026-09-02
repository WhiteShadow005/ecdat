"""
ECDAT — Java Scanner Unit Tests
Tests cryptographic detection in Java source files.
Owner: Shaurya Pratap Singh
"""

import tempfile
import os
import pytest
from app.scanners.java_scanner import scan_java_file, _normalize_java_algorithm


class TestJavaScanner:

    def test_normalize_java_algorithm(self):
        assert _normalize_java_algorithm("RSA/ECB/PKCS1Padding") == "RSA"
        assert _normalize_java_algorithm("AES/CBC/PKCS5Padding") == "AES"
        assert _normalize_java_algorithm("DESede/CBC/PKCS5Padding") == "3DES"
        assert _normalize_java_algorithm("SHA256withRSA") == "RSA"
        assert _normalize_java_algorithm("SHA256withECDSA") == "ECDSA"
        assert _normalize_java_algorithm("EC") == "ECDSA"
        assert _normalize_java_algorithm("DiffieHellman") == "Diffie-Hellman"

    def test_detects_rsa_and_keysize(self):
        code = """
        package com.test;
        import java.security.KeyPairGenerator;
        public class CryptoTest {
            public void init() throws Exception {
                KeyPairGenerator kpg = KeyPairGenerator.getInstance("RSA");
                kpg.initialize(2048);
            }
        }
        """
        with tempfile.NamedTemporaryFile("w", suffix=".java", delete=False) as f:
            f.write(code)
            fname = f.name

        try:
            assets = scan_java_file(fname)
            assert len(assets) == 1
            assert assets[0].algorithm == "RSA-2048"
            assert assets[0].key_size == 2048
            assert assets[0].language == "java"
            assert assets[0].line_number == 6
        finally:
            os.unlink(fname)

    def test_detects_aes_cipher(self):
        code = """
        package com.test;
        import javax.crypto.Cipher;
        public class CipherTest {
            public void test() throws Exception {
                Cipher c = Cipher.getInstance("AES/CBC/PKCS5Padding");
            }
        }
        """
        with tempfile.NamedTemporaryFile("w", suffix=".java", delete=False) as f:
            f.write(code)
            fname = f.name

        try:
            assets = scan_java_file(fname)
            assert len(assets) == 1
            assert assets[0].algorithm == "AES"
            assert "AES/CBC/PKCS5Padding" in assets[0].notes
        finally:
            os.unlink(fname)

    def test_detects_message_digest_md5(self):
        code = """
        package com.test;
        import java.security.MessageDigest;
        public class HashTest {
            public void hash() throws Exception {
                MessageDigest md = MessageDigest.getInstance("MD5");
            }
        }
        """
        with tempfile.NamedTemporaryFile("w", suffix=".java", delete=False) as f:
            f.write(code)
            fname = f.name

        try:
            assets = scan_java_file(fname)
            assert len(assets) == 1
            assert assets[0].algorithm == "MD5"
        finally:
            os.unlink(fname)

    def test_ignores_comments(self):
        code = """
        package com.test;
        // Cipher c1 = Cipher.getInstance("DES");
        /*
        Cipher c2 = Cipher.getInstance("RC4");
        */
        public class CleanTest {
            // Nothing here
        }
        """
        with tempfile.NamedTemporaryFile("w", suffix=".java", delete=False) as f:
            f.write(code)
            fname = f.name

        try:
            assets = scan_java_file(fname)
            assert len(assets) == 0
        finally:
            os.unlink(fname)
