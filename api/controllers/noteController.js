import { getDB } from "../config/db.js";

export async function getNotes(userId) {
  const db = getDB();
  const notes = await db.collection("notes").find({ userId }).toArray();
  return notes;
}

export async function addNote(note) {
  const db = getDB();
  const result = await db.collection("notes").insertOne(note);
  return result; // result.insertedId
}

export async function updateNote(noteId, updateData) {
  const db = getDB();
  const result = await db
    .collection("notes")
    .updateOne({ _id: new ObjectId(noteId) }, { $set: updateData });
  return result; // result.modifiedCount
}

export async function deleteNote(noteId) {
  const db = getDB();
  const result = await db
    .collection("notes")
    .deleteOne({ _id: new ObjectId(noteId) });
  return result; // result.deletedCount
}
