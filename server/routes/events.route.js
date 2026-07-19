import express from "express"
import { AuthProtect, AdminAuthProtect } from "../middlewares/auth.middleware.js"
import { GetAllEvents, GetEventById, CreateEvent, UpdateEvent, DeleteEvent } from "../controllers/event.controller.js";


const router = express.Router();

// Get All the Event 
router.get('/', GetAllEvents);

// Get Evnet by ID 
router.get('/:id', GetEventById)

// Create Event (Admin Only)
router.post('/', AuthProtect, AdminAuthProtect, CreateEvent)

// Update Event (Admin Only) 
router.put('/:id', AuthProtect, AdminAuthProtect, UpdateEvent)

// Delete Event (Admin only)
router.delete('/:id', AuthProtect, AdminAuthProtect, DeleteEvent)

export default router;