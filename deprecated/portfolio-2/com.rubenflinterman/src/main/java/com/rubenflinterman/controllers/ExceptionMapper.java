package com.rubenflinterman.controllers;

import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.Provider;

import java.io.InputStream;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;

@Provider
public class ExceptionMapper implements jakarta.ws.rs.ext.ExceptionMapper<NotFoundException> {
    @Override
    public Response toResponse(NotFoundException exception) {
        try (InputStream inputStream = getClass().getClassLoader()
                .getResourceAsStream("META-INF/resources/index.html")) {
            if (inputStream == null) {
                throw new Exception("index.html not found");
            }

            String indexHtml = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            return Response.status(Response.Status.NOT_FOUND)
                    .entity(indexHtml)
                    .type("text/html")
                    .build();
        } catch (Exception e) {
            // Fallback in case of error
            return Response.status(Response.Status.NOT_FOUND)
                    .entity("<html><body><h1>404 - Not Found</h1></body></html>")
                    .type("text/html")
                    .build();
        }
    }
}
