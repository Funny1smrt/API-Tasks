import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function geTasks(userId) {
  const db = getDB();

  if (!userId) {
    throw new Error("userId обов’язковий");
  }

  const query = { userId };

  const tasks = await db
    .collection("tasks")
    .find(query)
    .sort({ createdAt: -1 })
    .toArray();

  return tasks;
}


export async function addTask(task) {
  const db = getDB();
  const result = await db.collection("tasks").insertOne(task);
  return result;
}

export async function updateTask(taskId, updateData) {
  const db = getDB();
  const result = await db
    .collection("tasks")
    .updateOne({ _id: new ObjectId(String(taskId)) }, { $set: updateData });
  return result;
}

export async function deleteTask(taskId) {
  const db = getDB();
  const result = await db
    .collection("tasks")
    .deleteOne({ _id: new ObjectId(String(taskId)) });
  return result;
}
