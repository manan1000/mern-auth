import { z } from "zod";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import dotenv from "dotenv";

import { User } from "../../models/User.js";
import { generateVerificationToken } from "../../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../../utils/generateTokenAndSetCookie.js";
import { sendResetPasswordEmail, sendVerificationEmail, sendWelcomeEmail, sendResetPasswordSuccessfulEmail } from "../../mailtrap/email.js";

dotenv.config();


const signupSchema = z.object({
    email: z.string().email("Invalid email address!").nonempty("Email is required!"),
    password: z.string().min(6, "Password must be atleast 6 characters long!").nonempty("Password is required!"),
    name: z.string().min(2, "Name must be atleast 2 characters!").nonempty("Name is required!")
});


export const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        signupSchema.parse({ email, password, name });
        const userAlreadyExists = await User.findOne({ email });
        if (userAlreadyExists) {
            return res.status(409).json({ success: false, message: "User Already exists!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const verificationToken = generateVerificationToken();

        const user = new User({
            email: email,
            password: hashedPassword,
            name: name,
            verificationToken: verificationToken,
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000   // email template says 15 minutes but we are using 24 hours
        });

        await user.save();
        generateTokenAndSetCookie(res, user._id);
        await sendVerificationEmail(user.email, verificationToken);

        res.status(201).json({ success: true, message: "User created successfully!" });


    } catch (error) {
        res.status(400).send({
            error: error.errors ? error.errors.map(e => e.message) : "An error occurred",
        });
    }
}

export const verfyEmail = async (req, res) => {
    const { code } = req.body;
    try {

        const user = await User.findOne({
            verificationToken: code,
            verificationTokenExpiresAt: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400).json({ success: false, message: "Invalid or expired verification code!" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpiresAt = undefined;

        await user.save();
        await sendWelcomeEmail(user.email, user.name);
        res.status(200).json({ success: true, message: "Email verified successfully!" });

    } catch (error) {
        res.status(400).send({
            error: error.errors ? error.errors.map(e => e.message) : "An error occurred",
        });
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ success: false, message: "Invalid credentials!" });
        }

        generateTokenAndSetCookie(res, user._id);
        user.lastLogin = Date.now();

        await user.save();
        res.status(200).json({ success: true, message: "Logged in successfully!" });

    } catch (error) {
        console.error("Login error: ", error);

        res.status(400).send({
            error: error.errors ? error.errors.map(e => e.message) : "An error occurred",
        });
    }
}


export const logout = async (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ success: true, message: "Logged out successfully!" });
}


export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        const resetPasswordToken = crypto.randomBytes(20).toString("hex");
        const resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000;  // 1hr

        user.resetPasswordToken = resetPasswordToken;
        user.resetPasswordExpiresAt = resetPasswordExpiresAt;
        await user.save();

        const resetPasswordLink = `${process.env.CLIENT_URL}/reset-password/${resetPasswordToken}`;
        await sendResetPasswordEmail(user.email, resetPasswordLink);

        res.status(200).json({ success: true, message: "Reset password link sent successfully!" });
    } catch (error) {
        console.error("Forgot password error: ", error);

        res.status(400).send({
            error: error.errors ? error.errors.map(e => e.message) : "An error occurred",
        });
    }
}


export const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User.findOne({ resetPasswordToken: token, resetPasswordExpiresAt: { $gt: Date.now() } });
        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired reset password token!" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiresAt = undefined;

        await user.save();
        await sendResetPasswordSuccessfulEmail(user.email);
        res.status(200).json({ success: true, message: "Password reset successfully!" });

    } catch (error) {
        console.error("Reset password error: ", error);

        res.status(400).send({
            error: error.errors ? error.errors.map(e => e.message) : "An error occurred",
        });
    }
}


export const checkAuth = async (req, res) => {
    const userId = req.userId;
    try {

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found!" });
        }

        res.status(200).json({ success: true, message: "User authenticated successfully!", user: { ...user._doc, password: undefined } });

    } catch (error) {
        console.error("Check Auth error: ", error);

        res.status(400).send({
            error: error.errors ? error.errors.map(e => e.message) : "An error occurred",
        });
    }
}

