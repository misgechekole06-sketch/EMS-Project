import { Router } from "express";
import {
  changePassword,
  login,
  verifyUser,
} from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

const authRouter = Router();

authRouter.post("/login", login);
authRouter.get("/session", protect, verifyUser);

authRouter.post("/change-password", protect, changePassword);

export default authRouter;
