import crypto from "crypto";

export const generateSecretKey = () => {
  return crypto.randomBytes(18).toString("base64").replace(/[^a-zA-Z0-9]/g, '').slice(0, 24);
};
