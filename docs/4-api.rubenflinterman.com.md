# API (v1) - api.rubenflinterman.com

[api.rubenflinterman.com](https://api.rubenflinterman.com) serves as the backend for my website. It uses a JWT-based authentication system with token rotation to ensure secure access to private resources.

---

# How it works
The authentication flow is designed to balance security with a seamless user experience:

- **Register**: New users create an account by providing a Username, Email, and Password.
- **Login**: Upon successful login, the API returns:
    - An `accessToken`: Short lifespan, used for immediate authentication.
    - A `refreshToken`: Long lifespan, used to obtain new access tokens.
- **Authorization**: The client uses the `accessToken` as a Bearer token in the `Authorization` header for protected requests (e.g., `/api/v1/user/`).
- **Token Rotation**: When the access token expires, the client calls the `/token/refresh` endpoint with the `refreshToken` to receive a new pair of tokens.
- **Logout**: The client sends the `refreshToken` to the logout endpoint to invalidate the session. The `refreshToken` disapears from the database so the token can not be reused.

---

# Endpoints

### Authentication & Tokens
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Create a new account. |
| `POST` | `/api/v1/token/login` | Authenticate and receive Access & Refresh tokens. |
| `POST` | `/api/v1/token/refresh` | Exchange a Refresh Token for a new token pair. |
| `POST` | `/api/v1/token/logout` | Revoke a Refresh Token and log out. |

### User Services
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/user/` | Fetch current user profile details. |
| `GET` | `/api/v1/user/admin` | Verify if the authenticated user has Admin privileges. |

---

# Infrastructure & Secrets

### Configuration Strategy
The API follows a **Docker Secrets** pattern. Sensitive values are stored in individual files within the `./secrets/` directory and mounted into the container at `/run/secrets/`.

### Required Secret Files
Create a folder named `secrets` in the root directory. The following files are required for the stack to initialize:

| File Name | Description |
| :--- | :--- |
| `pg_user` | Database username. |
| `pg_password` | Database password. |
| `pg_name` | Database name. |
| `pg_connection_string_development` | Full connection string for EF Core migrations. |
| `jwt_secret` | High-entropy string for signing JWTs. |
| `jwt_issuer` | The token issuer (e.g., api.rubenflinterman.com). |
| `jwt_audience` | The token audience (e.g., rubenflinterman.com). |
| `encryption_key` | Key used for internal data encryption. |
| `certificate.pfx` | SSL Certificate for the API container. |
| `cert_password` | Password for the .pfx certificate. |

---

# Project Setup

### Local Deployment
1. **Prepare Secrets**: Ensure all files in the `./secrets` folder exist.
2. **Docker Compose**: Run `docker-compose up -d`.
3. **Access**: 
   - API: `http://localhost:8080`
   - Adminer (DB GUI): `http://localhost:8082`

### Database Migrations
When updating the data model (e.g., adding the `Username` field):
1. **Generate**: `dotnet ef migrations add MigrationName`
2. **Push**: `dotnet ef database update`
   *Note: Ensure your local environment can reach the DB at `localhost:5433` as defined in the docker-compose ports.*

### Production
- **Hoop.dev**: Install and configure [hoop.dev](https://hoop.dev/docs/getting-started/cli) according to the documentation.
- Ensure the `hoop.dev` environment is active to securely manage the production database.
