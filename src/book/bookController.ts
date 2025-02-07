import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middleware/authenticate";

const createBook = async (req: Request, res: Response) => {
  const { title, genre } = req.body;

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };

  const coverImageMimetype = files.coverImage[0].mimetype.split("/").at(-1);

  const filename = files.coverImage[0].filename;

  const filePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    filename
  );

  const uploadResult = await cloudinary.uploader.upload(filePath, {
    filename_override: __filename,
    folder: "book-covers",
    format: coverImageMimetype,
  });

  const bookFileName = files.file[0].filename;
  const bookFilePath = path.resolve(
    __dirname,
    "../../public/data/uploads",
    bookFileName
  );

  const bookFileUploadResult = await cloudinary.uploader.upload(bookFilePath, {
    resource_type: "raw",
    filename_override: bookFilePath,
    folder: "book-pdfs",
    format: "pdf",
  });

  console.log("bookFileUploadResult", bookFileUploadResult);
  console.log("uploadResult:", uploadResult);

const _req= req as AuthRequest;

//   console.log("User Id",_req.userId)

  const newBook = await bookModel.create({
    title,
    genre,
    author: _req.userId,
    coverImage: uploadResult.secure_url,
    file: bookFileUploadResult.secure_url,
  });

  await fs.promises.unlink(filePath);
  await fs.promises.unlink(bookFilePath);

  res.status(201).json({ id: newBook._id, newBook });

};

export { createBook };
