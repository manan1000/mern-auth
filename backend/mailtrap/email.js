import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplate.js";
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



export const sendResetPasswordEmail = async (email, resetURL) => {
    const recipient = [{ email }];

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Reset your password",
            html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
            category: "Password reset email"
        });

        console.log("Reset password email sent successfully ", response);

    } catch (error) {
        console.error("Error sending reset password email: ", error.message);
    }
};


export const sendResetPasswordSuccessfulEmail = async (email) => {
    const recipient = [{ email }];
    try {

        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Password reset successful",
            html: PASSWORD_RESET_SUCCESS_TEMPLATE,
            category: "Password Reset successful email"
        });

        console.log("Reset password successful email sent successfully ", response);
        
    } catch (error) {
        console.error("Error sending reset password successful email: ", error.message);
    }
};
