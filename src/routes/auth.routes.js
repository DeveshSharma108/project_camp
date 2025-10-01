import { Router } from "express";
import { registerUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema } from "../validators/auth.validators.js";

const router = Router();
router.route("/register").post(validate(registerSchema), registerUser);
export default router;
