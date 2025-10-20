import mongoose from "mongoose";

const taskSchema = new mongoose.Schema(
  {
    author: { type: String },
    blockId: { type: String, required: true },
    list: { type: Array, default: [] },
    userId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const Task = mongoose.model("Task", taskSchema);

export default Task;
