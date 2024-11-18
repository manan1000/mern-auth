import express from "express";
import { signup, login, logout, verfyEmail, forgotPassword } from "./controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/verify-email", verfyEmail);
router.post("/forgot-password", forgotPassword);

export default router;