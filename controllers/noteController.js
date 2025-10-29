import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function getNotes(userId, reqQuery = {}) {
  const db = getDB();

  const query = { userId };
  const jId = reqQuery.journalId;
  const isTask = reqQuery.isTask;
  console.log("isTask:", isTask);
  console.log("jId:", jId);

  if (jId && jId !== "undefined") {
    // ВИПАДОК А: Завантажуємо нотатки для КОНКРЕТНОГО ВІДКРИТОГО ЖУРНАЛУ
    query.journalId = jId;
  } else if (isTask === "true") {
    // ВИПАДОК ДОДАТКОВИЙ: Завантажуємо лише нотатки, які є завданнями
    query.isTask = true;
  } else if (reqQuery.allNotes && reqQuery.allNotes !== "false") {
    // ВИПАДОК B: Завантажуємо ВСІ нотатки, які ПРИВ'ЯЗАНІ до БУДЬ-ЯКОГО журналу
    query.journalId = { $exists: true };
  } else {
    // ВИПАДОК С: Нічого не вказано - не завантажуємо нотатки
    return;
  }

  const notes = await db
    .collection("notes")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return notes;
}

export async function addNote(note) {
  const db = getDB();
  const result = await db.collection("notes").insertOne(note);
  return result;
}

export async function updateNote(noteId, updateData) {
  const db = getDB();
  const result = await db
    .collection("notes")
    .updateOne({ _id: new ObjectId(String(noteId)) }, { $set: updateData });
  return result;
}

export async function deleteNote(noteId) {
  const db = getDB();
  const result = await db
    .collection("notes")
    .deleteOne({ _id: new ObjectId(String(noteId)) });
  return result;
}
