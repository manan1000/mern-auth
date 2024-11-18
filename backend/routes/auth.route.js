import express from "express";
import { signup, login, logout, verfyEmail } from "./controllers/auth.controller.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);
router.post("/verify-email", verfyEmail);

export default router;