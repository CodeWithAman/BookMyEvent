import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { sendOTPEmail } from "../utils/email.service.js";
import OTP from "../models/otp.model.js";
import jwt from "jsonwebtoken";

const genToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// register User
export const RegisterUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User.create({
      name,
      email,
      password: hashedPassword,
      role: "user",
      isVerified: false,
    });

    const otp = Math.floor(Math.random() * 900000 + 100000).toString();
    // console.log(`OTP for ${email}: ${otp}`);

    await OTP.create({ email, otp, action: "accountVerification" });

    await sendOTPEmail(email, otp, "accountVerification");

    res.status(201).json({
      message:
        "User registered successfully. Please check your email for OTP to verify your account.",
      email: user.email,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// LoginUser
export const LoginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(400)
        .json({ error: "Invalid credential, Please Sign Up first" });
    }

    const isMatchPass = await bcrypt.compare(password, user.password);
    if (!isMatchPass) {
      return res
        .status(400)
        .json({ error: "Invalid credential / Incorrect Password" });
    }

    if (!user.isVerified && user.role === "user") {
      const otp = Math.floor(Math.random() * 900000 + 100000).toString();
      await OTP.deleteMany({ email, action: "accountVerification" });
      await OTP.create({ email, otp, action: "accountVerification" });
      await sendOTPEmail(email, otp, "accountVerification");
      return res.status(400).json({
        error: "Account not verified. A new OTP has been sent to your email.",
      });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: genToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// VerifyOTP
export const VerifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const vaildOTP = await OTP.findOne({
      email,
      otp,
      action: "accountVerification",
    });
    if (!vaildOTP) {
      return res.status(400).json({ message: "Invalid or Expired OTP" });
    }

    const user = await User.findOneAndUpdate(
      { email },
      { isVerified: true },
      { new: true },
    );
    await OTP.deleteOne({ _id: vaildOTP._id });

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: genToken(user.id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
