import { Router } from "express";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  getAllUsersPG,
  createUserPG,
  updateUserPG,
  deleteUserPG,
} from "../../modules/users/users.controller.js";

export const router = Router();

// MongoDB routes (/api/v2/users)
router.get("/", getAllUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

// Supabase / PostgreSQL routes (/api/v2/users/pg)
router.get("/pg", getAllUsersPG);
router.post("/pg", createUserPG);
router.put("/pg/:id", updateUserPG);
router.delete("/pg/:id", deleteUserPG);
