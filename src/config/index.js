import dotenv from 'dotenv';
dotenv.config();

const config = {
  PORT: process.env.PORT || 8080,
  DEV_MODE: process.env.DEV_MODE,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET ,
  JWT_EXPIRE: process.env.JWT_EXPIRE,
};

export default config;
