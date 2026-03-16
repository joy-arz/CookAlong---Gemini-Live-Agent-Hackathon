## 2024-05-28 - Removed Hardcoded Secret Key
**Vulnerability:** A hardcoded `JWT_SECRET_KEY` fallback string existed in `backend/app/auth.py` (`"my_super_secret_dev_key"`).
**Learning:** Hardcoding a fallback secret key in code is dangerous, even for development purposes, as it can accidentally be deployed to production or committed to the repository. The application should fail fast if the environment variable is not provided.
**Prevention:** Always require sensitive environment variables to be set externally. Do not provide fallback defaults for secrets in the codebase.
