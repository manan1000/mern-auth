import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplate.js";
import { mailtrapClient, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}];

    try{
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify Your Email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken),
            category: "Verification Email"
        });

        console.log("Email sent successfully ", response);
        
    } catch (error) {
        console.error("Error sending verification email: ", error.message);
        
        throw new Error("Error sending verification email: " + error.message);
    }
};
