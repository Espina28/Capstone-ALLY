package com.wachichaw.EmailConfig.Service;

// Import classes from the MailerSend SDK
import com.mailersend.sdk.MailerSend;
import com.mailersend.sdk.emails.Email;
import com.mailersend.sdk.exceptions.MailerSendException;
// Import Spring classes for component and value injection
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

// Remove imports for JavaMailSender, MimeMessageHelper, MimeMessage, and MessagingException

@Service
public class EmailService {

    // 1. INJECT API KEY: Inject the API key from your Render environment variable
    //    The key in Render MUST be set to MAILERSEND_API_KEY
    @Value("${MAILERSEND_API_KEY}") 
    private String apiToken;

    // 2. DEFINE SENDER: Hardcode the trial domain sender provided by MailerSend
    private final String FROM_EMAIL = "MS_wvNJ9M@test-2p0347zv7d3lzdrn.mlsender.net"; 
    private final String FROM_NAME = "Ally Team";


    // The mailSender (JavaMailSender) is no longer needed:
    // @Autowired
    // private JavaMailSender mailSender;


    public void sendEmail(String to, String subject, String body) {
        if (!StringUtils.hasText(to) || !StringUtils.hasText(subject) || !StringUtils.hasText(body)) {
            throw new IllegalArgumentException("Email to, subject, and body must not be empty");
        }

        // 3. INITIALIZE MAILERSEND CLIENT
        // This object handles the connection over HTTPS (Port 443)
        MailerSend mailersend = new MailerSend(apiToken);
        
        // 4. BUILD EMAIL USING MAILERSEND SDK OBJECTS
        Email email = new Email();
        
        try {
            // Set sender details
            email.setFrom(FROM_EMAIL, FROM_NAME); 
            
            // Add the recipient. MailerSend API uses the recipient email/name pattern
            email.addRecipient(to, ""); 
            
            // Set subject and content
            email.setSubject(subject);
            email.setHtml(body); // Use setHtml() since your body is HTML
            
            // 5. SEND THE EMAIL VIA API CALL
            mailersend.emails().send(email);

            System.out.println("Email sent successfully via MailerSend API to: " + to);
            
        } catch (MailerSendException e) {
            // Catch the specific exception thrown by the MailerSend SDK
            System.out.println("Error sending email via API to: " + to + ". Reason: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to send email to " + to, e);
        }
        // Removed try/catch block for jakarta.mail.MessagingException
    }

    public void sendAppointmentReminder(String to, String userName, java.time.LocalDateTime appointmentTime, String userType) {
        String subject = "Appointment Reminder";
        String body = "<html>" +
                "<body>" +
                "<h3>Hi " + userName + ",</h3>" +
                "<p>This is a reminder for your upcoming appointment on " + appointmentTime.toLocalDate() + " at " + appointmentTime.toLocalTime() + ".</p>" +
                "<p>Thank you,</p>" +
                "<p>Ally Team</p>" +
                "</body>" +
                "</html>";
        sendEmail(to, subject, body);
    }
}
