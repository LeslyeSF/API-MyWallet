import express from "express";
import { signIn, signUp } from "../controllers/authController.js";
import { validateLoginSchemaMiddleware } from "../middlewares/validateLoginSchemaMiddleware.js";
import { validateUserSchemaMiddleware } from "../middlewares/validateUserSchemaMiddleware.js";

const authRouters = express.Router();

authRouters.post("/register", validateUserSchemaMiddleware, signUp);
authRouters.post("/login", validateLoginSchemaMiddleware, signIn);

export default authRouters;

