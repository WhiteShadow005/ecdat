# Demo Certificates

TODO (Sahil): Generate self-signed test certificates for demo:
1. `server.pem` — RSA-2048 self-signed cert (will be flagged as BROKEN by ECDAT)
2. `ca_bundle.crt` — Intermediate CA cert with SHA-1 signature (will be flagged as CRITICAL)

Generate with:
```bash
openssl req -x509 -newkey rsa:2048 -keyout server.key -out server.pem -days 365 -nodes
```
