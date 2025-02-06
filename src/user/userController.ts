import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import userModel from "./userModel";
import bcrypt from "bcrypt";
import { sign } from "jsonwebtoken";
import { config } from "../config/config";
import { User } from "./userTypes";

const createUser = async (req: Request, res: Response, next: NextFunction) => {
  const { name, email, password } = req.body;

  // validation
  if (!name || !email || !password) {
    const error = createHttpError(400, "All fields are required");
    return next(error);
  }

  const user = await userModel.findOne({ email: email });

  if (user) {
    const error = createHttpError(400, "User Already Exists With This Email");
    return next(error);
  }

  // password -> hash

  const hashPassword = await bcrypt.hash(password, 10);

  const newUser: User = await userModel.create({
    name,
    email,
    password: hashPassword,
  });

  const token = sign({ sub: newUser._id }, config.jwtSecret as string, {
    expiresIn: "7d",
  });

  res.status(201).json({ user: newUser, acessToken: token });
};

const loginUser = async (req: Request, res: Response, next: NextFunction) => {
  const { email, password } = req.body;

  // validation
  if (!email || !password) {
    return next(createHttpError(400, "All the fields are required"));
  }

  const user = await userModel.findOne({email});

  if(!user){
    return next(createHttpError(404,"User Not Found!!!"))
  }

  const isMatch = await bcrypt.compare(password,user.password);

  if(!isMatch){
    return next(createHttpError(400,"Password does not match"))
  }

  const token = sign({sub:user._id},config.jwtSecret as string, {expiresIn:"7d"})

  res.status(200).json({accessToken:token})

};

export { createUser, loginUser };
