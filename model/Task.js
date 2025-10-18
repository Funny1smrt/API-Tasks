import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  userId: { type: String, required: true }, // з Firebase UID
});

export default mongoose.model("Task", taskSchema);
