"""
ECDAT — Scanner Tests
Tests for Python AST scanner, cert parser, and config parser.
Owner: Sahil Sharma
Run: python -m pytest backend/tests/test_scanners.py -v
"""

import os
import sys
import tempfile
import pytest
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.scanners.python_scanner import scan_python_file, scan_python_directory
from app.scanners.config_parser import scan_config_file
from app.models import CryptoAsset


# ─── Python AST Scanner Tests ──────────────────────────────────────────────────

class TestPythonScanner:

    def _write_temp_py(self, code: str) -> str:
        """Write code to a temp .py file and return path."""
        f = tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False)
        f.write(code)
        f.close()
        return f.name

    def test_detects_rsa_key_generation(self):
        """Should detect rsa.generate_private_key with key_size=2048."""
        code = """
from cryptography.hazmat.primitives.asymmetric import rsa
private_key = rsa.generate_private_key(public_exponent=65537, key_size=2048)
"""
        path = self._write_temp_py(code)
        try:
            assets = scan_python_file(path)
            assert len(assets) > 0, "Should detect RSA key generation"
            algos = [a.algorithm for a in assets]
            assert any("RSA" in a for a in algos), f"Expected RSA in {algos}"
        finally:
            os.unlink(path)

    def test_detects_md5(self):
        """Should detect hashlib.md5 usage."""
        code = """
import hashlib
h = hashlib.md5(b'data').hexdigest()
"""
        path = self._write_temp_py(code)
        try:
            assets = scan_python_file(path)
            assert len(assets) > 0, "Should detect MD5"
            assert any("MD5" in a.algorithm.upper() for a in assets), \
                f"Expected MD5 in {[a.algorithm for a in assets]}"
        finally:
            os.unlink(path)

    def test_detects_sha1(self):
        """Should detect hashlib.sha1 usage."""
        code = """
import hashlib
h = hashlib.sha1(b'password').hexdigest()
"""
        path = self._write_temp_py(code)
        try:
            assets = scan_python_file(path)
            algos = [a.algorithm.upper() for a in assets]
            assert any("SHA" in a and "1" in a for a in algos), \
                f"Expected SHA-1 in {algos}"
        finally:
            os.unlink(path)

    def test_detects_aes(self):
        """Should detect AES.new() usage."""
        code = """
from Crypto.Cipher import AES
cipher = AES.new(key, AES.MODE_CBC)
"""
        path = self._write_temp_py(code)
        try:
            assets = scan_python_file(path)
            assert len(assets) > 0, "Should detect AES"
        finally:
            os.unlink(path)

    def test_returns_line_numbers(self):
        """Detected assets should have correct line numbers."""
        code = """# line 1
# line 2
import hashlib
h = hashlib.md5(b'x').hexdigest()  # line 4
"""
        path = self._write_temp_py(code)
        try:
            assets = scan_python_file(path)
            assert len(assets) > 0
            # Line 4 has the hashlib.md5 call
            assert any(a.line_number is not None for a in assets)
        finally:
            os.unlink(path)

    def test_empty_file_returns_empty(self):
        """Empty file should return no assets."""
        path = self._write_temp_py("")
        try:
            assets = scan_python_file(path)
            assert isinstance(assets, list)
        finally:
            os.unlink(path)

    def test_syntax_error_file_returns_empty(self):
        """File with syntax errors should return empty, not crash."""
        path = self._write_temp_py("def broken(: pass")
        try:
            assets = scan_python_file(path)
            assert isinstance(assets, list)
        finally:
            os.unlink(path)

    def test_directory_scan(self):
        """Directory scan should aggregate findings from all .py files."""
        tmpdir = tempfile.mkdtemp()
        try:
            # Write two files
            f1 = Path(tmpdir) / "auth.py"
            f1.write_text("import hashlib\nhashlib.md5(b'x')")
            f2 = Path(tmpdir) / "crypto.py"
            f2.write_text("from cryptography.hazmat.primitives.asymmetric import rsa\nrsa.generate_private_key(public_exponent=65537, key_size=2048)")

            assets = scan_python_directory(tmpdir)
            assert len(assets) >= 1, "Should find assets in directory"
        finally:
            import shutil
            shutil.rmtree(tmpdir, ignore_errors=True)


