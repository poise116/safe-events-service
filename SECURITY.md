# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 0.15.x  | :white_check_mark: |
| < 0.15  | :x:                |

## Reporting a Vulnerability

The Safe Events Service team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Preferred Method**: Use GitHub's Security Advisory feature
   - Navigate to the repository's Security tab
   - Click "Report a vulnerability"
   - Fill out the form with details about the vulnerability

2. **Alternative Method**: Email the maintainers directly
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include in Your Report

To help us better understand and address the issue, please include as much of the following information as possible:

- **Type of vulnerability** (e.g., SQL injection, XSS, authentication bypass)
- **Full paths of source file(s)** related to the vulnerability
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions** to reproduce the issue
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the vulnerability** including how an attacker might exploit it
- **Suggested fix** (if you have one)

### What to Expect

After you submit a report, you can expect:

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
2. **Communication**: We will send you regular updates about our progress
3. **Verification**: We will work to verify and reproduce the vulnerability
4. **Fix Development**: We will develop and test a fix
5. **Disclosure**: We will coordinate with you on the disclosure timeline
6. **Credit**: We will credit you for the discovery (unless you prefer to remain anonymous)

### Disclosure Policy

- We ask that you give us a reasonable amount of time to fix the vulnerability before public disclosure
- We will work with you to understand the scope and severity of the issue
- We aim to release security patches as quickly as possible
- We will publicly acknowledge your responsible disclosure (with your permission)

## Security Best Practices for Users

If you are deploying Safe Events Service, we recommend the following security practices:

### Authentication and Authorization

- **Enable SSE Authentication**: Set `SSE_AUTH_TOKEN` environment variable to secure Server-Sent Events endpoints
- **Use Strong Tokens**: Generate cryptographically secure random tokens for authentication
- **Rotate Credentials**: Regularly rotate authentication tokens and database credentials
- **Webhook Authorization**: Configure HTTP Basic Auth for webhook endpoints to prevent unauthorized access

### Network Security

- **Use HTTPS**: Always deploy the service behind HTTPS/TLS in production
- **Firewall Rules**: Restrict access to the admin panel and database to trusted networks only
- **Rate Limiting**: Implement rate limiting at the reverse proxy level
- **Network Segmentation**: Keep the database and RabbitMQ in a private network

### Database Security

- **Strong Passwords**: Use strong, unique passwords for database connections
- **Least Privilege**: Grant only necessary database permissions to the application user
- **Encryption at Rest**: Enable database encryption at rest if supported
- **Backup Security**: Secure and encrypt database backups

### RabbitMQ Security

- **Authentication**: Use strong credentials for RabbitMQ connections
- **Virtual Hosts**: Use separate virtual hosts for different environments
- **TLS/SSL**: Enable TLS for RabbitMQ connections in production
- **Access Control**: Configure proper user permissions and access control lists

### Application Security

- **Environment Variables**: Never commit sensitive environment variables to version control
- **Dependency Updates**: Regularly update dependencies to patch known vulnerabilities
- **Security Scanning**: Run security scans on Docker images before deployment
- **Logging**: Enable comprehensive logging but avoid logging sensitive data
- **Input Validation**: Ensure all inputs are validated (already implemented via class-validator)

### Monitoring and Incident Response

- **Health Checks**: Monitor the `/health/` endpoint regularly
- **Webhook Monitoring**: Monitor webhook failure rates and investigate anomalies
- **Log Monitoring**: Set up alerts for suspicious activities in logs
- **Incident Response Plan**: Have a plan in place for responding to security incidents

### Docker Security

- **Base Images**: Use official, minimal base images
- **Image Scanning**: Scan Docker images for vulnerabilities
- **Non-Root User**: Run containers as non-root users when possible
- **Resource Limits**: Set appropriate resource limits for containers

### Configuration

- **Auto-Disable Webhooks**: Consider enabling `WEBHOOK_AUTO_DISABLE` to automatically disable failing webhooks
- **Failure Thresholds**: Configure `WEBHOOK_FAILURE_THRESHOLD` and `WEBHOOK_HEALTH_MINUTES_WINDOW` appropriately
- **Timeout Settings**: Ensure webhook timeout settings are reasonable to prevent resource exhaustion

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed. Updates will be announced through:

- GitHub Security Advisories
- Release notes
- Repository README

## Scope

This security policy applies to the latest version of the Safe Events Service repository. For security issues in dependencies, please report them to the respective maintainers.

## Questions

If you have questions about this security policy, please open an issue with the "question" label or contact the maintainers.

---

Thank you for helping keep Safe Events Service and its users safe!
