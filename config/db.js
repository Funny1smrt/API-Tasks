import { MongoClient } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGO_URI;
if (!uri) throw new Error("MONGODB_URI не знайдено в .env");

const client = new MongoClient(uri, {
  serverSelectionTimeoutMS: 5000, // таймаут на підключення
  tls: true, // увімкнути TLS/SSL
});

let db;

export async function connectDB() {
  try {
    await client.connect();
    db = client.db("test"); // назва твоєї БД
    console.log("MongoDB connected to db: ", db.databaseName);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // зупинити сервер
  }
}

export function getDB() {
  if (!db) throw new Error("DB не підключено");
  return db;
}
