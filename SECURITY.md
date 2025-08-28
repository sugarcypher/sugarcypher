# Security Policy

## Supported Versions

We release patches and updates for the latest major version of SugarCypher.  
Older versions may not receive security updates. If you discover a vulnerability, please check you are running the latest release before reporting.

| Version | Supported          |
| ------- | ------------------ |
| main    | ✅ actively patched |
| < main  | ❌ not supported    |

## Reporting a Vulnerability

If you believe you have found a security vulnerability in SugarCypher:

1. **Do not open a public issue.**
2. Please send an email to [b@twl.today] (replace with your contact).
3. Include as much detail as possible:
   - Description of the issue
   - Steps to reproduce
   - Potential impact
   - Suggested fix or mitigation, if available

We aim to respond within **72 hours** and confirm receipt of your report.  
Fixes will be prioritized based on severity.

## Disclosure Process

- You will be credited in the release notes if you wish, once the issue is resolved.
- We follow a **responsible disclosure** model: security patches are developed privately, tested, and released as part of a stable update.
- In high-severity cases, we may issue an out-of-band security release and notify maintainers via GitHub advisories.

## Best Practices for Users

- Always update to the latest version of SugarCypher.
- Avoid running SugarCypher with unnecessary elevated privileges.
- Review and lock down environment variables, API keys, and third-party services.
- If deploying in production, use HTTPS, strict CORS, and secure headers.

---


