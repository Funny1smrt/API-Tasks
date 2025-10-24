import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function getNotes(userId, reqQuery={}) {
  const db = getDB();

  if (!userId) {
    throw new Error("userId обов’язковий");
  }

  const query = { userId };

  if (reqQuery.journalId && reqQuery.journalId !== "undefined") {
    query.journalId = reqQuery.journalId;
  } else if (reqQuery.allNotes) {
    query.journalId = { $exists: true };
  }
  else {
    query.journalId = { $exists: false };
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
