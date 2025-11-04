import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

// TODO: Доробити tags

export async function getTags(userId) {
  const db = getDB();
  const tags = await db.collection("tags").find({ userId }).toArray();
  return tags;
}

export async function addTag(tag) {
  const db = getDB();
  const result = await db.collection("tags").insertOne(tag);
  return result;
}
export async function updateTag(tagId, updateData) {
  const db = getDB();
  const result = await db
    .collection("tags")
    .updateOne({ _id: new ObjectId(String(tagId)) }, { $set: updateData });
  return result;
}
export async function deleteTag(tagId) {
  const db = getDB();
  const result = await db
    .collection("tags")
    .deleteOne({ _id: new ObjectId(String(tagId)) });
  return result;
}
