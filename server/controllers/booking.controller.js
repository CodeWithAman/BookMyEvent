import Booking from "../models/booking.model.js";
import OTP from "../models/otp.model.js";
import Event from "../models/event.model.js";
import { SendOTPEmail, SendBookingEmail } from "../utils/email.service.js";

const genOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const SendBookingOTP = async (req, res) => {
  try {
    const otp = genOTP();
    await OTP.findOneAndDelete({
      email: req.user.email,
      action: "eventBooking",
    });
    await OTP.create({ email: req.user.email, otp, action: "eventBooking" });
    await SendOTPEmail(req.user.email, otp, "eventBooking");

    res.json({ message: "OTP Sent Successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error sending OTP", error: error.message });
  }
};

export const BookEvent = async (req, res) => {
  try {
    const { eventId, otp } = req.body;

    // Verify OTP explicitly before proceeding
    const validOTP = await OTP.findOne({
      email: req.user.email,
      otp,
      action: "eventBooking",
    });
    if (!validOTP) {
      return res
        .status(400)
        .json({ message: "Invalid or expired OTP for booking" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    if (event.availableSeats <= 0) {
      return res.status(400).json({ message: "No seats available" });
    }

    const existingBooking = await Booking.findOne({
      userId: req.user.id,
      eventId,
    });
    if (existingBooking && existingBooking.status !== "cancelled") {
      return res.status(400).json({ message: "Already booked or pending" });
    }

    const booking = await Booking.create({
      userId: req.user.id,
      eventId,
      status: "pending",
      paymentStatus: "not_paid",
      amount: event.ticketPrice,
    });

    await OTP.deleteOne({ _id: validOTP._id }); // cleanup

    res.status(201).json({ message: "Booking request submitted", booking });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const ConfirmBooking = async (req, res) => {
  try {
    const { paymentStatus } = req.body; // 'paid' or 'not_paid'
    const booking = await Booking.findById(req.params.id)
      .populate("userId")
      .populate("eventId");
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (booking.status === "confirmed")
      return res.status(400).json({ message: "Booking is already confirmed" });

    const event = await Event.findById(booking.eventId._id);
    if (event.availableSeats <= 0) {
      return res
        .status(400)
        .json({ message: "No seats available to confirm this booking" });
    }

    booking.status = "confirmed";
    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }
    await booking.save();

    event.availableSeats -= 1;
    await event.save();

    // Send email on admin confirmation
    await SendBookingEmail(
      booking.userId.email,
      booking.userId.name,
      booking.eventId.title,
    );

    res.json({ message: "Booking confirmed successfully", booking });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const GetMyBooking = async (req, res) => {
  try {
    const bookings =
      req.user.role === "admin"
        ? await Booking.find()
            .populate("eventId")
            .populate("userId", "name email")
            .sort({ createdAt: -1 })
        : await Booking.find({ userId: req.user.id })
            .populate("eventId")
            .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const CancleBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (
      booking.userId.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }
    if (booking.status === "cancelled")
      return res.status(400).json({ message: "Already cancelled" });

    const wasConfirmed = booking.status === "confirmed";

    booking.status = "cancelled";
    await booking.save();

    // Only restore the seat if it was actually confirmed and deducted
    if (wasConfirmed) {
      const event = await Event.findById(booking.eventId);
      if (event) {
        event.availableSeats += 1;
        await event.save();
      }
    }

    res.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
