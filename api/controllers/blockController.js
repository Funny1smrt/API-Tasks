import { getDB } from "../config/db.js";

export async function getBlocks(userId) {
  const db = getDB();
  const blocks = await db.collection("blocks").find({ userId }).toArray();
  return blocks;
}

export async function addBlock(block) {
  const db = getDB();
  const result = await db.collection("blocks").insertOne(block);
  return result; // result.insertedId
}
export async function updateBlock(blockId, updateData) {
  const db = getDB();
  const result = await db
    .collection("blocks")
    .updateOne({ _id: new ObjectId(blockId) }, { $set: updateData });
  return result; // result.modifiedCount
}
export async function deleteBlock(blockId) {
  const db = getDB();
  const result = await db
    .collection("blocks")
    .deleteOne({ _id: new ObjectId(blockId) });
  return result; // result.deletedCount
}
