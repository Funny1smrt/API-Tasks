import fs from "fs";
import admin from "firebase-admin";

// Читаємо ключ
const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./firebaseKey.json", import.meta.url))
);

// Ініціалізація Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Експортуємо тільки admin для Auth
export const authAdmin = admin.auth();
