package com.rubenflinterman.api.controller.security;

import com.rubenflinterman.api.service.security.TokenService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/token")
public class AuthController {

    private static final Logger LOG = LoggerFactory.getLogger(AuthController.class);
    private final TokenService tokenService;

    /***
     * This is the constructor for the AuthController
     * @param tokenService The token service
     */
    public AuthController(TokenService tokenService) {
        this.tokenService = tokenService;
    }

    /***
     * This is the endpoint for creating a token
     * @param authentication The authentication
     * @return Returns the token
     */
    @PostMapping("/create")
    public String token(Authentication authentication) {
        // Log the token request
        LOG.debug("Token requested for user: '{}'", authentication.getName());

        // Generate the token
        String token = tokenService.generateToken(authentication);

        // Log the result of the token generation
        if (token == null) LOG.error("Token could not be generated for user: '{}'", authentication.getName());
        else LOG.debug("Token granted: {}", token);

        // Return the token
        return token;
    }

}
