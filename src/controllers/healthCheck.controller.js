import { ApiResponse } from "../utils/apiResponse.js";

const healthCheck = (req, res) => {
  try {
    res.status(200).json(new ApiResponse(200, { message: "Okay...." }));
  } catch (error) {}
};

export default healthCheck;
