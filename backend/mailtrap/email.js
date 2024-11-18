import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify Your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Verification Email"
        });

        console.log("Email sent successfully ", response);

    } catch (error) {
        console.error("Error sending verification email: ", error.message);
    }
};


export const sendWelcomeEmail = async (email, name) => {
    const recipients = [{ email }];

    try {

        const response = await mailtrapClient.send({
            from: sender,
            to: recipients,
            template_uuid: "a8a73a76-4043-4a52-a345-28c050b4f8a1",
            template_variables: {
                "company_info_name": "Mern Auth",
                "name": name
            }
        });

        console.log("Welcome email sent successfully ", response);
        
    } catch (error) {
        console.error("Error sending welcome email: ", error.message);
        
    }
};

