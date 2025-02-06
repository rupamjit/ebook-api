
import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";

const app = express();

// Routes
app.get("/", (req, res) => {
  res.json({ message: "ebook api" });
});

// Global error handler


app.use(globalErrorHandler);


export default app;
