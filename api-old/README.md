# Secured API
This is a secured API that uses JWT for authentication. The API has two kinds of endpoints:
1. **Public Endpoints**: These endpoints are accessible without any authentication.
2. **Private Endpoints**: These endpoints are accessible only after successful authentication.

# Endpoints Prefixes
1. **Public Endpoints**: An endpoint is deemed a public endpoint if it has the prefix `/p`.
2. **Private Endpoints**: All other endpoints are deemed private endpoints.

# When do I get a 401 Unauthorized Error?
1. **Public Endpoints**: 
   - You should **not** get a 401 Unauthorized error when accessing public endpoints.
   - If the endpoint does not exist you will get a 401 error. This is because we don't want to leak information about the existence of an endpoint.
2. **Private Endpoints**:
    - You should get a 401 Unauthorized error when you dont provide a JWT token.
    - Or when you provide an invalid or expired JWT token.

# When do I get a 200 OK Response?
1. **Public Endpoints**: 
   - You should get a 200 OK response when accessing an **existing** public endpoints.
2. **Private Endpoints**:
    - You should get a 200 OK response when you provide a valid JWT token.

# How do I get a JWT token?
1. **Contact the Admin**: The admin will provide you with a username and refresh token. The refresh token is valid for `X` days.
2. **Use the refresh token**: With the credentials provided by the admin you can POST ``/api/token/create`` to get a JWT token.
3. **Use the JWT token**: You can use the JWT token to access private endpoints.