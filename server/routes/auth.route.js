import express from "express";
import {
  RegisterUser,
  LoginUser,
  VerifyOTP,
} from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/register", RegisterUser);
router.post("/login", LoginUser);
router.post("/verify-otp", VerifyOTP);

export default router;
