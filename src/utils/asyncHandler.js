// It is a higher order function that takes a function and as an input and gives a new function as output 
// that utilizes the input function ..............

const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    // requestHandler may be sync or async
    Promise.resolve(requestHandler(req, res, next))
      .catch((err) => next(err)); // forward any error to Express middleware 
  };
};

export {asyncHandler}