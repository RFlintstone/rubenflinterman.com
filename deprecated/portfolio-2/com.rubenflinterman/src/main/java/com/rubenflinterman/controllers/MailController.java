package com.rubenflinterman.controllers;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import com.resend.services.emails.model.CreateEmailOptions;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import com.resend.services.contacts.model.CreateContactResponseSuccess;

import com.rubenflinterman.models.ContactsResponse;
import com.rubenflinterman.models.emaillist.EmailList;
import com.rubenflinterman.services.ResendApiClient;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@Path("/mail")
public class MailController {
    @ConfigProperty(name = "RESEND_SECRET_KEY")
    String resendSecretKey;

    public MailController() {
    }

    @POST()
    @Path("/mail-list")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response addToEmailList(EmailList userForm) throws Exception {
        System.out.println("Received user: " + userForm.getName() + " with email: " + userForm.getEmail() + " with howFindUs: " + userForm.getHowFindUs() + " with stayUpdated: " + userForm.isStayUpdated() + " with agreed: " + userForm.isAgreed());

        // If user agreed to receive emails
        if (userForm.isAgreed()) {
            ResendApiClient client = new ResendApiClient(resendSecretKey);

            // Check if the contact already exists in the audience
            ContactsResponse response = client.listContacts("0a05540c-5356-44c7-adeb-d3c7da5b72a8");
            boolean contactExists = response.getData().stream().anyMatch(contact -> contact.getEmail().equals(userForm.getEmail()));

            // Return conflict response if the contact already exists
            if (contactExists)
                return Response.status(Response.Status.CONFLICT).entity("{\"Status\": 409, \"User\": \"" + "Exists" + "\"}").type(MediaType.APPLICATION_JSON).build();

            // Proceed to add the contact if it doesn't exist
            CreateContactResponseSuccess newContact = client.createContact(userForm.getName(), userForm.getHowFindUs(), userForm.getEmail(), "0a05540c-5356-44c7-adeb-d3c7da5b72a8");

            // Prepare email to confirm mailing-list subscription
            CreateEmailOptions emailParams = CreateEmailOptions.builder().from("ProjectsIncluded <noreply@updates.projectsincluded.net>").to(userForm.getEmail()).html(getHtmlTemplate("welcome_email.html", userForm)).subject("Mailinglist Confirmation - Welcome!").build();

            // Send the actual email
            client.sendEmail(emailParams);
        }

        // Return success response
        return Response.status(200).entity("{\"Status\": 200, \"User\": \"" + "OK" + "\"}").type(MediaType.APPLICATION_JSON).build();
    }

    private String getHtmlTemplate(String fileName, EmailList userForm) {
        try (InputStream inputStream = getClass().getClassLoader().getResourceAsStream(fileName)) {
            if (inputStream == null) {
                throw new Exception(fileName + " not found");
            }

            // First, get the raw template content
            String templateContent = new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);

            // Now process the template by replacing placeholders
            return processTemplate(templateContent, userForm);
        } catch (Exception e) {
            System.err.println("Error loading email template: " + e.getMessage());
            return "<html><body><h1>Welcome to the mailinglist!</h1></body></html>";
        }
    }

    private String processTemplate(String template, EmailList userForm) {
        // Create a pattern that matches {placeholder} format
        Pattern pattern = Pattern.compile("\\{([^}]+)}");
        Matcher matcher = pattern.matcher(template);

        // Use StringBuffer for efficient string replacement
        StringBuilder processedTemplate = new StringBuilder();

        // Process each placeholder found in the template
        while (matcher.find()) {
            // Get the placeholder name without the curly braces
            String placeholder = matcher.group(1);

            // Get the replacement value based on the placeholder
            String replacement = getReplacementValue(placeholder, userForm);

            // Escape any special regex characters in the replacement string
            replacement = Matcher.quoteReplacement(replacement);

            // Replace the placeholder with the actual value
            matcher.appendReplacement(processedTemplate, replacement);
        }

        // Append any remaining template content
        matcher.appendTail(processedTemplate);

        return processedTemplate.toString();
    }

    private String getReplacementValue(String placeholder, EmailList userForm) {
        // Convert placeholder to lowercase for case-insensitive matching
        return switch (placeholder.toLowerCase()) {
            case "name" -> userForm.getName() != null ? userForm.getName() : "";
            case "email" -> userForm.getEmail() != null ? userForm.getEmail() : "";
            case "date" -> LocalDate.now().format(DateTimeFormatter.ofPattern("MMMM d, yyyy"));
            default -> {
                // Return empty string for unknown placeholders
                System.err.println("Warning: Unknown placeholder '" + placeholder + "' found in template");
                yield "";
            }
        };
    }
}