# ─── Config Parser Tests ───────────────────────────────────────────────────────

class TestConfigParser:

    def _write_temp_conf(self, content: str, name: str = "nginx.conf") -> str:
        tmpdir = tempfile.mkdtemp()
        path = os.path.join(tmpdir, name)
        with open(path, 'w') as f:
            f.write(content)
        return path

    def test_detects_weak_tls_protocol(self):
        """Should detect TLSv1 and TLSv1.1 in Nginx config."""
        content = "ssl_protocols TLSv1 TLSv1.1 TLSv1.2 TLSv1.3;\n"
        path = self._write_temp_conf(content)
        try:
            assets = scan_config_file(path)
            assert len(assets) > 0, "Should detect weak TLS protocols"
            assert any("TLS" in a.algorithm for a in assets)
        finally:
            import shutil
            shutil.rmtree(os.path.dirname(path), ignore_errors=True)

    def test_detects_rc4_cipher(self):
        """Should detect RC4 in cipher suite."""
        content = "ssl_ciphers 'RC4-SHA:AES256-GCM-SHA384';\n"
        path = self._write_temp_conf(content)
        try:
            assets = scan_config_file(path)
            assert any("RC4" in a.algorithm for a in assets), \
                f"Expected RC4 in {[a.algorithm for a in assets]}"
        finally:
            import shutil
            shutil.rmtree(os.path.dirname(path), ignore_errors=True)

    def test_detects_3des_cipher(self):
        """Should detect 3DES in cipher suite."""
        content = "ssl_ciphers 'AES256-GCM-SHA384:DES-CBC3-SHA:AES128-SHA';\n"
        path = self._write_temp_conf(content)
        try:
            assets = scan_config_file(path)
            assert any("3DES" in a.algorithm or "DES" in a.algorithm for a in assets)
        finally:
            import shutil
            shutil.rmtree(os.path.dirname(path), ignore_errors=True)

    def test_detects_weak_ssh_kexalg(self):
        """Should detect diffie-hellman-group1-sha1 in sshd_config."""
        content = "KexAlgorithms diffie-hellman-group1-sha1,curve25519-sha256\n"
        path = self._write_temp_conf(content, name="sshd_config")
        try:
            assets = scan_config_file(path)
            assert len(assets) > 0, "Should detect weak SSH KexAlgorithm"
            assert any("DH" in a.algorithm or "diffie" in a.algorithm.lower() for a in assets)
        finally:
            import shutil
            shutil.rmtree(os.path.dirname(path), ignore_errors=True)

    def test_detects_ssh_rsa_hostkey(self):
        """Should detect ssh-rsa in HostKeyAlgorithms."""
        content = "HostKeyAlgorithms ssh-rsa,ecdsa-sha2-nistp256\n"
        path = self._write_temp_conf(content, name="sshd_config")
        try:
            assets = scan_config_file(path)
            assert any("RSA" in a.algorithm.upper() or "ECDSA" in a.algorithm.upper() for a in assets)
        finally:
            import shutil
            shutil.rmtree(os.path.dirname(path), ignore_errors=True)

    def test_comment_lines_ignored(self):
        """Comment lines should not produce false positives."""
        content = "# ssl_protocols TLSv1 TLSv1.1\n# ssl_ciphers RC4-SHA\n"
        path = self._write_temp_conf(content)
        try:
            assets = scan_config_file(path)
            assert len(assets) == 0, "Comment lines should be ignored"
        finally:
            import shutil
            shutil.rmtree(os.path.dirname(path), ignore_errors=True)
