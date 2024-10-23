package com.rubenflinterman.api.config.security;

import com.nimbusds.jose.jwk.JWK;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.RSAKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import com.nimbusds.jose.jwk.source.JWKSource;
import com.nimbusds.jose.proc.SecurityContext;
import com.rubenflinterman.api.model.UserModel;
//import com.rubenflinterman.api.service.CustomUserDetailsService;
import com.rubenflinterman.api.service.UserService;
import com.sun.net.httpserver.BasicAuthenticator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import static org.springframework.security.config.Customizer.*;

@Configuration
@EnableWebSecurity
public class SecurityConfig {
    private final RsaKeyProperties jwtConfigProperties; // The RSA keys
    private final UserService userService; // The UserService

    /***
     * Constructor for the SecurityConfig
     * @param jwtConfigProperties The RSA keys
     */
    public SecurityConfig(RsaKeyProperties jwtConfigProperties, UserService userService) {
        this.jwtConfigProperties = jwtConfigProperties; // Set the RSA keys
        this.userService = userService; // Create a new instance of the UserService
    }

    /***
     * This is the configuration for the users
     * @return InMemoryUserDetailsManager
     */
    @Bean
    public InMemoryUserDetailsManager users() {
        // Create and return a user in memory (not for safe for production)
        return new InMemoryUserDetailsManager(User
                .withUsername("admin")
                .password("{noop}12345")
                .authorities("read")
                .build());
    }

//    /***
//     * This is the configuration for the user details service
//     * @return UserDetailsService
//     */
//    @Bean
//    public UserDetailsService userDetailsService() {
////        return new CustomUserDetailsService(userService).loadUserByUsername(user.getUsername());
//    }


    /***
     * This is the configuration for the security filter chain
     * @param http The HttpSecurity
     * @return SecurityFilterChain
     * @throws Exception
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)                                                          // Disable CSRF
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/p/**").permitAll()                                                 // Public endpoints should be accessible without a token
                        .anyRequest().authenticated()                                                           // All private/default requests should be authenticated
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)                                 // Disable session management (because we use JWT and disabled CSRF)
                )
                .oauth2ResourceServer(oauth2 -> oauth2                                                          // Use an OAuth2 resource server
                        .jwt(jwt -> jwt
                                .jwtAuthenticationConverter(jwtAuthenticationConverter())                       // Use the JwtAuthenticationConverter
                        )
                )
                .exceptionHandling(
                        (ex) -> ex.authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())          // Use the BearerTokenAuthenticationEntryPoint
                                .accessDeniedHandler(new BearerTokenAccessDeniedHandler()))                     // Use the BearerTokenAccessDeniedHandler
                .build();                                                                                       // Build the security filter chain
    }

    /***
     * This is the configuration for the JwtAuthenticationConverter
     * @return Converter<Jwt, ? extends AbstractAuthenticationToken>
     */
    private Converter<Jwt, ? extends AbstractAuthenticationToken> jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();  // Create a JwtGrantedAuthoritiesConverter
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");                                            // Set the authority prefix
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");                                       // Set claims for the authorities

        JwtAuthenticationConverter jwtAuthenticationConverter = new JwtAuthenticationConverter();           // Create a JwtAuthenticationConverter
        jwtAuthenticationConverter.setJwtGrantedAuthoritiesConverter(grantedAuthoritiesConverter);          // Set the JwtGrantedAuthoritiesConverter

        return jwtAuthenticationConverter;                                                                  // Return the JwtAuthenticationConverter
    }

    /***
     * This is the configuration for the token security filter chain
     * @param http The HttpSecurity
     * @return SecurityFilterChain
     */
    @Order(Ordered.HIGHEST_PRECEDENCE)
    @Bean
    SecurityFilterChain tokenSecurityFilterChain(HttpSecurity http) throws Exception {
        return http
                .securityMatcher(new AntPathRequestMatcher("/api/token/create"))                              // Only the create token endpoint can be accessed without a token
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().authenticated()                                                           // All other requests need a token
                )
                .sessionManagement(
                        session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )  // No session management
                .csrf(AbstractHttpConfigurer::disable)                                                          // Disable CSRF
                .exceptionHandling(ex -> {                                                                      // Exception handling
                    ex.authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint());                     // Use BearerTokenAuthenticationEntryPoint
                    ex.accessDeniedHandler(new BearerTokenAccessDeniedHandler());                               // Use BearerTokenAccessDeniedHandler
                })
                .httpBasic(withDefaults())                                                                      // Use HTTP Basic
                .build();                                                                                       // Build the security filter chain
    }

    /***
     * This is the configuration for the JwtDecoder
     * @return JwtDecoder
     */
    @Bean
    JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withPublicKey(jwtConfigProperties.publicKey()).build();                         // Create a JwtDecoder with the public key
    }

    /***
     * This is the configuration for the JwtEncoder
     * @return JwtEncoder
     */
    @Bean
    JwtEncoder jwtEncoder() {
        JWK jwk = new RSAKey.Builder(jwtConfigProperties.publicKey())
                .privateKey(jwtConfigProperties.privateKey())
                .build();                                                                                       // Create a JWK with the RSA keys
        JWKSource<SecurityContext> jwks = new ImmutableJWKSet<>(new JWKSet(jwk));                               // Create a JWKSource with the JWK from the RSA keys
        return new NimbusJwtEncoder(jwks);                                                                      // Return a NimbusJwtEncoder with the JWKSource
    }

    /***
     * This is the configuration for the CorsConfigurationSource
     * @return CorsConfigurationSource
     */
    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();                      // Create a CorsConfiguration

        configuration.setAllowedOrigins(List.of("https://localhost:3000"));         // localhost:3000 is the only allowed origin
        configuration.setAllowedHeaders(List.of("*"));                              // All headers are allowed
        configuration.setAllowedMethods(List.of("GET"));                            // Only GET requests are allowed

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource(); // Create a UrlBasedCorsConfigurationSource
        source.registerCorsConfiguration("/**", configuration);                  // Register the CorsConfiguration

        return source;                                                                  // Return the UrlBasedCorsConfigurationSource
    }
}