import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function getNote_components(userId, reqQuery = {}) {
  const db = getDB();

  if (!userId) {
    throw new Error("userId обов’язковий");
  }

  const query = { userId };

  const nId = reqQuery.noteId;
  // --- 1. Фільтрація за Journal ID та All Notes ---

  if (nId && nId !== "undefined") {
    // ВИПАДОК А: Завантажуємо нотатки для КОНКРЕТНОГО ВІДКРИТОГО ЖУРНАЛУ
    query.noteId = nId;
  }

  const notes = await db
    .collection("note_components")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return notes;
}

export async function addNote_component(note_component) {
  const db = getDB();
  const result = await db.collection("note_components").insertOne(note_component);
  return result;
}

export async function updateNote_component(note_componentId, updateData) {
  const db = getDB();
  const result = await db
    .collection("note_components")
    .updateOne({ _id: new ObjectId(String(note_componentId)) }, { $set: updateData });
  return result;
}

export async function deleteNote_component(note_componentId) {
  const db = getDB();
  const result = await db
    .collection("note_components")
    .deleteOne({ _id: new ObjectId(String(note_componentId)) });
  return result;
}
