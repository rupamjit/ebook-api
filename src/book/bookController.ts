import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";
import bookModel from "./bookModel";
import fs from "node:fs";
import { AuthRequest } from "../middleware/authenticate";
import createHttpError from "http-errors";

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

  const _req = req as AuthRequest;

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

const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  const { title, genre } = req.body;
  const bookId = req.params.bookId;

  const book = await bookModel.findById(bookId);

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "Unauthorized to update this book"));
  }

  // check image field exists or not

  const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  let completeCoverImage = "";
  if (files.coverImage) {
    const filename = files.coverImage[0].filename;
    const converMimeType = files.coverImage[0].mimetype.split("/").at(-1);
    // send files to cloudinary
    const filePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + filename
    );
    completeCoverImage = filename;
    const uploadResult = await cloudinary.uploader.upload(filePath, {
      filename_override: completeCoverImage,
      folder: "book-covers",
      format: converMimeType,
    });

    completeCoverImage = uploadResult.secure_url;
    await fs.promises.unlink(filePath);
  }
  // check if file field is exists.
  let completeFileName = "";
  if (files.file) {
    const bookFilePath = path.resolve(
      __dirname,
      "../../public/data/uploads/" + files.file[0].filename
    );

    const bookFileName = files.file[0].filename;
    completeFileName = bookFileName;

    const uploadResultPdf = await cloudinary.uploader.upload(bookFilePath, {
      resource_type: "raw",
      filename_override: completeFileName,
      folder: "book-pdfs",
      format: "pdf",
    });

    completeFileName = uploadResultPdf.secure_url;
    await fs.promises.unlink(bookFilePath);
  }

  const updatedBook = await bookModel.findOneAndUpdate(
    {
      _id: bookId,
    },
    {
      title: title,
      genre: genre,
      coverImage: completeCoverImage ? completeCoverImage : book.coverImage,
      file: completeFileName ? completeFileName : book.file,
    },
    { new: true }
  );

  res.json(updatedBook);
};

const getAllBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await bookModel.find().populate("author", "name");
    res.json(book);
  } catch (err) {
    return next(createHttpError(500, `Error while getting a book -> ${err}`));
  }
};

const getSingleBook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bookId = req.params.bookId;

  try {
    const book = await bookModel.findOne({ _id: bookId });

    if (!book) {
      return next(createHttpError(404, "Book not found"));
    }

    return res.json(book);
  } catch (error) {
    return next(createHttpError(500, `Error while getting ebook: ${error}`));
  }
};

const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  const bookId = req.params.bookId;

  const book = await bookModel.findOne({ _id: bookId });

  if (!book) {
    return next(createHttpError(404, "Book not found"));
  }

  const _req = req as AuthRequest;
  if (book.author.toString() !== _req.userId) {
    return next(createHttpError(403, "Unauthorized to update this book"));
  }

  const coverFileSplits = book.coverImage.split("/");

  const coverImagePublicId =
    coverFileSplits.at(-2) + "/" + coverFileSplits.at(-1)?.split(".").at(-2);

  const bookFileSplits = book.file.split("/");
  const bookFilePublicId = bookFileSplits.at(-2) + "/" + bookFileSplits.at(-1);
//   console.log("bookFilePublicId", bookFilePublicId);

  await cloudinary.uploader.destroy(coverImagePublicId);
  await cloudinary.uploader.destroy(bookFilePublicId, {
    resource_type: "raw",
  });

  const deletedBook = await bookModel.deleteOne({ _id: bookId });

  return res.status(204).json(deletedBook);
}

export { createBook, updateBook, getAllBooks, getSingleBook, deleteBook };
