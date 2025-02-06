import { NextFunction, Request, Response } from "express";
import cloudinary from "../config/cloudinary";
import path from "node:path";

const createBook = async (req: Request, res: Response, nest: NextFunction) => {
  // const {} = req.body;
//   console.log("files", req.files);

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
   resource_type:"raw",
   filename_override:bookFilePath,
   folder:"book-pdfs",
   format:"pdf"
  }); 

console.log("bookFileUploadResult",bookFileUploadResult);
  console.log("uploadResult:", uploadResult);

  res.json({})
};

export { createBook };
