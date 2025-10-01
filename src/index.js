import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/index.js";

dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 8000;

try {
  await connectDB();
  try {
    app.listen(port, () => {
      console.log(
        `✅ Server started on port ${port} running in ${process.env.NODE_ENV} mode`,
      );
    });
  } catch (error) {
    console.error("❌ Error while starting app server");
    throw error;
  }
} catch (error) {
  console.error(error);
  console.log("Ending the process ⚙️  due to error");
  process.exit(1);
}
