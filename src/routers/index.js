import express from "express";
import dataRouters from "./dataRouters.js";
import authRouters from "./authRouters.js";

const routers = express.Router();

routers.use(authRouters);
routers.use(dataRouters);

export default routers;