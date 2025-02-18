import express from "express";
import { createBook, updateBook,getAllBooks, getSingleBook, deleteBook } from "./bookController";
import path from "node:path";
import multer from "multer";
import authenticate from "../middleware/authenticate";

const bookRoute = express.Router();

// locally file store ->

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, // 30mb
});

bookRoute.post(
  "/",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

bookRoute.patch(
  "/:bookId",
  authenticate,
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  updateBook
);

bookRoute.get("/", getAllBooks);

// @ts-ignore
bookRoute.get("/:bookId", getSingleBook);
// @ts-ignore
bookRoute.delete("/:bookId",authenticate, deleteBook);


export default bookRoute;
