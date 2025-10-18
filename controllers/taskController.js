import Task from "../models/Task.js";

export const getTasks = async (req, res) => {
  const tasks = await Task.find({ userId: req.user.uid });
  res.json(tasks);
};

export const addTask = async (req, res) => {
  const task = await Task.create({ ...req.body, userId: req.user.uid });
  res.status(201).json(task);
};

export const deleteTask = async (req, res) => {
  await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.uid });
  res.json({ message: "Видалено" });
};
