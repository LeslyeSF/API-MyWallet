import express from "express";
import cors from "cors";
import routers from "./routers/index.js"

const server = express();
server.use(cors());
server.use(express.json());

server.use(routers);

server.listen(5000, ()=>{
  console.log("Running app in http://localhost:5000");
});

