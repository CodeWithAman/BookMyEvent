import mongoose from "mongoose";

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    enum: ["accountVerification", "eventBooking"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300, // OTP expires after 5 min
  },
});

const OTP = mongoose.model("OTP", OTPSchema);

export default OTP;
