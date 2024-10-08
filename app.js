import "dotenv/config";
import express from "express";
import apiRoutes from "./routes/api.js";
import connectDB from "./config/db.js";
import cors from "cors";
import fileUpload from "express-fileupload";

const app = express();
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(fileUpload({ useTempFiles: true }));

// Database connection
connectDB();

app.use("/api", apiRoutes);
app.use("**", (req, res) => {
  res.status(404).json({
    success: true,
    message: "Api not found"
  });
});

const appName = process.env.APP_NAME;
const appPort = process.env.APP_PORT || 5001;

// Express server start
app.listen(appPort, () => {
  console.info(`${appName} is running at http://localhost:${appPort}`);
});
