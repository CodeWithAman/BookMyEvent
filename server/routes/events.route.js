import express from "express";
import {
  AuthProtect,
  AdminAuthProtect,
} from "../middlewares/auth.middleware.js";
import {
  GetAllEvents,
  GetEventById,
  CreateEvent,
  UpdateEvent,
  DeleteEvent,
} from "../controllers/event.controller.js";

const router = express.Router();

router.get("/", GetAllEvents);

router.get("/:id", GetEventById);

router.post("/", AuthProtect, AdminAuthProtect, CreateEvent);

router.put("/:id", AuthProtect, AdminAuthProtect, UpdateEvent);

router.delete("/:id", AuthProtect, AdminAuthProtect, DeleteEvent);

export default router;
