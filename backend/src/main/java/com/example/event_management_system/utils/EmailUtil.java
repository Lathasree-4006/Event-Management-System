// package com.example.event_management_system.utils;

// import org.springframework.beans.factory.annotation.Autowired;
// import org.springframework.mail.SimpleMailMessage;
// import org.springframework.mail.javamail.JavaMailSender;
// import org.springframework.stereotype.Component;

// @Component
// public class EmailUtil {

//     @Autowired
//     private JavaMailSender mailSender;

//     public void sendOtpEmail(String toEmail, String otp) {

//         SimpleMailMessage message = new SimpleMailMessage();
//         message.setTo(toEmail);
//         message.setSubject("Your OTP for Registration");
//         message.setText(
//                 "Dear User,\n\n" +
//                         "Your OTP for registration is: " + otp + "\n\n" +
//                         "This OTP is valid for 5 minutes.\n\n" +
//                         "Thank you,\nCommunity Connect Team"
//         );

//         mailSender.send(message);
//     }

//     public void sendEmail(String toEmail, String subject, String body) {
//         SimpleMailMessage message = new SimpleMailMessage();
//         message.setTo(toEmail);
//         message.setSubject(subject);
//         message.setText(body);
//         mailSender.send(message);
//     }
// }

package com.example.event_management_system.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

@Component
public class EmailUtil {

    @Value("${BREVO_API_KEY}")
    private String brevoApiKey;

    @Value("${BREVO_FROM_EMAIL}")
    private String fromEmail;

    @Value("${BREVO_FROM_NAME:Community Connect}")
    private String fromName;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    // Registration OTP email
    public void sendOtpEmail(String toEmail, String otp) {

        String body =
                "Dear User,\n\n" +
                "Your OTP for registration is: " + otp + "\n\n" +
                "This OTP is valid for 5 minutes.\n\n" +
                "Thank you,\nCommunity Connect Team";

        sendEmail(
                toEmail,
                "Your OTP for Registration",
                body
        );
    }

    // Password reset and notification emails
    public void sendEmail(
            String toEmail,
            String subject,
            String body
    ) {
        try {
            Map<String, Object> sender = Map.of(
                    "name", fromName,
                    "email", fromEmail
            );

            Map<String, Object> recipient = Map.of(
                    "email", toEmail
            );

            Map<String, Object> payload = Map.of(
                    "sender", sender,
                    "to", List.of(recipient),
                    "subject", subject,
                    "textContent", body
            );

            String json = objectMapper.writeValueAsString(payload);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(
                            "https://api.brevo.com/v3/smtp/email"))
                    .timeout(Duration.ofSeconds(20))
                    .header("accept", "application/json")
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(
                            json, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString()
            );

            if (response.statusCode() < 200 ||
                    response.statusCode() >= 300) {

                System.err.println(
                        "Brevo API error. HTTP status: " +
                        response.statusCode() +
                        ". Response: " + response.body()
                );

                throw new IllegalStateException(
                        "Brevo rejected the email request. HTTP " +
                        response.statusCode()
                );
            }

            System.out.println(
                    "Brevo accepted the email request for: " +
                    toEmail
            );

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException(
                    "Email sending was interrupted.", e
            );

        } catch (IOException e) {
            throw new IllegalStateException(
                    "Could not communicate with Brevo.", e
            );
        }
    }
}
