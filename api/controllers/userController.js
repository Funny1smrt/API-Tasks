import { getDB } from "../config/db.js";
import { ObjectId } from "mongodb";

export async function getUsers() {
    const db = getDB();
    const users = await db.collection("users").find().toArray();
    return users;
}

export async function getUser(userId) {
    const db = getDB();
    const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    return user;
}

export async function updateUser(userId, updateData) {
    const db = getDB();
    const result = await db
        .collection("users")
        .updateOne({ _id: new ObjectId(String(userId)) }, { $set: updateData });
    return result;
}

export async function deleteUser(userId) {
    const db = getDB();
    const result = await db.collection("users").deleteOne({ _id: new ObjectId(String(userId)) });
    return result;
}
