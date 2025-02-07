import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";
import cors from "cors";
import userRouter from "./user/userRouter";
import bookRoute from "./book/bookRouter";
import { config } from "./config/config";

const app = express();

app.use(
  cors({
    origin: config.frontendDomain,
  })
);

app.use(express.json());
// Routes
// app.get("/", (req, res) => {
//   res.json({ message: "ebook api" });
// });

app.use("/api/v1/users", userRouter);
app.use("/api/v1/books", bookRoute);

// Global error handler

app.use(globalErrorHandler);

export default app;
