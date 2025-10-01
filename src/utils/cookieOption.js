const getCookieOption = () => {
  const nodeEnv = process.env.NODE_ENV;
  const isProduction = nodeEnv === "production";

  return {
    httpOnly: true, // makes cookie inaccessible to JavaScript (protects against XSS)
    secure: isProduction, // cookie only sent over HTTPS in production

    // sameSite: isProduction ? "strict" : "lax", // controls whether cookies are sent with cross-site requests
    // maxAge: 15 * 60 * 1000                      // sets cookie expiry time (in ms) from creation
  };
};

export { getCookieOption };
