import { config as conf } from "dotenv";

conf();

const _cofig = {
  port: process.env.PORT,
  databaseUrl: process.env.MONGO_CONNECTION_STRING ,
  env:process.env.NODE_ENV
};

export const config = Object.freeze(_cofig);
