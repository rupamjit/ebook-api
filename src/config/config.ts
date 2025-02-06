import { config as conf } from "dotenv";

conf();

const _cofig = {
  port: process.env.PORT,
};

export const config = Object.freeze(_cofig);
