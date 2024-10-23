package com.rubenflinterman.api.config.security;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

/***
 * This is the configuration for the RSA key properties
 * @param publicKey The public key
 * @param privateKey The private key
 */
@ConfigurationProperties(prefix = "rsa")
public record RsaKeyProperties(RSAPublicKey publicKey, RSAPrivateKey privateKey) {
    // We only use this record to externalize the public and private key.
    // Do not add any content to this record.
}
