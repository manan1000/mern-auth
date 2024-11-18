import { z } from "zod";
import bcrypt from "bcryptjs";
import { User } from "../../models/User.js";
import { generateVerificationToken } from "../../utils/generateVerificationToken.js";
import { generateTokenAndSetCookie } from "../../utils/generateTokenAndSetCookie.js";


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
            verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000
        });

        await user.save();
        generateTokenAndSetCookie(res,user._id);

        res.status(201).json({success: true , message: "User created successfully!"});


    } catch (error) {
        res.status(400).send({
            error: error.errors ? error.errors.map(e => e.message) : "An error occurred",
        });
    }
}


export const login = async (req, res) => {
    res.send("login");
}


export const logout = async (req, res) => {
    res.send("logout");
}