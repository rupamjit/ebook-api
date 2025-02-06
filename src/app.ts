
import express from "express";
import globalErrorHandler from "./middleware/globalErrorHandler";

import userRouter from "./user/userRouter";
import bookRoute from "./book/bookRouter";

const app = express();
app.use(express.json())
// Routes
// app.get("/", (req, res) => {
//   res.json({ message: "ebook api" });
// });

app.use("/api/v1/users",userRouter)
app.use("/api/v1/books",bookRoute)


// Global error handler


app.use(globalErrorHandler);


export default app;
