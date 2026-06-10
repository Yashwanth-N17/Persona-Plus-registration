import express from "express";
import cors from "cors";
import handler from "../api/send-registration-email.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.all("/api/send-registration-email", async (req, res) => {
  await handler(req, res);
});

app.listen(PORT, () => {
  console.log(`Local Email API Server running at http://localhost:${PORT}`);
});
