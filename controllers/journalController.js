import { getDB } from "../config/db.js";

export async function getJournals(userId) {
  const db = getDB();
  const journals = await db.collection("journals").find({ userId }).toArray();
  return journals;
}

export async function addJournal(journal) {
  const db = getDB();
  const result = await db.collection("journals").insertOne(journal);
  return result;
}
export async function updateJournal(journalId, updateData) {
  const db = getDB();
  const result = await db
    .collection("journals")
    .updateOne({ _id: new ObjectId(journalId) }, { $set: updateData });
  return result;
}
export async function deleteJournal(journalId) {
  const db = getDB();
  const result = await db
    .collection("journals")
    .deleteOne({ _id: new ObjectId(journalId) });
  return result;
}
