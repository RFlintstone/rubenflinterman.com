# Security Policy

## Supported Versions

This section lists the versions of each project within the mono repo that are currently being supported with security updates.

| Project   | Version | Supported          |
| --------- | ------- | ------------------ |
| Portfolio | 1.x.x   | :white_check_mark:  |
| API       | 2.x.x   | :white_check_mark:  |
| Blog      | <=1.0   | :x:                |
| Portfolio | < 1.0   | :x:                |
| API       | < 1.0   | :x:                |

**Note:** All active versions will receive regular security patches and updates. Older versions or versions marked as unsupported will not receive security fixes.

## Reporting a Vulnerability

If you find a vulnerability in any of the projects within this mono repo, we encourage you to report it to us responsibly. Here's how you can do so:

1. **Where to Report:**
   - Please report vulnerabilities via [email](mailto:rubenflint@hotmail.com) or [GitHub Issues](https://github.com/rflintstone/rubenflinterman.com/issues). Ensure you choose a private communication channel, particularly for critical issues.
   
2. **What to Include in the Report:**
   - Clear description of the issue or vulnerability.
   - Steps to reproduce (if applicable).
   - Expected vs actual behavior.
   - Screenshots, code snippets, or logs (if relevant).

3. **Response Time:**
   - You can expect an initial acknowledgment within **48 hours** of reporting the vulnerability.
   - We will provide regular updates on the progress of investigating the issue. We aim to resolve critical vulnerabilities within **2 weeks**.

4. **Acceptance or Decline of Vulnerability:**
   - If the reported vulnerability is validated, we will issue a patch or fix, and we will inform the community through a release note.
   - If the reported issue is not classified as a security vulnerability, we will let you know and provide reasoning behind the decision.

5. **Responsible Disclosure:**
   - We request that all vulnerabilities be reported privately to ensure that there is enough time to address the issue before making it public.

## General Security Best Practices

As the sole maintainer of the mono repo, I follow these best practices to ensure its security:

- **Manual Code Review:** Although peer reviews are not possible, I perform manual code reviews for every change to identify potential security issues.
- **Dependency Management:** I regularly update third-party dependencies and apply patches for known vulnerabilities.
- **Authentication & Authorization:** API and sensitive endpoints require proper authentication. Tokens, passwords, and other sensitive information should never be hardcoded in the codebase.
- **Testing:** Security testing (e.g., static analysis, penetration testing) is part of the CI/CD pipeline to catch common vulnerabilities.
  
If you have any questions regarding the security of the mono repo, feel free to contact me through the provided communication channels.  
