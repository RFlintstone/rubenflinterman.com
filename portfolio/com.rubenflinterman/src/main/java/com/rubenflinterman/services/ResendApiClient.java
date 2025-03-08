package com.rubenflinterman.services;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.contacts.model.CreateContactOptions;
import com.resend.services.contacts.model.CreateContactResponseSuccess;
import com.resend.services.emails.model.CreateEmailOptions;
import com.rubenflinterman.models.ContactsResponse;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;

import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URI;
import java.time.Duration;

public class ResendApiClient {
    private static final String API_BASE_URL = "https://api.resend.com";
    private static final int MAX_RETRIES = 3;
    private static final long INITIAL_BACKOFF_MS = 1000; // 1 second

    private final String apiKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    /**
     * Create a new Resend API client
     *
     * @param apiKey the API key to use for authentication
     */
    public ResendApiClient(String apiKey) {
        this.apiKey = apiKey;

        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();

        this.objectMapper = new ObjectMapper()
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
                .registerModule(new JavaTimeModule());
    }

    /**
     * List all contacts in an audience
     *
     * @param audienceId the ID of the audience to list contacts from
     * @return the list of contacts
     * @throws Exception if the API call fails
     */
    public ContactsResponse listContacts(String audienceId) throws Exception {
        int attempts = 0;
        Exception lastException = null;

        while (attempts < MAX_RETRIES) {
            try {
                // Add a small delay before each request to respect rate limiting
                if (attempts > 0) {
                    // Calculate exponential backoff: 1s, 2s, 4s
                    long backoffMs = INITIAL_BACKOFF_MS * (long) Math.pow(2, attempts - 1);
                    Thread.sleep(backoffMs);
                }

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(API_BASE_URL + "/audiences/" + audienceId + "/contacts"))
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .GET()
                        .build();

                HttpResponse<String> response = httpClient.send(request,
                        HttpResponse.BodyHandlers.ofString());

                // If we get a rate limit error, retry
                if (response.statusCode() == 429) {
                    attempts++;
                    lastException = new RuntimeException("Rate limit exceeded, attempt " + attempts);
                    continue;
                }

                // For other error codes, throw an exception
                if (response.statusCode() != 200) {
                    throw new RuntimeException("API call failed with status: " +
                            response.statusCode() + " and body: " + response.body());
                }

                // Success! Parse and return the response
                return objectMapper.readValue(response.body(), ContactsResponse.class);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw e;
            } catch (Exception e) {
                attempts++;
                lastException = e;

                // If this was our last attempt, throw the exception
                if (attempts >= MAX_RETRIES) {
                    throw new RuntimeException("Failed after " + MAX_RETRIES +
                            " attempts. Last error: " + e.getMessage(), e);
                }
            }
        }

        // If we got here, we exhausted our retries
        throw new RuntimeException("Failed after " + MAX_RETRIES + " attempts. Last error: " + lastException.getMessage(), lastException);
    }

    /**
     * Create a new contact in an audience
     *
     * @param firstName  the first name of the contact
     * @param lastName   the last name of the contact
     * @param email      the email address of the contact
     * @param audienceId the ID of the audience to add the contact to
     * @return the response from the API
     */
    public CreateContactResponseSuccess createContact(String firstName, String lastName, String email, String audienceId) {
        try {
            CreateContactOptions user = CreateContactOptions.builder()
                    .firstName(firstName != null ? firstName : "")
                    .lastName(lastName != null ? lastName : "")
                    .email(email != null ? email : "")
                    .audienceId(audienceId != null ? audienceId : "")
                    .build();

            System.out.println("Added new user: " + email);

            return new Resend(apiKey).contacts().create(user);
        } catch (ResendException e) {
            throw new RuntimeException("Failed to create contact: " + e.getMessage(), e);
        }
    }

    /***
     * Send an email using the Resend API
     *
     * @param emailParams the email parameters
     * @throws Exception if the API call fails
     */
    public void sendEmail(CreateEmailOptions emailParams) throws Exception {
        int retryCount = 0;
        int maxRetries = 5;
        long waitTime = 1000;
        while (retryCount < maxRetries) {
            try {
                new Resend(apiKey).emails().send(emailParams);
                break;
            } catch (ResendException e) {
                if (e.getMessage().contains("rate_limit_exceeded")) {
                    Thread.sleep(waitTime);
                    waitTime *= 2; // Verhoog wachttijd exponentieel
                    retryCount++;
                } else {
                    throw e; // Gooi andere fouten direct opnieuw
                }
            }
        }
    }
}