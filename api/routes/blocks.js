import express from "express";
import {
  getBlocks,
  addBlock,
  deleteBlock,
  updateBlock,
} from "../controllers/blockController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", verifyToken, getBlocks);
router.post(
  "/",
  verifyToken,
  (req, res, next) => {
// 🧪 ТИМЧАСОВА ДІАГНОСТИКА: Створюємо чистий об'єкт, щоб уникнути BSONError
    const cleanBody = {};
    for (const key in req.body) {
        if (req.body.hasOwnProperty(key)) {
            // Копіюємо лише прості властивості
            cleanBody[key] = req.body[key]; 
        }
    }
    req.body = cleanBody; // Замінюємо 'брудний' req.body на 'чистий'
    console.log("Cleaned Block:", req.body); 
    next();
  },
  addBlock
);
router.put("/:id", verifyToken, updateBlock);
router.delete("/:id", verifyToken, deleteBlock);

export default router;
