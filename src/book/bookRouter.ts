import express from "express";
import { createBook } from "./bookController";
import path from "node:path";
import multer from "multer";

const bookRoute = express.Router();

// locally file store ->

const upload = multer({
  dest: path.resolve(__dirname, "../../public/data/uploads"),
  limits: { fileSize: 3e7 }, // 30mb
});

bookRoute.post(
  "/",
  upload.fields([
    { name: "coverImage", maxCount: 1 },
    { name: "file", maxCount: 1 },
  ]),
  createBook
);

export default bookRoute;
