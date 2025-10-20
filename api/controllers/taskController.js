import { getDB } from "../config/db.js";

export async function getTasks(userId) {
  const db = getDB();
  const tasks = await db.collection("tasks").find({ userId }).toArray();
  return tasks;
}



export async function addTask(task) {
  const db = getDB();
  const result = await db.collection("tasks").insertOne(task);
  return result; // result.insertedId
}

export async function updateTask(taskId, updateData) {
  const db = getDB();
  const result = await db
    .collection("tasks")
    .updateOne({ _id: new ObjectId(taskId) }, { $set: updateData });
  return result; // result.modifiedCount
}

export async function deleteTask(taskId) {
  const db = getDB();
  const result = await db
    .collection("tasks")
    .deleteOne({ _id: new ObjectId(taskId) });
  return result; // result.deletedCount
}
