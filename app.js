import 'dotenv/config';
import express from "express";
import apiRoutes from "./routes/api.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const appName = process.env.APP_NAME;
const appPort = process.env.APP_PORT || 5001;

app.use("/api", apiRoutes);
app.use("**", (req, res) => {
  res.status(404).json({
    success: true,
    message: "Api not found"
  });
});

app.listen(appPort, () => {
  console.info(`${appName} is running at http://localhost:${appPort}`);
});