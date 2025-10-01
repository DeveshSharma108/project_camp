import { ApiResponse } from "../utils/apiResponse.js";

const validate = (schema) => {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    // if validation was successful store the validated data in req.body and move to next
    if (result.success) {
      req.body = result.data;
      next();
      return;
    }

    // if validation failed respond back with the failed validation so that user can see what is failing
    const validationErrors = [];

    result.error.issues.forEach((issue) => {
      validationErrors.push({ [issue.path.join(".")]: issue.message });
    });
    // here the key of the pushed object is being computed on the go hence wrapped in []
    // required syntax else error
    // also used 'join' to join the multiple elements in path array by . and get as string
    // path is array if we simply use array as key js convert it into string ....

    res
      .status(400)
      .json(new ApiResponse(400, validationErrors, "Validation Failed...."));
  };
};
export { validate };
