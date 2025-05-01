import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Emulate __filename and __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read and process the service account JSON
const serviceAccount = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "firebase-service-account.json"),
    "utf-8"
  )
);

const jsonString = JSON.stringify(serviceAccount).replace(/\\n/g, "\\\\n");

fs.writeFileSync(
  path.join(__dirname, ".env-ready.txt"),
  `FIREBASE_SERVICE_ACCOUNT_JSON=${jsonString}`
);
