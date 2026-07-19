import express from "express";
import {
  AuthProtect,
  AdminAuthProtect,
} from "../middlewares/auth.middleware.js";
import {
  SendBookingOTP,
  BookEvent,
  ConfirmBooking,
  GetMyBooking,
  CancleBooking,
} from "../controllers/booking.controller.js";

const router = express.Router();

router.post("/send-otp", AuthProtect, SendBookingOTP);

router.post("/", AuthProtect, BookEvent);

router.put("/:id/confirm", AuthProtect, AdminAuthProtect, ConfirmBooking);

router.get("/my", AuthProtect, GetMyBooking);

router.delete("/:id", AuthProtect, CancleBooking);

export default router;
