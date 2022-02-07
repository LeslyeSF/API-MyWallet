import express from "express";
import { getData, inputRecord, deleteRecord, endSession, editRecord } from "../controllers/dataController.js";
import { validateRecordSchemaMiddleware } from "../middlewares/validateRecordSchemaMiddleware.js";
import { verifyTokenMiddleware } from "../middlewares/verifyTokenMiddleware.js";

const dataRouters = express.Router();

dataRouters.use(verifyTokenMiddleware);

dataRouters.get("/data", getData);
dataRouters.post("/records", validateRecordSchemaMiddleware, inputRecord);
dataRouters.delete("/deleterecord", deleteRecord);
dataRouters.delete("/endsession", endSession);
dataRouters.post("/editrecord", validateRecordSchemaMiddleware, editRecord);

export default dataRouters;