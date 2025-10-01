import { Router } from "express";
import { loginUser, registerUser } from "../controllers/auth.controller.js";
import { validate } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../validators/auth.validators.js";

const router = Router();
router.route("/register").post(validate(registerSchema), registerUser);
router.route("/login").post(validate(loginSchema), loginUser);
export default router;
