import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function getNotes(userId, reqQuery = {}) {
  const db = getDB();

  if (!userId) {
    throw new Error("userId обов’язковий");
  }

  const query = { userId };
  const jId = reqQuery.journalId;
  // --- 1. Фільтрація за Journal ID та All Notes ---

  if (jId && jId !== "undefined") {
    // ВИПАДОК А: Завантажуємо нотатки для КОНКРЕТНОГО ВІДКРИТОГО ЖУРНАЛУ
    query.journalId = jId;
  } else if (reqQuery.allNotes && reqQuery.allNotes !== "false") {
    // ВИПАДОК B: Завантажуємо ВСІ нотатки, які ПРИВ'ЯЗАНІ до БУДЬ-ЯКОГО журналу
    query.journalId = { $exists: true };
  } else {
    // ВИПАДОК С: Завантажуємо "ВІЛЬНІ" нотатки (які НЕ належать жодному журналу)
    // Цей випадок зазвичай використовується для загального списку або "Inbox".
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
