import { ApiResponse } from "../utils/apiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js"
import { healthLogger } from "../utils/healthCheckLogger.js";
import os from "os"

// Using the higher order function asyncHandler ........
// this style requires needs intensive use of try catch ....
// const healthCheck = (req, res) => {
//   try {
//     res.status(200).json(new ApiResponse(200, { message: "Okay...." }));
//   } catch (error) {
//     next(error)
//   }
// };


const healthCheck = asyncHandler(async (req,res) => {
  
  const payload = {
    status: "OK",
    timestamp: new Date().toISOString(),
    node_version: process.version,
    uptime: `${process.uptime().toFixed(0)}s`,
    memory_usage: `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB`,
    platform: os.platform(),
    method: req.method,
    url: req.originalUrl,
    ip: req.ip,
    user_agent: req.get("user-agent"),
  };

  await healthLogger(payload)
  res.status(200).json(new ApiResponse(200, payload));
})


export default healthCheck;
